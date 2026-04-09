const { google } = require('googleapis');
const fs = require('fs');

const SCOPES = ['https://www.googleapis.com/auth/indexing'];

async function getIndexingClient() {
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || '';
    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';
    if (!keyPath && !keyJson) {
        console.error('Error: set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.');
        process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
        ...(keyJson ? { credentials: JSON.parse(keyJson) } : { keyFile: keyPath }),
        scopes: SCOPES,
    });
    const authClient = await auth.getClient();
    return google.indexing({ version: 'v3', auth: authClient });
}

async function notifyGoogle(url, type = 'URL_UPDATED') {
    const indexing = await getIndexingClient();
    try {
        await indexing.urlNotifications.publish({
            requestBody: {
                url,
                type,
            },
        });
        console.log(`[SUCCESS] Google notified for: ${url}`);
    } catch (err) {
        console.error(`[ERROR] Notification failed for: ${url}`);
        console.error('Error Details:', err.response ? JSON.stringify(err.response.data) : err.message);
    }
}

const targetUrl = process.argv[2];
if (!targetUrl) {
    console.log('Usage: node google_index.js <url>');
    process.exit(1);
}

notifyGoogle(targetUrl);
