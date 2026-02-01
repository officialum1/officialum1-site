import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const intel = await query("SELECT * FROM market_intel ORDER BY last_checked DESC");
        return NextResponse.json(intel);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.action === 'track') {
            const { item_name, platform, competitor_price, my_price } = body;
            const status = Number(my_price) <= Number(competitor_price) ? 'Competitive' : 'Overpriced';

            await query(
                "INSERT INTO market_intel (item_name, platform, competitor_price, my_price, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE competitor_price = ?, my_price = ?, status = ?, last_checked = CURRENT_TIMESTAMP",
                [item_name, platform, competitor_price, my_price, status, competitor_price, my_price, status]
            );
            return NextResponse.json({ success: true });
        }

        if (body.action === 'delete') {
            await query("DELETE FROM market_intel WHERE id = ?", [body.id]);
            return NextResponse.json({ success: true });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
