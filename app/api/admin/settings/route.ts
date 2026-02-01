import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
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
    try {
        const body = await request.json();

        // Loop through keys and save/update
        const keys = Object.keys(body);
        for (const key of keys) {
            // Check if exists
            const existing: any = await query("SELECT setting_key FROM settings WHERE setting_key = ?", [key]);
            if (existing.length > 0) {
                await query("UPDATE settings SET setting_value = ? WHERE setting_key = ?", [body[key], key]);
            } else {
                await query("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)", [key, body[key]]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
