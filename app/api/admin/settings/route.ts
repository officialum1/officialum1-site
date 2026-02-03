import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
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
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await request.json();
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
