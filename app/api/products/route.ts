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
