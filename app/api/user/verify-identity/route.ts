import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request) {
    try {
        const { userId, type, documentImage, selfieImage } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check for existing pending request
        const existing: any = await query(
            "SELECT id FROM verification_requests WHERE user_id = ? AND status = 'pending'",
            [userId]
        );

        if (existing.length > 0) {
            return NextResponse.json({ error: "You already have a pending verification request." }, { status: 400 });
        }

        // Insert Request
        await query(
            "INSERT INTO verification_requests (user_id, type, document_image, selfie_image) VALUES (?, ?, ?, ?)",
            [userId, type || 'identity', documentImage || null, selfieImage || null]
        );

        return NextResponse.json({ success: true, message: "Verification request submitted successfully." });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const requests: any = await query(
            "SELECT status, created_at FROM verification_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
            [userId]
        );

        return NextResponse.json(requests[0] || { status: 'none' });

    } catch (e: any) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
