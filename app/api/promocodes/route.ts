import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const filePath = path.join(process.cwd(), 'data', 'promocodes.json');

// Helper to ensure file exists
async function getCodes() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const codeQuery = searchParams.get('code');
    const codes = await getCodes();

    if (codeQuery) {
        const promo = codes.find((c: any) => c.code.toLowerCase() === codeQuery.toLowerCase());
        if (promo) {
            // Check Expiration
            if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
                return NextResponse.json({ success: false, error: 'Promo Code Expired' });
            }
            return NextResponse.json({ success: true, discount: promo.discount });
        } else {
            return NextResponse.json({ success: false, error: 'Invalid Code' });
        }
    }

    return NextResponse.json(codes);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const codes = await getCodes();

        // Check duplicates
        if (codes.find((c: any) => c.code.toLowerCase() === body.code.toLowerCase())) {
            return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
        }

        const newCode = {
            id: Date.now(),
            code: body.code.toUpperCase(),
            discount: parseInt(body.discount),
            expiresAt: body.expiresAt || null,
            createdAt: new Date()
        };

        codes.push(newCode);
        await fs.writeFile(filePath, JSON.stringify(codes, null, 2));

        return NextResponse.json({ success: true, newCode });
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        let codes = await getCodes();
        codes = codes.filter((c: any) => c.id !== id);
        await fs.writeFile(filePath, JSON.stringify(codes, null, 2));
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
