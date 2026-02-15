import { NextRequest, NextResponse } from 'next/server';
import { runCloudBump } from '@/lib/playerup-auto';
import { initDB } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('Authorization');
    const searchParams = req.nextUrl.searchParams;
    const key = searchParams.get('key');

    // Security Check: Match Admin Password
    if (key !== process.env.ADMIN_PASSWORD && authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await initDB();
        const result = await runCloudBump(20); // Bump up to 20 threads per run
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
