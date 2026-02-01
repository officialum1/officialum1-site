import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { makeG2GRequest } from '@/lib/g2g';
import { sendDiscordNotification } from '@/lib/discord';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { orderId, content, apiKey } = body;

        // Simple API Key check from settings
        const [settings]: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'discord_api_key'");
        if (!settings || settings.setting_value !== apiKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });

        console.log(`Discord Remote Fulfillment for Order ${orderId}`);

        // If content is provided, manual delivery. If not, try to find stock.
        let finalContent = content;
        let stockId = 'manual';

        if (!finalContent) {
            // Try to find matching stock using the product name from G2G
            const g2gRes = await makeG2GRequest('GET', `/orders/${orderId}`);
            if (g2gRes.status !== 200) return NextResponse.json({ error: 'Order not found on G2G' }, { status: 404 });

            const productName = g2gRes.data?.product_name || '';
            const [stock]: any = await query(
                "SELECT * FROM inventory WHERE (name LIKE ? OR platform LIKE ?) AND status = 'In Stock' LIMIT 1",
                [`%${productName}%`, `%${productName}%`]
            );

            if (!stock) return NextResponse.json({ error: 'No matching stock found for auto-fulfillment' }, { status: 404 });

            finalContent = stock.accountDetails;
            stockId = stock.id;
        }

        const deliveryPayload = { status: 'completed', content: finalContent };
        const res = await makeG2GRequest('POST', `/orders/${orderId}/delivery`, deliveryPayload);

        if (res.status === 200 || res.status === 201 || (res.data && res.data.success)) {
            if (stockId !== 'manual') {
                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stockId]);
            }

            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Discord Admin', 'Remote Delivery', `Fulfilled G2G Order ${orderId} via Discord.`]
            );

            await sendDiscordNotification(`🚀 **Manual Remote Fulfillment Success!**`, {
                title: `Order #${orderId} Fulfilled`,
                description: `Requested via: **Discord Command**\nStatus: **Delivered**`,
                color: 15105570, // Orange
                timestamp: new Date().toISOString()
            });

            return NextResponse.json({ success: true, message: 'Delivered successfully' });
        }

        return NextResponse.json({ error: 'G2G API Error', details: res.data }, { status: 500 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
