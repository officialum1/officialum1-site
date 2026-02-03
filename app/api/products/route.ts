import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendRestockEmail } from '@/lib/email';
import { isAuthenticated } from '@/lib/auth';

export async function GET() {
    try {
        // Optimized Fetch: Compute inventory stock in a single join/group
        const products = await query(`
            SELECT p.*, 
            c.name as categoryName, c.icon as categoryIcon, c.discount_percent as categoryDiscount, c.is_vip_only as isVipOnly,
            IFNULL(i_counts.stock_count, 0) as inventoryStock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN (
                SELECT platform, name, COUNT(*) as stock_count 
                FROM inventory 
                WHERE status = 'In Stock' 
                GROUP BY platform, name
            ) i_counts ON (i_counts.platform = p.platform OR i_counts.name = p.name)
            ORDER BY p.id DESC
        `);

        console.log(`[Shop API] Found ${Array.isArray(products) ? products.length : 0} products`);
        return NextResponse.json(products);
    } catch (e: unknown) {
        console.error("Shop API Error:", e instanceof Error ? e.message : String(e));
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await isAuthenticated()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        if (body.action === 'delete') {
            if (Array.isArray(body.id)) {
                const placeholders = body.id.map(() => '?').join(',');
                await query(`DELETE FROM products WHERE id IN (${placeholders})`, body.id);
            } else {
                await query("DELETE FROM products WHERE id = ?", [body.id]);
            }
        } else if (body.action === 'cleanup_descriptions') {
            await query(
                "UPDATE products SET description = ? WHERE description LIKE ?",
                ['Premium quality account verified and ready for use.', '%Imported from Z2U store%']
            );
        } else if (body.action === 'bulk_update') {
            const { updates } = body;
            for (const item of updates) {
                await query(
                    "UPDATE products SET price = ?, stock = ?, platform = ? WHERE id = ?",
                    [item.price, item.stock, item.platform, item.id]
                );
            }
            return NextResponse.json({ success: true });
        } else if (body.action === 'bulk_import') {
            const { products, category_id } = body;
            const created = [];

            if (!Array.isArray(products)) {
                return NextResponse.json({ error: 'Invalid products array' }, { status: 400 });
            }

            for (const p of products) {
                const name = p.name?.trim();
                const platform = p.platform?.trim() || 'General';
                const price = p.price?.toString().replace(/[^0-9.]/g, '') || '0';
                const description = p.description?.trim() || '';
                const image = p.image?.trim() || '';
                const stock = p.stock || '1';

                if (!name) continue;

                await query(
                    "INSERT INTO products (name, platform, price, description, image, stock, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    [name, platform, price, description, image, stock, category_id || null]
                );
                created.push({ name, platform, price });
            }

            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Bulk Product Import', `Imported ${created.length} products to catalog`]
            );

            return NextResponse.json({ success: true, count: created.length });
        } else if (body.action === 'update') {
            const { id, name, platform, price, description, image, salePrice, saleEndsAt, bundleItems, stock, category_id, g2g_listing_id } = body;
            const cleanPrice = price.toString().replace(/[^0-9.]/g, '');

            await query(
                "UPDATE products SET name = ?, platform = ?, price = ?, description = ?, image = ?, sale_price = ?, sale_ends_at = ?, bundle_items = ?, stock = ?, category_id = ?, g2g_listing_id = ? WHERE id = ?",
                [name, platform, cleanPrice, description, image, salePrice || null, saleEndsAt || null, bundleItems || null, stock || 1, category_id || null, g2g_listing_id || null, id]
            );

            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Update Product', `Updated settings for ${name}`]
            );

            // --- RESTOCK NOTIFICATION TRIGGER ---
            if (Number(stock) > 0) {
                // Get Settings for SMTP
                const settingsRows = await query("SELECT setting_key, setting_value FROM settings") as any[];
                let settings = {};
                if (Array.isArray(settingsRows)) {
                    settings = settingsRows.reduce((acc: any, row: any) => { acc[row.setting_key] = row.setting_value; return acc; }, {});
                }

                // Find pending notifications
                const pending = await query("SELECT * FROM inventory_notifications WHERE product_id = ? AND status = 'pending'", [id]) as any[];
                if (pending && pending.length > 0) {
                    const productData = { id, name, price, image };
                    const productUrl = `https://officialum1.com/shop/${id}`;

                    for (const req of pending) {
                        await sendRestockEmail(req.email, productData, productUrl, settings);
                        await query("UPDATE inventory_notifications SET status = 'sent' WHERE id = ?", [req.id]);
                        console.log(`Restock email sent to ${req.email} for product ${id}`);
                    }
                }
            }
        } else {
            const { name, platform, price, description, image, salePrice, saleEndsAt, bundleItems, stock, category_id, g2g_listing_id } = body;
            const cleanPrice = price.toString().replace(/[^0-9.]/g, '');

            await query(
                "INSERT INTO products (name, platform, price, description, image, sale_price, sale_ends_at, bundle_items, stock, category_id, g2g_listing_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [name, platform, cleanPrice, description, image, salePrice || null, saleEndsAt || null, bundleItems || null, stock || 1, category_id || null, g2g_listing_id || null]
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
