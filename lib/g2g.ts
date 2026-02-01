import crypto from 'crypto';
import { query } from './db';

// Security: Require environment variables (no fallbacks)
const G2G_API_KEY = process.env.G2G_API_KEY;
const G2G_SECRET_KEY = process.env.G2G_SECRET_KEY;
const G2G_USER_ID = process.env.G2G_USER_ID;
const BASE_URL = "https://api.g2g.com/v1";

// Validate required credentials
if (!G2G_API_KEY || !G2G_SECRET_KEY || !G2G_USER_ID) {
    console.error("FATAL: G2G credentials not configured. Set G2G_API_KEY, G2G_SECRET_KEY, and G2G_USER_ID in environment variables.");
}

interface G2GProduct { } // This line was incomplete in the instruction, assuming it's an empty interface for now.

function generateSignature(path: string, timestamp: string) {
    // Ensure credentials are not undefined before using them
    if (!G2G_API_KEY || !G2G_USER_ID || !G2G_SECRET_KEY) {
        throw new Error("G2G credentials are not set. Cannot generate signature.");
    }
    const stringToSign = path + G2G_API_KEY + G2G_USER_ID + timestamp;
    return crypto.createHmac('sha256', G2G_SECRET_KEY).update(stringToSign).digest('hex');
}

export async function makeG2GRequest(method: string, path: string, body: any = null) {
    // Ensure credentials are not undefined before making a request
    if (!G2G_API_KEY || !G2G_USER_ID || !G2G_SECRET_KEY) {
        console.error("G2G credentials are not set. Cannot make G2G request.");
        return { status: 500, data: { error: "G2G credentials not configured" } };
    }

    const timestamp = Date.now().toString();
    const signaturePath = `/v1${path}`;
    const signature = generateSignature(signaturePath, timestamp);

    const headers = {
        'g2g-api-key': G2G_API_KEY,
        'g2g-timestamp': timestamp,
        'g2g-signature': signature,
        'g2g-userid': G2G_USER_ID,
        'Content-Type': 'application/json'
    };

    const url = `${BASE_URL}${path}`;
    const options: RequestInit = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    let data;
    try {
        const text = await res.text();
        try {
            data = JSON.parse(text);
        } catch {
            data = { error: text || res.statusText };
        }
    } catch (e) {
        data = { error: "Failed to read response" };
    }
    return { status: res.status, data };
}

export async function syncG2GStock(productName: string) {
    try {
        const [product]: any = await query("SELECT g2g_listing_id FROM products WHERE name = ?", [productName]);
        if (!product || !product.g2g_listing_id) return;

        const [counts]: any = await query("SELECT COUNT(*) as count FROM inventory WHERE name = ? AND status = 'In Stock'", [productName]);
        const stockCount = counts[0]?.count || 0;

        console.log(`Syncing G2G Stock for ${productName}: ${stockCount} units (Listing: ${product.g2g_listing_id})`);

        const res = await makeG2GRequest('PATCH', `/products/${product.g2g_listing_id}`, { stock: stockCount });

        if (res.status !== 200 && res.status !== 204) {
            console.error(`G2G Stock Sync Failed for ${productName}:`, res.data);
        }
    } catch (e) {
        console.error(`G2G Stock Sync Error (${productName}):`, e);
    }
}

export async function sendG2GMessage(orderId: string, message: string) {
    try {
        console.log(`Sending G2G Message to Order ${orderId}: ${message.substring(0, 30)}...`);
        const res = await makeG2GRequest('POST', `/orders/${orderId}/chats`, { message });
        if (res.status !== 200 && res.status !== 201) {
            console.error(`G2G Message Failed for ${orderId}:`, res.data);
        }
        return res;
    } catch (e) {
        console.error(`G2G Message Error (${orderId}):`, e);
        return { status: 500, data: { error: e } };
    }
}
