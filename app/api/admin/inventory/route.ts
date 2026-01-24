import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const role = searchParams.get('role');

    try {
        if (type === 'balance') {
            if (role === 'staff') return NextResponse.json([]);
            const transactions = await query("SELECT * FROM transactions ORDER BY date DESC");
            return NextResponse.json(transactions);
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
            return NextResponse.json(newItem);
        }

        if (action === 'record_sale') {
            // Update Inventory (if sold from inventory)
            let deliveryData = null;

            if (body.inventoryId) {
                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [body.inventoryId]);

                // Get Inventory details for delivery
                const items: any = await query("SELECT * FROM inventory WHERE id = ?", [body.inventoryId]);
                if (items.length > 0) {
                    const item = items[0];
                    const details = item.accountDetails ? JSON.parse(item.accountDetails) : {};

                    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
                    deliveryData = {
                        token,
                        details,
                        itemName: item.name,
                        proofImage: body.proofImage || null
                    };

                    await query(
                        "INSERT INTO deliveries (token, orderId, itemName, details, proofImage) VALUES (?, ?, ?, ?, ?)",
                        [token, `trans_${Date.now()}`, item.name, JSON.stringify(details), body.proofImage || null]
                    );
                }
            }

            // Record Transaction
            const newTransaction = {
                id: `trans_${Date.now()}`,
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

            return NextResponse.json({ success: true, transaction: newTransaction, delivery: deliveryData });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        console.error("Inventory POST Error:", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
