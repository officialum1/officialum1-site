import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

const SCOPES = [
    'https://www.googleapis.com/auth/indexing',
    'https://www.googleapis.com/auth/webmasters.readonly'
];

const INDEXNOW_KEY = 'd71a8e94e2b047a0b3e5890c21345f78';
const INDEXNOW_HOST = 'officialum1.com';

export async function getUrlStatus(url: string) {
    try {
        const keyPath = path.join(process.cwd(), 'officialum1-35bbd9bf5678.json');
        if (!fs.existsSync(keyPath)) {
            return null;
        }
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
                siteUrl: 'https://officialum1.com/',
            },
        });

        return response.data.inspectionResult;
    } catch (error: any) {
        console.error(`[SEARCH CONSOLE] Failed to inspect: ${url}`, error.message);
        return null;
    }
}

export async function notifyIndexNowBing(url: string | string[]) {
    try {
        const urlList = Array.isArray(url) ? url : [url];
        const payload = {
            host: INDEXNOW_HOST,
            key: INDEXNOW_KEY,
            keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
            urlList: urlList,
        };

        const res = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload),
        });

        if (res.status === 200 || res.status === 202) {
            console.log(`[INDEXNOW BING] Successfully pushed ${urlList.length} URL(s)`);
            return true;
        } else {
            console.warn(`[INDEXNOW BING] Response status ${res.status}`);
            return false;
        }
    } catch (e: any) {
        console.error('[INDEXNOW BING] Failed to push:', e.message);
        return false;
    }
}

export async function notifyGoogleIndexing(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED') {
    // 1. Always notify Microsoft Bing & IndexNow
    await notifyIndexNowBing(url);

    // 2. Notify Google if service account key is available
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
        console.error(`[GOOGLE INDEXING] Notice: ${url}`, error.message);
    }
}
