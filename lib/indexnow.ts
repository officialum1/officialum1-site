/**
 * OfficialUM1 IndexNow Automation Engine
 * Supports Bing, Microsoft Copilot, Yahoo, Yandex, Seznam, and partner search engines.
 */

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'd71a8e94e2b047a0b3e5890c21345f78';
export const INDEXNOW_HOST = process.env.NEXT_PUBLIC_SITE_DOMAIN || 'officialum1.com';
export const INDEXNOW_KEY_LOCATION = `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`;

const INDEXNOW_ENDPOINTS = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
];

export interface IndexNowResponse {
    success: boolean;
    status: number;
    endpoint: string;
    submittedCount: number;
    message?: string;
}

/**
 * Submit single or multiple URLs (up to 10,000 per batch) to IndexNow API
 */
export async function submitToIndexNow(urls: string | string[]): Promise<IndexNowResponse[]> {
    const rawList = Array.isArray(urls) ? urls : [urls];
    
    // Filter and sanitize URLs
    const sanitizedList = Array.from(
        new Set(
            rawList
                .map(u => u.trim())
                .filter(u => u.startsWith('http://') || u.startsWith('https://'))
        )
    );

    if (sanitizedList.length === 0) {
        return [{
            success: false,
            status: 400,
            endpoint: INDEXNOW_ENDPOINTS[0],
            submittedCount: 0,
            message: 'No valid URLs to submit',
        }];
    }

    // IndexNow allows max 10,000 URLs per request batch
    const batches: string[][] = [];
    const BATCH_SIZE = 10000;
    for (let i = 0; i < sanitizedList.length; i += BATCH_SIZE) {
        batches.push(sanitizedList.slice(i, i + BATCH_SIZE));
    }

    const results: IndexNowResponse[] = [];

    for (const batch of batches) {
        const payload = {
            host: INDEXNOW_HOST,
            key: INDEXNOW_KEY,
            keyLocation: INDEXNOW_KEY_LOCATION,
            urlList: batch,
        };

        // Submit to primary IndexNow gateway
        let submitted = false;
        for (const endpoint of INDEXNOW_ENDPOINTS) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                    },
                    body: JSON.stringify(payload),
                });

                const isSuccess = res.status === 200 || res.status === 202;
                results.push({
                    success: isSuccess,
                    status: res.status,
                    endpoint,
                    submittedCount: batch.length,
                    message: isSuccess
                        ? `Successfully submitted ${batch.length} URLs to ${endpoint}`
                        : `Received HTTP ${res.status} from ${endpoint}`,
                });

                if (isSuccess) {
                    submitted = true;
                    console.log(`[INDEXNOW] Successfully submitted ${batch.length} URLs to ${endpoint} (HTTP ${res.status})`);
                    break; // IndexNow automatically shares with all participating search engines
                }
            } catch (err: any) {
                console.error(`[INDEXNOW] Failed to push to ${endpoint}:`, err?.message || err);
                results.push({
                    success: false,
                    status: 500,
                    endpoint,
                    submittedCount: 0,
                    message: err?.message || 'Network error',
                });
            }
        }

        if (!submitted) {
            console.warn(`[INDEXNOW] Warning: All IndexNow endpoints returned non-200/202 for batch of ${batch.length} URLs`);
        }
    }

    return results;
}
