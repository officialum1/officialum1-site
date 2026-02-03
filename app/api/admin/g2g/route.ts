import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { makeG2GRequest } from '@/lib/g2g';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const orderId = searchParams.get('orderId');

    try {
        if (action === 'get_order') {
            if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
            const result = await makeG2GRequest('GET', `/orders/${orderId}`);
            // Return 200 even on error so frontend can parse the error message without console 404s
            return NextResponse.json(result.data, { status: 200 });
        }

        if (action === 'get_tracked_orders') {
            try {
                const rows = await query("SELECT * FROM g2g_orders ORDER BY updated_at DESC LIMIT 50");
                return NextResponse.json(rows);
            } catch (e: any) {
                // Return empty if table doesn't exist
                return NextResponse.json([]);
            }
        }

        if (action === 'get_tracked_offers') {
            try {
                const rows = await query("SELECT * FROM g2g_offers ORDER BY updated_at DESC");
                return NextResponse.json(rows);
            } catch (e) {
                return NextResponse.json([]);
            }
        }

        if (action === 'get_services') {
            const result = await makeG2GRequest('GET', '/services');
            return NextResponse.json(result.data, { status: result.status });
        }

        if (action === 'get_brands') {
            const serviceId = searchParams.get('service_id');
            const q = searchParams.get('q');
            let queryStr = '';
            if (q) queryStr = `?q=${encodeURIComponent(q)}`;
            const result = await makeG2GRequest('GET', `/services/${serviceId}/brands${queryStr}`);
            return NextResponse.json(result.data, { status: result.status });
        }

        if (action === 'get_products') {
            const serviceId = searchParams.get('service_id');
            const brandId = searchParams.get('brand_id');
            const q = searchParams.get('q');
            let urlParams = new URLSearchParams();
            if (serviceId) urlParams.append('service_id', serviceId);
            if (brandId) urlParams.append('brand_id', brandId);
            if (q) urlParams.append('q', q);

            const result = await makeG2GRequest('GET', `/products?${urlParams.toString()}`);
            return NextResponse.json(result.data, { status: result.status });
        }

        if (action === 'get_attributes') {
            const productId = searchParams.get('productId');
            if (!productId) return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
            const result = await makeG2GRequest('GET', `/products/${productId}/attributes`);
            return NextResponse.json(result.data, { status: result.status });
        }

        if (action === 'get_stats') {
            try {
                const stats: any = await query(`
                    SELECT 
                        SUM(amount) as totalRevenue,
                        SUM(profit) as totalProfit,
                        COUNT(*) as totalOrders
                    FROM g2g_orders
                `);

                const [autoPilot]: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'g2g_auto_pilot'");

                return NextResponse.json({
                    ...stats[0],
                    autoPilot: autoPilot?.setting_value === 'true'
                });
            } catch (e) {
                return NextResponse.json({ totalRevenue: 0, totalProfit: 0, totalOrders: 0, autoPilot: false });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await request.json();
        const { action, orderId, delivery_details } = body;

        if (action === 'toggle_auto_pilot') {
            const { enabled } = body;
            await query(`
                INSERT INTO settings (setting_key, setting_value)
                VALUES ('g2g_auto_pilot', ?)
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `, [enabled ? 'true' : 'false']);
            return NextResponse.json({ success: true });
        }

        if (action === 'create_offer') {
            const { payload } = body;
            const storeRes = await makeG2GRequest('GET', '/store');
            const storeData = storeRes.data?.payload || {};

            const finalPayload = {
                product_id: payload.product_id,
                currency: payload.currency || storeData.selling_currencies?.[0] || 'USD',
                unit_price: parseFloat(payload.unit_price),
                api_qty: parseInt(payload.api_qty),
                min_qty: 1,
                offer_attributes: payload.offer_attributes || [],
                delivery_method_ids: payload.delivery_method_ids || [storeData.delivery_method_list?.[0]?.delivery_method_id].filter(Boolean),
                sales_territory_settings: { settings_type: "global", countries: [] }
            };

            const result = await makeG2GRequest('POST', '/offers', finalPayload);
            return NextResponse.json(result.data, { status: result.status });
        }

        if (action === 'deliver_order') {
            if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
            const { content } = delivery_details;
            const payload = {
                delivery_id: `ID-${Date.now()}`,
                codes: [{ content, content_type: 'text/plain' }]
            };
            const result = await makeG2GRequest('POST', `/orders/${orderId}/delivery`, payload);
            if (result.status !== 200 && result.status !== 201) {
                const chatRes = await makeG2GRequest('POST', `/orders/${orderId}/chats`, { message: content });
                if (chatRes.status === 200 || chatRes.status === 201) {
                    return NextResponse.json({ success: true, message: 'Sent via Chat (Fallback)', data: chatRes.data });
                }
            }
            return NextResponse.json(result.data, { status: result.status });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
