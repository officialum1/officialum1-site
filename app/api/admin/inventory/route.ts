import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const role = searchParams.get('role');

    try {
        if (type === 'balance') {
            if (role === 'staff') return NextResponse.json([]);

            const transactions: any = await query("SELECT * FROM transactions ORDER BY date DESC");
            // Fetch deliveries to map tokens
            const deliveries: any = await query("SELECT orderId, token, views FROM deliveries");

            // Merge
            const merged = transactions.map((t: any) => {
                const delivery = deliveries.find((d: any) => d.orderId === t.id);
                return {
                    ...t,
                    deliveryToken: delivery ? delivery.token : null,
                    deliveryViews: delivery ? delivery.views || 0 : 0
                };
            });

            return NextResponse.json(merged);
        }

        // Default: Inventory
        let sql = "SELECT * FROM inventory";
        let params: any[] = [];

        // Staff Permission Check
        if (role === 'staff') {
            const email = searchParams.get('email');
            if (!email) return NextResponse.json([]);

            const staffRes: any = await query("SELECT allowedPlatforms FROM employees WHERE email = ?", [email]);
            if (staffRes.length === 0) return NextResponse.json([]);

            const allowed = JSON.parse(staffRes[0].allowedPlatforms || '[]');
            if (allowed.length > 0) {
                const placeholders = allowed.map(() => '?').join(',');
                sql += ` WHERE platform IN (${placeholders})`;
                params = allowed;
            } else {
                return NextResponse.json([]);
            }
        }

        sql += " ORDER BY purchaseDate DESC";
        const inventory: any = await query(sql, params);

        // Parse JSON fields
        const parsed = inventory.map((i: any) => ({
            ...i,
            accountDetails: i.accountDetails ? JSON.parse(i.accountDetails) : {}
        }));

        return NextResponse.json(parsed);
    } catch (e) {
        console.error("Inventory/Transactions Fetch Error:", e);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const action = body.action;

        if (action === 'add_inventory') {
            const newItem = {
                id: `inv_${Date.now()}`,
                name: body.name,
                platform: body.platform,
                purchasePrice: Number(body.purchasePrice),
                status: 'In Stock',
                accountDetails: JSON.stringify({
                    username: body.username || '',
                    password: body.password || '',
                    email: body.email || '',
                    extraInfo: body.extraInfo || ''
                })
            };

            await query(
                "INSERT INTO inventory (id, name, platform, purchasePrice, status, accountDetails) VALUES (?, ?, ?, ?, ?, ?)",
                [newItem.id, newItem.name, newItem.platform, newItem.purchasePrice, newItem.status, newItem.accountDetails]
            );

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Add Inventory', `Added ${newItem.name} (${newItem.platform})`]
            );

            return NextResponse.json(newItem);
        }

        if (action === 'record_sale') {
            const transactionId = `trans_${Date.now()}`;

            // Update Inventory (if sold from inventory)
            let deliveryData = null;

            if (body.inventoryId) {
                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [body.inventoryId]);

                // Get Inventory details for delivery
                const items: any = await query("SELECT * FROM inventory WHERE id = ?", [body.inventoryId]);
                if (items.length > 0) {
                    const item = items[0];
                    const details = item.accountDetails ? JSON.parse(item.accountDetails) : {};

                    // Generate Short Token (8 chars)
                    const token = Math.random().toString(36).substring(2, 10);

                    deliveryData = {
                        token,
                        details,
                        itemName: item.name,
                        proofImage: body.proofImage || null
                    };

                    await query(
                        "INSERT INTO deliveries (token, orderId, itemName, details, proofImage) VALUES (?, ?, ?, ?, ?)",
                        [token, transactionId, item.name, JSON.stringify(details), body.proofImage || null]
                    );
                }
            }

            // Record Transaction
            const newTransaction = {
                id: transactionId,
                type: 'sale',
                platform: body.platform,
                amount: Number(body.salePrice),
                description: body.description || 'Direct Sale',
                processedBy: body.staffName || 'Admin',
                inventoryId: body.inventoryId || null
            };

            await query(
                "INSERT INTO transactions (id, type, platform, amount, description, processedBy, inventoryId) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [newTransaction.id, newTransaction.type, newTransaction.platform, newTransaction.amount, newTransaction.description, newTransaction.processedBy, newTransaction.inventoryId]
            );

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, newTransaction.processedBy, 'Record Sale', `Sold item for $${newTransaction.amount} (${newTransaction.platform})`]
            );

            return NextResponse.json({ success: true, transaction: newTransaction, delivery: deliveryData });
        }

        if (action === 'bulk_import') {
            const { bulkData, platform, purchasePrice, namePrefix } = body;
            const lines = bulkData.split('\n');
            const created = [];

            for (const line of lines) {
                if (!line.trim()) continue;

                // Simple parsing: user:pass or user:pass:email
                const parts = line.trim().split(':');
                const username = parts[0]?.trim();
                const password = parts[1]?.trim();
                const email = parts[2]?.trim() || '';

                if (!username || !password) continue;

                const newItem = {
                    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    name: namePrefix || `${platform} Account`,
                    platform: platform,
                    purchasePrice: Number(purchasePrice) || 0,
                    status: 'In Stock',
                    accountDetails: JSON.stringify({
                        username,
                        password,
                        email,
                        extraInfo: 'Bulk Imported'
                    })
                };

                await query(
                    "INSERT INTO inventory (id, name, platform, purchasePrice, status, accountDetails) VALUES (?, ?, ?, ?, ?, ?)",
                    [newItem.id, newItem.name, newItem.platform, newItem.purchasePrice, newItem.status, newItem.accountDetails]
                );
                created.push(newItem);
            }

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Bulk Import', `Imported ${created.length} accounts for ${platform}`]
            );

            return NextResponse.json({ success: true, count: created.length });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        console.error("Inventory POST Error:", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
