import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "famemake_secure_2024";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        // Check DB for custom password
        let adminPass = DEFAULT_ADMIN_PASSWORD;
        try {
            const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
            if (rows.length > 0 && rows[0].setting_value) {
                adminPass = rows[0].setting_value;
            }
        } catch (e) {
            // Table might not exist yet if initDB hasn't run, fallback to default
        }

        if (password === adminPass) {
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
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
