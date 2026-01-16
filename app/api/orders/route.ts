import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const ORDERS_PATH = path.join(process.cwd(), 'data', 'orders.json');
const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

// Helper to load JSON
async function load(filePath: string) {
    try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch { return []; }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email'); // For guest linking

    const orders = await load(ORDERS_PATH);

    if (!userId && !email) return NextResponse.json([]);

    const userOrders = orders.filter((o: any) => {
        // Match by ID
        if (userId && o.userId && o.userId.toString() === userId.toString()) return true;
        // Match by Email (Guest Checkout Linking)
        if (email && o.guestEmail && o.guestEmail.toLowerCase() === email.toLowerCase()) return true;
        // Match by Email (User object match) - handling legacy or edge cases
        if (email && o.userId === 'guest' && o.guestEmail === email) return true;

        return false;
    });

    return NextResponse.json(userOrders.reverse());
}
