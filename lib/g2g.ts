import crypto from 'crypto';
import { query } from './db';

const BASE_URL = "https://api.g2g.com/v1";

interface G2GProduct { }

export async function getG2GCredentials() {
    // Try env first, then DB
    let apiKey = process.env.G2G_API_KEY;
    let secretKey = process.env.G2G_SECRET_KEY;
    let userId = process.env.G2G_USER_ID;
    let orderWebhookSecret = process.env.ORDER_WEBHOOK_SECRET;
    let offerWebhookSecret = process.env.OFFER_WEBHOOK_SECRET;

    if (!apiKey || !secretKey || !userId || !orderWebhookSecret || !offerWebhookSecret) {
        try {
            const settings: any = await query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('g2g_api_key', 'g2g_secret_key', 'g2g_user_id', 'g2g_order_webhook_secret', 'g2g_offer_webhook_secret')");
            const map: any = {};
            settings.forEach((s: any) => map[s.setting_key] = s.setting_value);

            apiKey = apiKey || map['g2g_api_key'];
            secretKey = secretKey || map['g2g_secret_key'];
            userId = userId || map['g2g_user_id'];
            orderWebhookSecret = orderWebhookSecret || map['g2g_order_webhook_secret'];
            offerWebhookSecret = offerWebhookSecret || map['g2g_offer_webhook_secret'];
        } catch (e) {
            console.error("Failed to fetch G2G credentials from DB:", e);
        }
    }

    return { apiKey, secretKey, userId, orderWebhookSecret, offerWebhookSecret };
}

function generateSignature(path: string, timestamp: string, apiKey: string, secretKey: string, userId: string) {
    const stringToSign = path + apiKey + userId + timestamp;
    return crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
}

export async function makeG2GRequest(method: string, path: string, body: any = null) {
    const { apiKey, secretKey, userId } = await getG2GCredentials();

    if (!apiKey || !secretKey || !userId) {
        console.error("G2G credentials are not set (Env or DB). Cannot make G2G request.");
        return { status: 500, data: { error: "G2G credentials not configured" } };
    }

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signaturePath = `/v1${path}`;
    const signature = generateSignature(signaturePath, timestamp, apiKey, secretKey, userId);

    const headers: any = {
        'G2G-API-KEY': apiKey,
        'G2G-TIMESTAMP': timestamp,
        'G2G-SIGNATURE': signature,
        'G2G-USERID': userId,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
