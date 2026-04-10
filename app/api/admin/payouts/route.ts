import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const payouts = await query(`
            SELECT p.*, u.email 
            FROM payouts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `);
        return NextResponse.json(payouts);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { payoutId, action } = await req.json(); // action: 'approve' | 'reject'

        if (action === 'approve') {
            await query("UPDATE payouts SET status = 'approved' WHERE id = ?", [payoutId]);
            // Here you would manually execute the payment or trigger an automatic payout API (PayPal/Crypto)
            // For MVP, we assume manual payment.
        } else if (action === 'reject') {
            // Refund the balance
            const payout: any = await query("SELECT user_id, amount FROM payouts WHERE id = ?", [payoutId]);
            if (payout.length > 0) {
                await query("UPDATE users SET affiliate_balance = affiliate_balance + ? WHERE id = ?", [payout[0].amount, payout[0].user_id]);
                await query("UPDATE payouts SET status = 'rejected' WHERE id = ?", [payoutId]);
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
