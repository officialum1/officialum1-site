import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendRestockEmail } from '@/lib/email';

export async function GET() {
    try {
        // Fetch products with their manual stock AND live inventory count
        const products = await query(`
            SELECT p.*, 
            (SELECT COUNT(*) FROM inventory i 
             WHERE (i.platform = p.platform OR i.name = p.name) AND i.status = 'In Stock') as inventoryStock
            FROM products p
            ORDER BY id DESC
        `);
        return NextResponse.json(products);
    } catch (e: unknown) {
        console.error("Shop API Error:", e instanceof Error ? e.message : String(e));
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(req: Request) {
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
            const { bulkData } = body;
            const lines = bulkData.split('\n');
            const created = [];

            for (const line of lines) {
                if (!line.trim()) continue;

                const parts = line.split(',');
                if (parts.length < 3) continue;

                const name = parts[0]?.trim();
                const platform = parts[1]?.trim() || 'General';
                const price = parts[2]?.trim().replace(/[^0-9.]/g, '') || '0';
                const description = parts[3]?.trim() || '';
                const image = parts[4]?.trim() || '';
                const stock = parts[5]?.trim() || '1';

                if (!name || isNaN(Number(price))) continue;

                await query(
                    "INSERT INTO products (name, platform, price, description, image, stock) VALUES (?, ?, ?, ?, ?, ?)",
                    [name, platform, price, description, image, stock]
                );
                created.push({ name, platform, price });
            }

            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Bulk Product Import', `Imported ${created.length} products to catalog`]
            );

            return NextResponse.json({ success: true, count: created.length });
        } else if (body.action === 'update') {
            const { id, name, platform, price, description, image, salePrice, saleEndsAt, bundleItems, stock } = body;
            const cleanPrice = price.toString().replace(/[^0-9.]/g, '');

            await query(
                "UPDATE products SET name = ?, platform = ?, price = ?, description = ?, image = ?, sale_price = ?, sale_ends_at = ?, bundle_items = ?, stock = ? WHERE id = ?",
                [name, platform, cleanPrice, description, image, salePrice || null, saleEndsAt || null, bundleItems || null, stock || 1, id]
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
            const { name, platform, price, description, image, salePrice, saleEndsAt, bundleItems, stock } = body;
            const cleanPrice = price.toString().replace(/[^0-9.]/g, '');

            await query(
                "INSERT INTO products (name, platform, price, description, image, sale_price, sale_ends_at, bundle_items, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [name, platform, cleanPrice, description, image, salePrice || null, saleEndsAt || null, bundleItems || null, stock || 1]
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
}
