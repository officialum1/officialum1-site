import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAuthenticated } from '@/lib/auth';

const dataPath = path.join(process.cwd(), 'data', 'rentals.json');

function getRentals() {
    if (!fs.existsSync(dataPath)) return [];
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(fileContents);
}

function saveRentals(rentals: any[]) {
    fs.writeFileSync(dataPath, JSON.stringify(rentals, null, 2));
}

export async function GET() {
    return NextResponse.json(getRentals());
}

export async function POST(req: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const rentals = getRentals();

    if (body.action === 'delete') {
        const newRentals = rentals.filter((r: any) => r.id !== body.id);
        saveRentals(newRentals);
        return NextResponse.json({ success: true });
    }

    // Create New
    const newRental = {
        id: Date.now(),
        domain: body.domain,
        niche: body.niche,
        price: body.price,
        traffic: body.traffic,
        status: body.status || 'Available',
        image: body.image || '/logo.jpg'
    };

    rentals.unshift(newRental);
    saveRentals(rentals);

    return NextResponse.json({ success: true, rental: newRental });
}

export async function DELETE(req: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const rentals = getRentals();
    const newRentals = rentals.filter((r: any) => r.id !== body.id);
    saveRentals(newRentals);
    return NextResponse.json({ success: true });
}
