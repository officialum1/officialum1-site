import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { sendAuditReport } from '@/lib/email';
import { query } from '@/lib/db';

const METRICS_DB_PATH = path.join(process.cwd(), 'data', 'domain_metrics.json');
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

async function getSettings() {
    try {
        // Fetch from SQL Settings Table
        const rows: any = await query("SELECT * FROM settings");
        const settings: any = {};
        rows.forEach((r: any) => settings[r.setting_key] = r.setting_value);
        return settings;
    } catch { return {}; }
}

export async function POST(req: Request) {
    try {
        const { url, email } = await req.json();

        // Load Settings
        const settings = await getSettings();

        if (!url || !email) {
            return NextResponse.json({ error: "URL and Email are required" }, { status: 400 });
        }

        // Clean URL to get domain (simple version)
        const domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0].toLowerCase();

        let shouldScan = true;
        let da = 0, pa = 0, links = 0, details = [];
        let metricsDb = [];

        // 1. Check Local Database (Our "Own Database")
        try {
            const dbContent = await fs.readFile(METRICS_DB_PATH, 'utf8');
            metricsDb = JSON.parse(dbContent);

            const cachedEntry = metricsDb.find((m: any) => m.domain === domain);

            if (cachedEntry) {
                const age = Date.now() - cachedEntry.lastUpdated;
                if (age < ONE_WEEK_MS) {
                    // Cache is fresh (< 1 week)
                    shouldScan = false;
                    da = cachedEntry.da;
                    pa = cachedEntry.pa;
                    links = cachedEntry.links;
                    details = cachedEntry.details || ["Retrieved from OfficialUM1 Database"];
                    details.push("Data is fresh (Updated < 7 days ago)");
                } else {
                    // Cache expired, remove it to re-add later
                    metricsDb = metricsDb.filter((m: any) => m.domain !== domain);
                }
            }
        } catch (e) {
            // DB might not exist yet, we will create it on save
        }

        // 2. Perform Scan if needed
        if (shouldScan) {
            let mozDataFound = false;

            // A. Try Official Moz API (From Settings)
            const mozId = settings.mozId || process.env.MOZ_ACCESS_ID;
            const mozKey = settings.mozKey || process.env.MOZ_SECRET_KEY;

            if (mozId && mozKey) {
                try {
                    const auth = Buffer.from(`${mozId}:${mozKey}`).toString('base64');
                    const response = await fetch('https://lsapi.seomoz.com/v2/url_metrics', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Basic ${auth}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            targets: [url]
                        })
                    });

                    const data = await response.json();

                    if (data && data.results && data.results[0]) {
                        const res = data.results[0];
                        da = res.domain_authority || 0;
                        pa = res.page_authority || 0;
                        links = res.external_equity_links || 0;

                        details.push("Verified Data from Moz API");
                        details.push(`spam_score: ${res.spam_score || 0}%`);
                        mozDataFound = true;
                    }
                } catch (mozError) {
                    console.error("Moz API Failed, falling back to estimation:", mozError);
                }
            }

            if (!mozDataFound) {
                try {
                    // Fallback to Live Estimation Engine


                    const res = await fetch(url, { headers: { 'User-Agent': 'OfficialUM1-Authority-Check/1.0' }, signal: AbortSignal.timeout(5000) });
                    const html = await res.text();

                    // Base Score Calculation
                    let baseScore = 15;
                    const newDetails = [];

                    if (url.includes('https://')) { baseScore += 10; newDetails.push("Secured with HTTPS"); }

                    const wordCount = html.split(' ').length;
                    if (wordCount > 2000) { baseScore += 15; newDetails.push("High Authority Content (>2000 words)"); }
                    else if (wordCount > 800) { baseScore += 8; }

                    const outboundLinks = (html.match(/href=["'](http|https):/g) || []).length;
                    links = outboundLinks;
                    if (outboundLinks > 50) { baseScore += 10; newDetails.push(`High Connectivity (${outboundLinks} valid links)`); }

                    if (html.includes('react') || html.includes('next')) { baseScore += 5; newDetails.push("Modern Tech Stack Detected"); }
                    if (html.match(/facebook|twitter|linkedin|instagram/i)) { baseScore += 10; newDetails.push("Social Authority Signals"); }

                    // Calculate & Normalize
                    da = Math.min(92, baseScore + Math.floor(Math.random() * 5));
                    pa = Math.max(0, da - 4);

                    if (da < 20) newDetails.push("New or Low Authority Domain");

                    details = newDetails;

                    // DATA PERSISTENCE: Save to our DB
                    const newEntry = {
                        domain,
                        da,
                        pa,
                        links,
                        details,
                        lastUpdated: Date.now()
                    };
                    metricsDb.push(newEntry);

                    // Write back to DB
                    // Ensure dir exists
                    const dbDir = path.dirname(METRICS_DB_PATH);
                    try { await fs.access(dbDir); } catch { await fs.mkdir(dbDir, { recursive: true }); }
                    await fs.writeFile(METRICS_DB_PATH, JSON.stringify(metricsDb, null, 2));

                } catch (e) {
                    details.push("Site is not easily crawlable (Check manually)");
                    da = 12; pa = 8;
                }
            } // Close !mozDataFound block

            // Cache Moz Data if found
            if (mozDataFound) {
                const newEntry = { domain, da, pa, links, details, lastUpdated: Date.now() };
                metricsDb.push(newEntry);
                const dbDir = path.dirname(METRICS_DB_PATH);
                try { await fs.access(dbDir); } catch { await fs.mkdir(dbDir, { recursive: true }); }
                await fs.writeFile(METRICS_DB_PATH, JSON.stringify(metricsDb, null, 2));
            }
        } // Close shouldScan block

        // 3. Save Lead (Admin Notification)
        const dataFilePath = path.join(process.cwd(), 'data', 'messages.json');
        let messages = [];
        try {
            const fileContents = await fs.readFile(dataFilePath, 'utf8');
            messages = JSON.parse(fileContents);
        } catch { }

        messages.unshift({
            id: Date.now(),
            date: new Date().toLocaleString(),
            name: "Authority Check User",
            email,
            service: "Backlink Analysis",
            message: `Requested DA/PA Check for ${url}. result: DA ${da} / PA ${pa}`,
            status: 'new',
            reportDetails: {
                url, m: 'db_update', da, pa, links, type: 'Backlink/Authority Check'
            }
        });


        await fs.writeFile(dataFilePath, JSON.stringify(messages, null, 2));

        // 4. Send Auto-Email to User
        const emailSent = await sendAuditReport(email, url, { da, pa, links, details }, settings);

        return NextResponse.json({
            success: true,
            da,
            pa,
            links,
            details,
            source: shouldScan ? 'Live Scan' : 'Database Cache',
            emailSent
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
