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
