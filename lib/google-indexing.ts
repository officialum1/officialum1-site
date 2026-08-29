import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SCOPES = [
    'https://www.googleapis.com/auth/indexing',
    'https://www.googleapis.com/auth/webmasters.readonly'
];

export async function getUrlStatus(url: string) {
    try {
        const keyPath = path.join(process.cwd(), 'officialum1-35bbd9bf5678.json');
        const auth = new google.auth.GoogleAuth({
            keyFile: keyPath,
            scopes: SCOPES,
        });

        const authClient = await auth.getClient();
        const searchConsole = google.searchconsole({ version: 'v1', auth: authClient as any });

        // URL Inspection API
        const response = await searchConsole.urlInspection.index.inspect({
            requestBody: {
                inspectionUrl: url,
                siteUrl: 'https://officialum1.com/', // Must end with / if it's a domain property
            },
        });

        return response.data.inspectionResult;
    } catch (error: any) {
        console.error(`[SEARCH CONSOLE] Failed to inspect: ${url}`, error.message);
        return null;
    }
}

export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
    try {
        const keyPath = path.join(process.cwd(), 'officialum1-35bbd9bf5678.json');

        if (!fs.existsSync(keyPath)) {
            console.error('Google Indexing Error: Key file not found at', keyPath);
            return;
        }

        const auth = new google.auth.GoogleAuth({
            keyFile: keyPath,
            scopes: SCOPES,
        });

        const authClient = await auth.getClient();
        const indexing = google.indexing({ version: 'v3', auth: authClient as any });

        await indexing.urlNotifications.publish({
            requestBody: {
                url,
                type,
            },
        });

        console.log(`[GOOGLE INDEXING] Success for: ${url}`);
    } catch (error: any) {
        console.error(`[GOOGLE INDEXING] Failed for: ${url}`, error.message);
    }
}
