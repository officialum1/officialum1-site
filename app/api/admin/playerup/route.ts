
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'playerup.json');

function getListings() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    try {
        return JSON.parse(content);
    } catch (e) {
        return [];
    }
}

function saveListings(listings: any[]) {
    // Ensure data directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(listings, null, 2));
}

export async function GET() {
    return NextResponse.json(getListings());
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, listing, id, listings } = body;
        let data = getListings();

        if (action === 'add') {
            const newItem = {
                id: Date.now().toString(),
                ...listing,
                lastBumped: null,
                createdAt: new Date().toISOString()
            };
            data.unshift(newItem);
        } else if (action === 'delete') {
            data = data.filter((item: any) => item.id !== id);
        } else if (action === 'update_bump') {
            data = data.map((item: any) => {
                if (item.id === id) {
                    return { ...item, lastBumped: new Date().toISOString() };
                }
                return item;
            });
        } else if (action === 'bulk_import') {
            // listing argument here is actually an array of items for bulk import
            if (Array.isArray(listings)) {
                // simple deduplication by url if provided
                const existingUrls = new Set(data.map((i: any) => i.url));
                const newItems = listings.filter((l: any) => !existingUrls.has(l.url)).map((l: any) => ({
                    id: Date.now() + Math.random().toString(36).substr(2, 9),
                    ...l,
                    lastBumped: null,
                    createdAt: new Date().toISOString()
                }));
                data = [...newItems, ...data];
            }
        }

        saveListings(data);
        return NextResponse.json({ success: true, count: data.length, listings: data });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ success: false, error: 'Failed to save listing' }, { status: 500 });
    }
}
