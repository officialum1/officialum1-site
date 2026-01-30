import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        // Get the user's referral code first
        const userRows: any = await query("SELECT referral_code FROM users WHERE id = ?", [userId]);
        if (userRows.length === 0) return NextResponse.json([]);

        const referralCode = userRows[0].referral_code;

        // Fetch users referred by this individual
        const referrals = await query(`
            SELECT 
                email, 
                created_at,
                (SELECT SUM(amount) FROM orders WHERE userId = users.id AND status = 'paid') as total_spent
            FROM users 
            WHERE referred_by = ?
            ORDER BY created_at DESC
        `, [referralCode]);

        // Obfuscate emails for privacy
        const result = (referrals as any[]).map(r => ({
            email: r.email.split('@')[0].slice(0, 3) + '***@' + r.email.split('@')[1],
            date: r.created_at,
            spent: r.total_spent || 0
        }));

        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
