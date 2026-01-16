import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const PRODUCTS_PATH = path.join(process.cwd(), 'data', 'products.json');

export async function GET() {
    try {
        const content = await fs.readFile(PRODUCTS_PATH, 'utf8');
        return NextResponse.json(JSON.parse(content));
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        let products = [];
        try {
            const content = await fs.readFile(PRODUCTS_PATH, 'utf8');
            products = JSON.parse(content);
        } catch { }

        if (body.action === 'delete') {
            products = products.filter((p: any) => p.id !== body.id);
        } else {
            // Create New
            const newProduct = { ...body, id: Date.now() };
            products.unshift(newProduct);
        }

        await fs.writeFile(PRODUCTS_PATH, JSON.stringify(products, null, 2));
        return NextResponse.json({ success: true, products });
    } catch {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}
