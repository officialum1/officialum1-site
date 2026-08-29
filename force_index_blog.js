const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

const SCOPES = [
    'https://www.googleapis.com/auth/indexing',
    'https://www.googleapis.com/auth/webmasters.readonly'
];

async function trigger() {
    const url = 'https://officialum1.com/blog/best-web-design-services-pakistan';
    console.log("🚀 FORCE TRIGGERING INDEXING FOR:", url);
    
    try {
        const keyPath = path.join(__dirname, 'officialum1-35bbd9bf5678.json');
        const auth = new google.auth.GoogleAuth({
            keyFile: keyPath,
            scopes: SCOPES,
        });

        const authClient = await auth.getClient();
        const indexing = google.indexing({ version: 'v3', auth: authClient });

        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: 'URL_UPDATED',
            },
        });

        console.log("✅ SUCCESS! GOOGLE INDEXING RESPONSE:");
        console.log(JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("❌ FAILED TO FORCE INDEX:");
        console.error(e.message);
    }
}

trigger();
