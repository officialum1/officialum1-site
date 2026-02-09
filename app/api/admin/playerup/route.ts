
import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

export async function GET() {
    try {
        await initDB(); // ensure table exists
        const listings = await query("SELECT * FROM playerup_listings ORDER BY createdAt DESC");
        return NextResponse.json(listings);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await initDB(); // ensure table exists
        const body = await req.json();
        const { action, listing, id, listings } = body;

        if (action === 'add') {
            const newId = Date.now().toString();
            await query(
                "INSERT INTO playerup_listings (id, title, url, lastBumped, createdAt) VALUES (?, ?, ?, NULL, NOW())",
                [newId, listing.title, listing.url]
            );
        } else if (action === 'delete') {
            await query("DELETE FROM playerup_listings WHERE id = ?", [id]);
        } else if (action === 'update_bump') {
            await query("UPDATE playerup_listings SET lastBumped = NOW() WHERE id = ?", [id]);
        } else if (action === 'bulk_import') {
            if (Array.isArray(listings)) {
                // Fetch existing URLs to avoid duplicates in this session
                const existingRows: any = await query("SELECT url FROM playerup_listings");
                const existingUrls = new Set(existingRows.map((r: any) => r.url));

                for (const item of listings) {
                    if (!existingUrls.has(item.url)) {
                        const newId = Date.now() + Math.random().toString(36).substr(2, 9);
                        // IGNORE duplicates for safety if multiple threads run
                        await query(
                            "INSERT IGNORE INTO playerup_listings (id, title, url, lastBumped, createdAt) VALUES (?, ?, ?, NULL, NOW())",
                            [newId, item.title, item.url]
                        );
                        existingUrls.add(item.url);
                    }
                }
            }
        }

        const data: any = await query("SELECT * FROM playerup_listings ORDER BY createdAt DESC");
        return NextResponse.json({ success: true, count: data.length, listings: data });
    } catch (e) {
        console.error("PlayerUp API Error:", e);
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
    }
}
