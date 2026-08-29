import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const publicKeys = ['announcement_banner', 'admin_online_status', 'enable_stripe', 'enable_cryptomus', 'enable_binance'];
    const isPublic = publicKeys.includes(key || '');

    if (!isPublic && !await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // 1. CONSISTENT SINGLE KEY HANDLER: Handles single lookup for ALL users (Public & Admin)
        if (key) {
            const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = ?", [key]);
            return NextResponse.json({ value: rows[0]?.setting_value });
        }

        // 2. PUBLIC LOGIC: Handle global settings fetch for unauthenticated users
        if (!await isAuthenticated()) {
            const rows: any = await query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN (?)", [publicKeys]);
            const publicSettings: any = {};
            rows.forEach((s: any) => publicSettings[s.setting_key] = s.setting_value);
            return NextResponse.json(publicSettings);
        }

        const settingsRes: any = await query("SELECT * FROM settings");
        const settings: any = {};
        settingsRes.forEach((s: any) => settings[s.setting_key] = s.setting_value);

        // Pre-fill with Env vars if missing in DB (Migration helper)
        if (!settings['g2g_api_key'] && process.env.G2G_API_KEY) settings['g2g_api_key'] = process.env.G2G_API_KEY;
        if (!settings['g2g_secret_key'] && process.env.G2G_SECRET_KEY) settings['g2g_secret_key'] = process.env.G2G_SECRET_KEY;
        if (!settings['g2g_user_id'] && process.env.G2G_USER_ID) settings['g2g_user_id'] = process.env.G2G_USER_ID;
        if (!settings['g2g_order_webhook_secret'] && process.env.ORDER_WEBHOOK_SECRET) settings['g2g_order_webhook_secret'] = process.env.ORDER_WEBHOOK_SECRET;
        if (!settings['g2g_offer_webhook_secret'] && process.env.OFFER_WEBHOOK_SECRET) settings['g2g_offer_webhook_secret'] = process.env.OFFER_WEBHOOK_SECRET;

        return NextResponse.json(settings);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const adminPass = request.headers.get('X-Admin-Password');
    const isExtension = adminPass === process.env.ADMIN_PASSWORD;

    if (!isExtension && !await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();

        // 1. Single Key-Value Update (Simpler API)
        if (body.key && body.value !== undefined) {
            const val = String(body.value); // Ensure string storage
            await query(`
                INSERT INTO settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `, [body.key, val]);
            return NextResponse.json({ success: true });
        }

        // 2. Default Object Update Logic
        // SPECIAL: Extension Session Sync
        if (body.action === 'save_session') {
            const { site, cookies } = body;
            const key = `session_cookies_${site.replace(/\./g, '_')}`;
            await query(`
                INSERT INTO settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `, [key, cookies]);
            return NextResponse.json({ success: true, message: "Session Saved" });
        }

        const keys = Object.keys(body);

        // Prepare queries for atomic updates
        const promises = keys.map(key => {
            // Skip empty keys if necessary, or trim values
            if (!key) return Promise.resolve();
            const value = typeof body[key] === 'string' ? body[key].trim() : body[key];

            return query(`
                INSERT INTO settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `, [key, value]);
        });

        await Promise.all(promises);

        console.log(`Saved ${keys.length} settings successfully.`);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Settings Save Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
