import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const user = await query("SELECT * FROM users WHERE id = ?", [id]) as any[];
            return NextResponse.json(user[0] || {});
        }

        const users = await query(`
            SELECT 
                u.id, 
                u.email, 
                u.telegram, 
                u.role, 
                u.wallet_balance, 
                u.affiliate_balance,
                u.referral_code, 
                u.created_at, 
                u.is_banned, 
                u.is_verified,
                u.membership,
                u.membership_expires,
                u.total_spent,
                (SELECT COUNT(*) FROM users ref WHERE ref.referred_by = u.referral_code) as referral_count
            FROM users u 
            ORDER BY u.created_at DESC
        `);
        return NextResponse.json(users);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, action, amount, email } = body;

        if (action === 'ban') {
            await query("UPDATE users SET is_banned = 1 WHERE id = ?", [userId]);
        } else if (action === 'unban') {
            await query("UPDATE users SET is_banned = 0 WHERE id = ?", [userId]);
        } else if (action === 'add_balance') {
            await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [amount, userId]);
            await query("INSERT INTO wallet_transactions (user_id, amount, type, description, status) VALUES (?, ?, 'deposit', 'Admin Adjustment', 'completed')",
                [userId, amount]);
        } else if (action === 'resend_registration' || action === 'resend_forgot') {
            // Mock email sending for now, or integrate with email service
            console.log(`[Mock Email] Sending ${action} to ${email}`);
            return NextResponse.json({ success: true, message: 'Email queued' });
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, email, password, telegram, role } = body;

        const updates = [];
        const values = [];

        if (email) { updates.push("email = ?"); values.push(email); }
        if (password) { updates.push("password = ?"); values.push(password); } // Ideally hash this
        if (telegram) { updates.push("telegram = ?"); values.push(telegram); }
        if (role) { updates.push("role = ?"); values.push(role); }
        if (body.membership) { updates.push("membership = ?"); values.push(body.membership); }

        if (updates.length > 0) {
            values.push(id);
            await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await query("DELETE FROM users WHERE id = ?", [id]);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
