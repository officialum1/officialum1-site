
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Fetch last 5 orders
        const orders: any = await query(`
            SELECT 
                o.orderId as id, 
                p.name as productName, 
                o.date,
                o.guestEmail,
                u.email as userEmail
            FROM orders o
            INNER JOIN products p ON o.productId = p.id
            LEFT JOIN users u ON o.userId = u.id
            WHERE o.status = 'paid' OR o.status = 'completed'
            ORDER BY o.date DESC 
            LIMIT 5
        `);

        // Format data for popup
        const formatted = orders.map((o: any) => {
            const timeDiff = Date.now() - new Date(o.date).getTime();
            const minsAgo = Math.floor(timeDiff / 60000);

            // Generate a random country for "social proof" effect (since we don't store IP geo yet)
            const countries = ['🇺🇸 USA', '🇬🇧 UK', '🇨🇦 CA', '🇦🇺 AU', '🇩🇪 DE', '🇫🇷 FR'];
            const randomCountry = countries[Math.floor(Math.random() * countries.length)];

            return {
                id: o.id,
                product: o.productName || 'Premium Account',
                location: randomCountry,
                timeAgo: minsAgo < 1 ? 'Just now' : `${minsAgo} mins ago`
            };
        });

        return NextResponse.json(formatted);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
    }
}
