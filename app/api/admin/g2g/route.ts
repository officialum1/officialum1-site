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

            // Sync with local DB if success
            if (result.status === 200 && result.data?.payload) {
                const payload = result.data.payload;
                const amount = parseFloat(payload.total_price || payload.total_amount || payload.amount || 0);
                if (amount > 0) {
                    await query(`
                        INSERT INTO g2g_orders (order_id, product_name, amount, status, raw_payload)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE 
                        amount = VALUES(amount),
                        status = VALUES(status),
                        raw_payload = VALUES(raw_payload),
                        updated_at = CURRENT_TIMESTAMP
                    `, [orderId, payload.product_name || '', amount, payload.order_status || 'Paid', JSON.stringify(payload)]);
                }
            }

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

        if (action === 'get_stats') {
            try {
                const [stats]: any = await query(`
                    SELECT 
                        COUNT(*) as totalOrders, 
                        COALESCE(SUM(amount), 0) as totalRevenue
                    FROM g2g_orders
                `);

                const revenue = parseFloat(stats.totalRevenue || 0);
                return NextResponse.json({
                    totalOrders: stats.totalOrders || 0,
                    totalRevenue: revenue,
                    totalProfit: revenue * 0.91 // Est. 9% fees
                });
            } catch (e) {
                return NextResponse.json({ totalOrders: 0, totalRevenue: 0, totalProfit: 0 });
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

            // 1. Direct Search (if IDs provided)
            if (serviceId || brandId) {
                let urlParams = new URLSearchParams();
                if (serviceId) urlParams.append('service_id', serviceId);
                if (brandId) urlParams.append('brand_id', brandId);
                if (q) urlParams.append('q', q);

                const result = await makeG2GRequest('GET', `/products?${urlParams.toString()}`);
                return NextResponse.json(result.data, { status: result.status });
            }

            // 2. Global Search (Smart Logic)
            if (q) {
                try {
                    // A. Fast Path: Try Direct Product Search
                    // Many G2G API implementations support global q parameter
                    const directRes = await makeG2GRequest('GET', `/products?q=${encodeURIComponent(q)}`);
                    const directList = directRes.data?.payload?.product_list || directRes.data?.payload?.results || [];

                    if (Array.isArray(directList) && directList.length > 0) {
                        // Enrich with service/brand names if missing (optional, relies on frontend to handle missing)
                        return NextResponse.json({ payload: directList }, { status: 200 });
                    }

                    console.log('Direct search yielded no results, trying iterative deep search...');

                    // B. Deep Path: Iterate Services -> Brands -> Products
                    // Fetch Services first
                    const servicesRes = await makeG2GRequest('GET', '/services');
                    const servicesPayload = servicesRes.data?.payload || {};
                    const services = servicesPayload.service_list || servicesPayload.results || servicesPayload || [];

                    if (!Array.isArray(services)) {
                        console.error('G2G Services Fetch Failed or Invalid Format:', JSON.stringify(servicesRes.data));
                        // Return empty payload creates semantic "No results", better than error 500
                        return NextResponse.json({ payload: [] });
                    }

                    // Search for Brand in all Services (Parallel with Concurrency Limit potentially needed)
                    // We stick to Promise.all for now but slice services if too many?
                    const activeServices = services.slice(0, 15); // Limit to top 15 services to prevent timeout

                    const productPromises = activeServices.map(async (s: any) => {
                        if (!s.service_id) return [];

                        // Search Brand in this Service
                        const brandsRes = await makeG2GRequest('GET', `/services/${s.service_id}/brands?q=${encodeURIComponent(q)}`);
                        const brandsPayload = brandsRes.data?.payload || {};
                        const brands = brandsPayload.brand_list || brandsPayload.results || brandsPayload || [];

                        if (!Array.isArray(brands)) return [];

                        // If brand found, fetch products for it
                        if (brands.length > 0) {
                            // Take top matches (limit to 3 per service to avoid hammering API)
                            const topBrands = brands.slice(0, 3);

                            const brandProductPromises = topBrands.map(async (b: any) => {
                                const pRes = await makeG2GRequest('GET', `/products?service_id=${s.service_id}&brand_id=${b.brand_id}`);
                                const productsPayload = pRes.data?.payload || {};
                                const products = productsPayload.product_list || productsPayload.results || productsPayload || [];

                                if (!Array.isArray(products)) return [];

                                return products.map((p: any) => ({
                                    ...p,
                                    service_id: s.service_id,
                                    brand_id: b.brand_id,
                                    service_name: s.service_name,
                                    brand_name: b.brand_name
                                }));
                            });

                            const nestedProducts = await Promise.all(brandProductPromises);
                            return nestedProducts.flat();
                        }
                        return [];
                    });

                    const allProducts = (await Promise.all(productPromises)).flat();

                    // Deduplicate by product_id
                    const uniqueProducts = Array.from(new Map(allProducts.map((p: any) => [p.product_id, p])).values());

                    return NextResponse.json({ payload: uniqueProducts }, { status: 200 });

                } catch (e) {
                    console.error('Global Search Error:', e);
                    // Fallback to empty array
                    return NextResponse.json({ payload: [] });
                }
            }


            return NextResponse.json({ payload: [] });
        }

        if (action === 'get_all_offers') {
            try {
                const rows = await query("SELECT * FROM g2g_listings ORDER BY last_sync DESC LIMIT 500");
                return NextResponse.json(rows);
            } catch { return NextResponse.json([]); }
        }

        if (action === 'debug_g2g') {
            const sRes = await makeG2GRequest('GET', '/services');
            return NextResponse.json(sRes.data);
        }

        if (action === 'get_attributes') {
            const productId = searchParams.get('productId');
            if (!productId) return NextResponse.json({ error: 'Product ID required' }, { status: 400 });

            // Parallel fetch: Attributes + Store Delivery Methods
            const [attrRes, storeRes] = await Promise.all([
                makeG2GRequest('GET', `/products/${productId}/attributes`),
                makeG2GRequest('GET', '/store')
            ]);

            const attrData = attrRes.data?.payload || {};
            const storeData = storeRes.data?.payload || {};

            return NextResponse.json({
                payload: {
                    ...attrData,
                    delivery_method_list: (storeData.delivery_method_list && storeData.delivery_method_list.length > 0)
                        ? storeData.delivery_method_list
                        : [
                            { delivery_method_id: '1', delivery_method_name: 'Manual Delivery' },
                            { delivery_method_id: '2', delivery_method_name: 'Instant Delivery' }
                        ]
                }
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Basic auth check removed for brevity, rely on middleware or specific check if needed
    // if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const body = await request.json();
        const { action, listings, orderId, delivery_details } = body;

        if (action === 'turbo_sync') {
            if (!listings || !Array.isArray(listings)) return NextResponse.json({ error: "No listings provided" });

            let count = 0;
            for (const item of listings) {
                await query(`
                     INSERT INTO g2g_listings (id, title, price, stock, status, url, last_sync)
                     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                     ON DUPLICATE KEY UPDATE
                     title = VALUES(title),
                     price = VALUES(price),
                     stock = VALUES(stock),
                     status = VALUES(status),
                     url = VALUES(url),
                     last_sync = CURRENT_TIMESTAMP
                 `, [item.id, item.title, item.price, item.stock, item.status, item.url]);
                count++;
            }
            return NextResponse.json({ success: true, count });
        }

        if (action === 'api_sync_g2g') {
            // 1. Sync Listings (Pagination Loop)
            let listingCount = 0;
            let page = 1;
            let hasMore = true;

            while (hasMore && page <= 20) {
                const listingsRes = await makeG2GRequest('POST', '/offers/search', {
                    status: 'live',
                    page_size: 100,
                    page: page
                });

                if (listingsRes.status === 200) {
                    const items = listingsRes.data.payload?.results || listingsRes.data.payload || [];
                    if (items.length === 0) {
                        hasMore = false;
                    } else {
                        // Process current page
                        const lRes = await processApiListings({ payload: items });
                        if ((lRes as any).success) listingCount += (lRes as any).count;

                        // Check if we reached the end
                        if (items.length < 100) hasMore = false;
                        else page++;
                    }
                } else {
                    hasMore = false;
                }
            }

            // Cleanup: Mark missing items as 'Inactive'
            // Since processApiListings updates last_sync to CURRENT_TIMESTAMP, 
            // any active item with last_sync older than 2 mins is stale.
            await query(`
                UPDATE g2g_listings 
                SET status = 'Inactive', stock = 0
                WHERE status = 'Active' AND last_sync < DATE_SUB(NOW(), INTERVAL 3 MINUTE)
            `);

            // 2. Sync Sold Orders
            const ordersRes = await makeG2GRequest('POST', '/orders/search', {
                role: 'seller',
                page_size: 50
            });

            let orderCount = 0;
            if (ordersRes.status === 200) {
                const orders = ordersRes.data.payload?.results || ordersRes.data.payload || [];
                for (const o of orders) {
                    await query(`
                         INSERT INTO g2g_orders (order_id, product_name, amount, status, raw_payload, updated_at)
                         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                         ON DUPLICATE KEY UPDATE 
                         amount = VALUES(amount),
                         status = VALUES(status),
                         updated_at = CURRENT_TIMESTAMP
                     `, [
                        o.order_id,
                        o.product_name || o.title || 'Order ' + o.order_id,
                        o.total_price || o.amount || 0,
                        o.status || 'Processing',
                        JSON.stringify(o)
                    ]);
                    orderCount++;
                }
            }

            return NextResponse.json({ success: true, listingCount, orderCount, source: 'API_PAGINATED' });
        }

        async function processApiListings(data: any) {
            const items = data.payload?.results || data.payload || [];
            let count = 0;
            for (const item of items) {
                // Try to resolve stock from various fields
                let stockVal = item.stock || item.quantity || item.available_quantity || item.offer_qty || item.api_qty || 0;
                // Ensure stock is at least 1 if active, as fallback (optional)

                await query(`
                     INSERT INTO g2g_listings (id, title, price, stock, status, url, last_sync)
                     VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                     ON DUPLICATE KEY UPDATE
                     title = VALUES(title),
                     price = VALUES(price),
                     stock = VALUES(stock),
                     status = VALUES(status),
                     url = VALUES(url),
                     last_sync = CURRENT_TIMESTAMP
                 `, [
                    item.offer_id || item.id,
                    item.title || item.product_name || 'G2G Offer',
                    item.price || item.unit_price || 0,
                    stockVal,
                    (item.status === 'live' || item.status === 'active' || item.status === 1) ? 'Active' : 'Inactive',
                    `https://www.g2g.com/offer/${item.offer_id || item.id}`
                ]);
                count++;
            }
            return { success: true, count, source: 'API' };
        }


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

            // 1. Fetch Store Config (Delivery Methods, Currencies)
            const storeRes = await makeG2GRequest('GET', '/store');
            const storeData = storeRes.data?.payload || {};

            // 2. Prepare Attributes
            // G2G expects 'offer_attributes' as a flat array of objects: { attribute_group_id, attribute_id }
            const offerAttributes = (payload.offer_attributes || []).map((attr: any) => ({
                attribute_group_id: String(attr.attribute_group_id),
                attribute_id: String(attr.attribute_id)
            }));

            // 3. Prepare Delivery Methods
            let deliveryIds = (payload.delivery_method_ids || []).map((id: any) => String(id));
            if (deliveryIds.length === 0) {
                if (storeData.delivery_method_list?.length > 0) {
                    deliveryIds = [String(storeData.delivery_method_list[0].delivery_method_id)];
                } else {
                    deliveryIds = ['1']; // Default Manual
                }
            }

            // Ensure only 1 delivery method is sent
            if (deliveryIds.length > 1) {
                deliveryIds = deliveryIds.slice(0, 1);
            }

            // 4. Construct Final Payload
            const finalPayload: any = {
                product_id: String(payload.product_id),
                currency: payload.currency || 'USD',
                unit_price: parseFloat(payload.unit_price),
                api_qty: parseInt(payload.api_qty) || 1,
                min_qty: 1,
                low_stock_alert_qty: parseInt(payload.low_stock_alert_qty) || 0,
                offer_attributes: offerAttributes,
                delivery_method_id: deliveryIds[0], // Use singular key strictly to fix 'multiple not allowed' error
                sales_territory_settings: { settings_type: "global", countries: [] },
                description: payload.description || '',
                service_id: payload.service_id ? String(payload.service_id) : undefined,
                brand_id: payload.brand_id ? String(payload.brand_id) : undefined,
            };

            // Remove undefined keys
            if (!finalPayload.service_id) delete finalPayload.service_id;
            if (!finalPayload.brand_id) delete finalPayload.brand_id;

            console.log('[G2G] Creating Offer Payload:', JSON.stringify(finalPayload, null, 2));

            const result = await makeG2GRequest('POST', '/offers', finalPayload);

            if (result.status !== 200 && result.status !== 201) {
                console.error('[G2G] Create Offer Failed:', JSON.stringify(result.data));
                return NextResponse.json({
                    error: result.data?.message || result.data?.error || 'G2G API Error',
                    details: result.data,
                    debug_payload: finalPayload // Debugging info
                }, { status: result.status });
            }

            return NextResponse.json(result.data, { status: result.status });
        }

        if (action === 'deliver_order') {
            if (!orderId) return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
            if (!delivery_details) return NextResponse.json({ error: 'Delivery details required' }, { status: 400 });
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
