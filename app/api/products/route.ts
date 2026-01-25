import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const products = await query("SELECT * FROM products ORDER BY id DESC");
        return NextResponse.json(products);
    } catch (e: any) {
        console.error("Shop API Error:", e.message);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.action === 'delete') {
            await query("DELETE FROM products WHERE id = ?", [body.id]);
        } else if (body.action === 'bulk_import') {
            const { bulkData } = body;
            const lines = bulkData.split('\n');
            const created = [];

            for (const line of lines) {
                if (!line.trim()) continue;

                // Expected format: Name,Category,Price,Description,ImageURL
                const parts = line.split(',');
                if (parts.length < 3) continue; // Basic validation: need name and price

                const name = parts[0]?.trim();
                const platform = parts[1]?.trim() || 'General';
                const price = parts[2]?.trim().replace(/[^0-9.]/g, '') || '0';
                const description = parts[3]?.trim() || '';
                const image = parts[4]?.trim() || '';

                if (!name || isNaN(Number(price))) continue;

                await query(
                    "INSERT INTO products (name, platform, price, description, image) VALUES (?, ?, ?, ?, ?)",
                    [name, platform, price, description, image]
                );
                created.push({ name, platform, price });
            }

            // Log activity
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Bulk Product Import', `Imported ${created.length} products to catalog`]
            );

            return NextResponse.json({ success: true, count: created.length });
        } else {
            // Create / Update Product in Catalog
            const { name, platform, price, description, image } = body;
            const cleanPrice = price.toString().replace(/[^0-9.]/g, '');

            await query(
                "INSERT INTO products (name, platform, price, description, image) VALUES (?, ?, ?, ?, ?)",
                [name, platform, cleanPrice, description, image]
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
