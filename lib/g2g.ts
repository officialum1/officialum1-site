import crypto from 'crypto';

const G2G_API_KEY = process.env.G2G_API_KEY || "AZES6HAPUIXTNK6ATCLIGHOMNF2TRLH6";
const G2G_SECRET_KEY = process.env.G2G_SECRET_KEY || "asWMg3K5xwxHiAMr0LxGHkEDx0Z7XnXzJsJ1V3feRV2";
const G2G_USER_ID = process.env.G2G_USER_ID || "7788063";
const G2G_BASE_URL = "https://open-api.g2g.com/v2";

function generateSignature(path: string, timestamp: string) {
    const stringToSign = path + G2G_API_KEY + G2G_USER_ID + timestamp;
    return crypto.createHmac('sha256', G2G_SECRET_KEY).update(stringToSign).digest('hex');
}

export async function makeG2GRequest(method: string, path: string, body: any = null) {
    const timestamp = Date.now().toString();
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
