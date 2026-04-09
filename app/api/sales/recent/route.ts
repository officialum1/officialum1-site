import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Fetch last 10 paid orders
        // Use LEFT JOIN to get product name. If product ID is 0 (Bulk), we handle it.
        const orders: any = await query(`
            SELECT 
                o.orderId, 
                o.amount, 
                o.date, 
                p.name as productName,
                p.image as productImage
            FROM orders o
            LEFT JOIN products p ON o.productId = p.id
            WHERE o.status IN ('paid', 'completed')
            ORDER BY o.date DESC
            LIMIT 10
        `);

        // Format for frontend
        const sales = orders.map((order: any) => {
            const date = new Date(order.date);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            let timeAgo = `${diffMins} mins ago`;
            if (diffMins < 1) timeAgo = "Just now";
            else if (diffMins > 60) timeAgo = `${Math.floor(diffMins / 60)} hours ago`;

            // Handle Bulk or Deleted Products
            let name = order.productName;
            if (!name) {
                if (order.productId == '0') name = "Bulk Cart Bundle";
                else name = "Premium Account";
            }

            return {
                id: order.orderId,
                name: name,
                image: order.productImage,
                price: order.amount,
                time: timeAgo,
                rawTime: date.getTime()
            };
        });

        return NextResponse.json(sales);

    } catch (e: any) {
        console.error("Sales Feed Error:", e);
        return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
    }
}
