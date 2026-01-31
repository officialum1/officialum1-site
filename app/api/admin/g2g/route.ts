import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Configuration (Should ideally be in env but using user's hardcoded values as fallback)
const G2G_API_KEY = process.env.G2G_API_KEY || "AZES6HAPUIXTNK6ATCLIGHOMNF2TRLH6";
const G2G_SECRET_KEY = process.env.G2G_SECRET_KEY || "asWMg3K5xwxHiAMr0LxGHkEDx0Z7XnXzJsJ1V3feRV2";
const G2G_USER_ID = process.env.G2G_USER_ID || "7788063";
const G2G_BASE_URL = "https://open-api.g2g.com/v2";

function generateSignature(path: string, timestamp: string) {
    // G2G Signature: url_path + api_key + user_id + timestamp
    const stringToSign = path + G2G_API_KEY + G2G_USER_ID + timestamp;
    return crypto.createHmac('sha256', G2G_SECRET_KEY).update(stringToSign).digest('hex');
}

async function makeG2GRequest(method: string, path: string, body: any = null) {
    const timestamp = Date.now().toString();
    // Signature path must start with /v2
    const signaturePath = `/v2${path}`;
    const signature = generateSignature(signaturePath, timestamp);

    const headers = {
        'g2g-api-key': G2G_API_KEY,
        'g2g-timestamp': timestamp,
        'g2g-signature': signature,
        'g2g-userid': G2G_USER_ID,
        'Content-Type': 'application/json'
    };

    const url = `${G2G_BASE_URL}${path}`;

    const options: RequestInit = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const data = await res.json();
    return { status: res.status, data };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');

    try {
        if (action === 'get_order') {
            if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
            const result = await makeG2GRequest('GET', `/orders/${orderId}`);
            return NextResponse.json(result.data, { status: result.status });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, orderId, delivery_details } = body;

        if (action === 'deliver_order') {
            if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
            // G2G Delivery endpoint: POST /orders/{order_id}/delivery
            const result = await makeG2GRequest('POST', `/orders/${orderId}/delivery`, delivery_details);
            return NextResponse.json(result.data, { status: result.status });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
