import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = (await query(`
            SELECT 
                orders.orderId as id,
                products.name as productName,
                products.image as image,
                orders.date as created_at
            FROM orders
            JOIN products ON orders.productId = products.id
            WHERE orders.status = 'paid' OR orders.status = 'completed'
            ORDER BY orders.date DESC
            LIMIT 5
        `)) as any[];

        // Format orders for frontend
        const formatted = result.map((order: any) => ({
            id: order.id,
            productName: order.productName,
            image: order.image,
            timeAgo: getTimeAgo(new Date(order.created_at))
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Error fetching recent orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

function getTimeAgo(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years ago";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months ago";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours ago";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
}
