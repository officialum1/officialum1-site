import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendVerificationStatusEmail } from '@/lib/email';

export async function GET(req: Request) {
    try {
        const requests = await query(`
            SELECT 
                vr.*, 
                u.email as user_email
            FROM verification_requests vr
            JOIN users u ON vr.user_id = u.id
            ORDER BY vr.created_at DESC
        `) as any[];

        return NextResponse.json(requests);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { requestId, userId, status, reason } = await req.json();

        // Get user email
        const userRows = await query("SELECT email FROM users WHERE id = ?", [userId]) as any[];
        const email = userRows[0]?.email;

        if (status === 'approved') {
            await query("UPDATE users SET is_verified = 1 WHERE id = ?", [userId]);
            await query("UPDATE verification_requests SET status = 'approved' WHERE id = ?", [requestId]);
        } else if (status === 'rejected') {
            await query("UPDATE verification_requests SET status = 'rejected', rejection_reason = ? WHERE id = ?", [reason, requestId]);
        }

        // Add notification for user
        const title = status === 'approved' ? "Identity Verified! 🎉" : "Verification Declined ❌";
        const message = status === 'approved' ? "Your identity documents have been approved. Welcome to the Verified Pro program." : `Your verification was declined. Reason: ${reason}`;

        await query("INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)", [userId, title, message]);

        // Send Email
        if (email) {
            await sendVerificationStatusEmail(email, status, reason);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
