import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SCOPES = [
    'https://www.googleapis.com/auth/indexing',
    'https://www.googleapis.com/auth/webmasters.readonly'
];

export async function getUrlStatus(url: string) {
    try {
        const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || '';
        const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';
        const credentials = keyJson ? JSON.parse(keyJson) : undefined;
        const auth = new google.auth.GoogleAuth({
            ...(credentials ? { credentials } : keyPath ? { keyFile: keyPath } : {}),
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
        const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || '';
        const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '';
        if (!keyPath && !keyJson) {
            console.error('Google Indexing Error: Set GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.');
            return;
        }

        const auth = new google.auth.GoogleAuth({
            ...(keyJson ? { credentials: JSON.parse(keyJson) } : { keyFile: keyPath }),
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
