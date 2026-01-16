import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "famemake_secure_2024";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { password } = body;

        if (password === ADMIN_PASSWORD) {
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
