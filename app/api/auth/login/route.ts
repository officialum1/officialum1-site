import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { setAdminSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const results: any = await query("SELECT * FROM users WHERE email = ? OR username = ?", [email, email]);

        if (results.length > 0) {
            const user = results[0];

            // Verify Password (Hash only - no plaintext fallback)
            const isMatch = await bcrypt.compare(password, user.password).catch(() => false);

            if (!isMatch) {
                return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
            }

            if (user.role === 'admin' || user.role === 'seller') {
                await setAdminSession();
            }

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
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Auth Error" }, { status: 500 });
    }
}

