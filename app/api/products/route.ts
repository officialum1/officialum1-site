import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        const products = await query("SELECT * FROM products ORDER BY id DESC");
        return NextResponse.json(products);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (body.action === 'delete') {
            await query("DELETE FROM products WHERE id = ?", [body.id]);
        } else {
            // Create New
            const { name, platform, type, price, desc, creds, image } = body;
            const cleanPrice = price.toString().replace(/[^0-9.]/g, ''); // Remove $ and other non-numeric chars

            // Using 'creds' and 'description' to match lib/db.ts
            await query(
                "INSERT INTO products (name, platform, type, price, description, creds, image) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [name, platform, type, cleanPrice, desc, creds, image]
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Product API Error:", e.message);
        return NextResponse.json({ error: "Failed to update product: " + e.message }, { status: 500 });
    }
}
