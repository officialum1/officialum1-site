import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const topEarners = await query(`
            SELECT 
                u.email, 
                u.affiliate_balance as total_earned,
                (SELECT count(*) FROM users WHERE referred_by = u.referral_code) as total_referrals
            FROM users u
            WHERE u.affiliate_balance > 0 OR (SELECT count(*) FROM users WHERE referred_by = u.referral_code) > 0
            ORDER BY u.affiliate_balance DESC
            LIMIT 10
        `);

        // Obfuscate emails
        const obfuscated = (topEarners as any[]).map(e => ({
            ...e,
            email: e.email.split('@')[0].slice(0, 3) + '***@' + e.email.split('@')[1]
        }));

        return NextResponse.json(obfuscated);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
