import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: 'Please enter a valid website URL' }, { status: 400 });
        }

        let targetUrl = url.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
            targetUrl = `https://${targetUrl}`;
        }

        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        let response;
        try {
            response = await fetch(targetUrl, {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; OfficialUM1-SpeedScanner/2.0; +https://officialum1.com)',
                    'Accept-Encoding': 'gzip, deflate, br',
                },
            });
        } catch (fetchErr: any) {
            clearTimeout(timeoutId);
            return NextResponse.json({
                error: `Unable to connect to ${targetUrl}. Please ensure the domain is active.`,
            }, { status: 400 });
        }
        clearTimeout(timeoutId);

        const responseTime = Date.now() - startTime;
        const html = await response.text();
        const pageSizeKb = Math.round(new Blob([html]).size / 1024);

        const isHttps = targetUrl.startsWith('https://');
        const hasCompression = Boolean(response.headers.get('content-encoding'));
        const serverHeader = response.headers.get('server') || 'Unknown';
        const hasCaching = Boolean(response.headers.get('cache-control') || response.headers.get('etag'));

        // HTML checks
        const hasMetaDescription = /<meta\s+name=["']description["']/i.test(html);
        const hasViewport = /<meta\s+name=["']viewport["']/i.test(html);
        const hasH1 = /<h1[^>]*>/i.test(html);
        const isWordPress = /wp-content|wp-includes|wordpress/i.test(html);
        const isWooCommerce = /woocommerce/i.test(html);
        const hasNextJs = /__NEXT_DATA__|_next/i.test(html);

        // Calculate score
        let score = 95;
        const issues: Array<{ title: string; desc: string; severity: 'high' | 'medium' | 'low' }> = [];
        const passed: Array<{ title: string; desc: string }> = [];

        if (responseTime > 1200) {
            score -= 30;
            issues.push({
                title: 'High Server Response Time (TTFB)',
                desc: `Server took ${responseTime}ms to respond. Google recommends under 200ms.`,
                severity: 'high',
            });
        } else if (responseTime > 500) {
            score -= 15;
            issues.push({
                title: 'Moderate TTFB Latency',
                desc: `Response time was ${responseTime}ms. Edge caching can cut this below 150ms.`,
                severity: 'medium',
            });
        } else {
            passed.push({
                title: 'Fast Initial Server Response',
                desc: `Server responded quickly in ${responseTime}ms.`,
            });
        }

        if (pageSizeKb > 1500) {
            score -= 20;
            issues.push({
                title: 'Heavy HTML / Document Payload',
                desc: `Initial document size is ${pageSizeKb} KB. Page builder bloat or inline CSS detected.`,
                severity: 'high',
            });
        } else {
            passed.push({
                title: 'Lightweight Document Size',
                desc: `Initial HTML weight is clean (${pageSizeKb} KB).`,
            });
        }

        if (!hasCompression) {
            score -= 12;
            issues.push({
                title: 'Missing Gzip / Brotli Compression',
                desc: 'Text assets are not compressed over the wire, increasing bandwidth and load times.',
                severity: 'medium',
            });
        } else {
            passed.push({
                title: 'Brotli/Gzip Compression Enabled',
                desc: `Assets compressed via ${response.headers.get('content-encoding')}.`,
            });
        }

        if (!hasCaching) {
            score -= 10;
            issues.push({
                title: 'Static Asset Caching Incomplete',
                desc: 'Cache-Control headers are missing, forcing repeat visitors to re-download assets.',
                severity: 'medium',
            });
        }

        if (!isHttps) {
            score -= 15;
            issues.push({
                title: 'Insecure Connection (No HTTPS/SSL)',
                desc: 'Site is served over plain HTTP, risking Google security warnings and visitor drops.',
                severity: 'high',
            });
        }

        // Clamp score
        score = Math.max(25, Math.min(100, score));

        // Tech stack tag
        const stack = isWordPress
            ? isWooCommerce
                ? 'WordPress + WooCommerce'
                : 'WordPress Monolith'
            : hasNextJs
            ? 'Next.js React Framework'
            : 'Custom Web Stack';

        return NextResponse.json({
            url: targetUrl,
            score,
            responseTimeMs: responseTime,
            pageSizeKb,
            stack,
            serverHeader,
            isHttps,
            hasCompression,
            issues,
            passed,
            summary:
                score >= 85
                    ? 'Good performance! Minor optimizations can help lock 95+ Core Web Vitals.'
                    : score >= 60
                    ? 'Average speed. Server latency and payload size are hurting mobile conversion rates.'
                    : 'Critical speed bottlenecks detected. 30%-40% of mobile buyers leave due to slow TTFB and bloat.',
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'Audit failed. Please check the URL and try again.' }, { status: 500 });
    }
}
