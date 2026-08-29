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

/**
 * Notifies Google about a URL modification
 */
async function notifyGoogle(indexing, url, type = 'URL_UPDATED') {
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

// Example URLs - you can expand this list or read from your sitemap
const urlsToIndex = [
    'https://officialum1.com',
    'https://officialum1.com/shop',
    'https://officialum1.com/blog',
    'https://officialum1.com/reviews',
    'https://officialum1.com/about',
    'https://officialum1.com/faq',
    'https://officialum1.com/services',
];

async function indexAll() {
    const indexing = await getIndexingClient();
    console.log(`Starting indexing for ${urlsToIndex.length} URLs...`);
    for (const url of urlsToIndex) {
        await notifyGoogle(indexing, url);
        // Avoid hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log('All done!');
}

indexAll();
