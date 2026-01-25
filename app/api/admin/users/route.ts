import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email';

export async function GET() {
    try {
        const users = await query('SELECT id, email, role, telegram, is_verified, created_at, referral_code FROM users ORDER BY created_at DESC');
        return NextResponse.json(users);
    } catch (error) {
        console.error('Fetch Users Error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { action, userId, email } = await request.json();

        if (action === 'resend_registration') {
            const user: any = await query("SELECT verification_token FROM users WHERE id = ?", [userId]);
            if (user.length === 0) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            const token = user[0].verification_token;
            const origin = request.headers.get('origin') || 'https://officialum1.com';
            const verifyLink = `${origin}/verify-email?token=${token}`;

            await sendAuditReport(email, "Verify Your Account - OfficialUM1", {
                da: "ACTION REQUIRED",
                pa: "Verify Email",
                links: 0,
                details: `Please verify your email to unlock all features.\n\n<a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:5px;">Verify Account</a>`
            }, {});

            return NextResponse.json({ success: true });
        }

        if (action === 'resend_forgot') {
            const resetToken = Math.random().toString(36).substring(2, 10).toUpperCase();
            await query("UPDATE users SET reset_token = ? WHERE id = ?", [resetToken, userId]);

            await sendAuditReport(email, "Password Reset Request", {
                da: "RESET PASSWORD",
                pa: "Action Required",
                links: 0,
                details: `Your Temporary Reset Code is: **${resetToken}**\n\n(Use this code to login, then change your password in settings)`
            }, {});

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, email, password, telegram, role } = body;

        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        let sql = "UPDATE users SET email = ?, telegram = ?, role = ?";
        let params = [email, telegram || '', role || 'buyer'];

        if (password) {
            sql += ", password = ?";
            params.push(password);
        }

        sql += " WHERE id = ?";
        params.push(id);

        await query(sql, params);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

        await query('DELETE FROM users WHERE id = ?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
