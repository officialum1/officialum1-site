import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Upsert Settings
        if (email) await query("INSERT INTO settings (setting_key, setting_value) VALUES ('admin_email', ?) ON DUPLICATE KEY UPDATE setting_value = ?", [email, email]);

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await query("INSERT INTO settings (setting_key, setting_value) VALUES ('admin_password', ?) ON DUPLICATE KEY UPDATE setting_value = ?", [hashedPassword, hashedPassword]);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
