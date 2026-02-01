import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!DEFAULT_ADMIN_PASSWORD) {
    console.error("FATAL: ADMIN_PASSWORD not configured");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        // Check DB for custom password
        let storedPass = DEFAULT_ADMIN_PASSWORD;
        let isDefault = true;

        try {
            const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
            if (rows.length > 0 && rows[0].setting_value) {
                storedPass = rows[0].setting_value;
                isDefault = false;
            }
        } catch (e) {
            // Table might not exist yet if initDB hasn't run, fallback to default
        }

        let isValid = false;

        if (isDefault) {
            // Default is always plain text
            if (storedPass && password === storedPass) isValid = true;
        } else {
            // Check if it matches hash
            if (storedPass) {
                const isMatch = await bcrypt.compare(password, storedPass).catch(() => false);
                if (isMatch) {
                    isValid = true;
                } else if (password === storedPass) {
                    // Fallback: It was stored as plain text, match and migrate
                    isValid = true;
                    const newHash = await bcrypt.hash(password, 10);
                    await query("UPDATE settings SET setting_value = ? WHERE setting_key = 'admin_password'", [newHash]);
                }
            }
        }

        if (isValid) {
            const response = NextResponse.json({ success: true });
            response.cookies.set('admin_token', 'authenticated_session_v1', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });
            return response;
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
