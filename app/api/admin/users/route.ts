import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const email = searchParams.get('email');

        if (id) {
            const user = await query("SELECT * FROM users WHERE id = ?", [id]) as any[];
            return NextResponse.json(user[0] || {});
        }

        if (email) {
            const user = await query("SELECT id, email, role FROM users WHERE email = ?", [email]) as any[];
            return NextResponse.json(user);
        }

        // Fetch Registered Users
        const registeredUsers = await query(`
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
                u.points,
                (SELECT COUNT(*) FROM users ref WHERE ref.referred_by = u.referral_code) as referral_count,
                FALSE as is_guest
            FROM users u 
            ORDER BY u.created_at DESC
        `) as any[];

        // Fetch Unique Guest Emails from Orders
        const guestBuyers = await query(`
            SELECT 
                DISTINCT guestEmail as email,
                'guest' as id,
                'buyer' as role,
                0.00 as wallet_balance,
                0.00 as affiliate_balance,
                MAX(date) as created_at,
                FALSE as is_banned,
                TRUE as is_verified,
                'none' as membership,
                SUM(amount) as total_spent,
                0 as points,
                0 as referral_count,
                TRUE as is_guest
            FROM orders 
            WHERE guestEmail IS NOT NULL AND guestEmail != ''
            GROUP BY guestEmail
        `) as any[];

        // Combine and Sort
        const allUsers = [...registeredUsers, ...guestBuyers].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return NextResponse.json(allUsers);
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
        } else if (action === 'bulk_import') {
            const emails: string[] = body.emails || [];
            let count = 0;
            for (const e of emails) {
                const cleanEmail = e.trim();
                if (cleanEmail) {
                    const exists = await query("SELECT id FROM users WHERE email = ?", [cleanEmail]) as any[];
                    if (exists.length === 0) {
                        await query("INSERT INTO users (email, role, password, is_verified, created_at) VALUES (?, 'buyer', '123456', 1, NOW())", [cleanEmail]);
                        count++;
                    }
                }
            }
            return NextResponse.json({ success: true, count });
        } else if (action === 'send_bulk_email') {
            const { recipients, subject, content } = body;
            console.log(`[Bulk Email] Sending '${subject}' to ${recipients?.length || 0} recipients.`);
            return NextResponse.json({ success: true, count: recipients?.length || 0 });
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
