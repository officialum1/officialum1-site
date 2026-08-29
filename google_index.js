const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const KEY_FILE = path.join(__dirname, 'officialum1-35bbd9bf5678.json');

if (!fs.existsSync(KEY_FILE)) {
    console.error('Error: officialum1-35bbd9bf5678.json not found.');
    process.exit(1);
}

const SCOPES = ['https://www.googleapis.com/auth/indexing'];

async function getIndexingClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
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
