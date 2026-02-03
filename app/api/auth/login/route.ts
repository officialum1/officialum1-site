import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const results: any = await query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);

        if (results.length > 0) {
            const user = results[0];
            const cookieStore = await cookies();

            // Set HttpOnly Cookie for session persistence
            cookieStore.set('admin_token', 'authenticated_session_v1', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 1 week
            });

            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    permissions: user.permissions
                }
            });
        } else {
            // BACKWARD COMPAT (Fallback to JSON if DB fails/empty but not likely needed if we start fresh)
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Auth Error" }, { status: 500 });
    }
}
