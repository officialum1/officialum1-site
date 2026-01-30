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

        // Parse JSON fields and strip sensitive data for staff
        const parsed = inventory.map((i: any) => {
            const item = {
                ...i,
                accountDetails: i.accountDetails ? JSON.parse(i.accountDetails) : {}
            };

            // SECURITY: Never show real purchase price to staff
            if (role === 'staff') {
                delete item.purchasePrice;
            }

            return item;
        });

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
            // Check if it was out of stock before adding
            const currentStockRows: any = await query("SELECT COUNT(*) as count FROM inventory WHERE name = ? AND status = 'In Stock'", [body.name]);
            const wasOutOfStock = (currentStockRows[0]?.count || 0) === 0;

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

            // Restock Announcement
            if (wasOutOfStock) {
                const settingsRows: any = await query("SELECT setting_key, setting_value FROM settings");
                const settings = settingsRows.reduce((acc: any, row: any) => ({ ...acc, [row.setting_key]: row.setting_value }), {});

                if (settings.telegram_bot_token && settings.telegram_chat_id) {
                    const { sendTelegramMessage } = require('@/lib/telegram');
                    await sendTelegramMessage(
                        settings.telegram_chat_id,
                        `✨ <b>RESTOCK ALERT!</b>\n\n${newItem.name} is now back in stock!\n\n🚀 Grab yours now at OfficialUM1!`,
                        settings.telegram_bot_token
                    );
                }
            }

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Add Inventory', `Added ${newItem.name} (${newItem.platform})`]
            );

            return NextResponse.json(newItem);
        }

        if (action === 'record_sale') {
            const transactionId = `trans_${Date.now()}`;
            let deliveryData = null;
            let soldInventoryIds: string[] = [];
            let combinedDetailsText = "";

            // --- BULK SALE LOGIC ---
            if (body.mode === 'bulk') {
                const { productName, quantity } = body;
                const qty = parseInt(quantity);

                // 1. Find available stock
                const availableItems: any = await query(
                    "SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT ?",
                    [productName, qty]
                );

                if (availableItems.length < qty) {
                    return NextResponse.json({ error: `Not enough stock. Requested: ${qty}, Available: ${availableItems.length}` }, { status: 400 });
                }

                // 2. Mark all as Sold & Collect Details
                let accountsList: any[] = [];
                for (const item of availableItems) {
                    await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [item.id]);
                    soldInventoryIds.push(item.id);

                    const details = item.accountDetails ? JSON.parse(item.accountDetails) : {};
                    accountsList.push({
                        email: details.email || '',
                        user: details.username || '',
                        pass: details.password || '',
                        extra: details.extraInfo || ''
                    });

                    // Format: "email:username:password" (Only include email/username if they exist and are different)
                    let loginPart = details.email || details.username;
                    if (details.email && details.username && details.email !== details.username) {
                        loginPart = `${details.email}:${details.username}`;
                    }

                    const line = `${loginPart}:${details.password}${details.extraInfo ? `:${details.extraInfo}` : ''}`;
                    combinedDetailsText += line + "\n";
                }

                // 3. Create Delivery
                if (soldInventoryIds.length > 0) {
                    const token = Math.random().toString(36).substring(2, 10);
                    const deliveryDetails = {
                        note: `Bulk Order of ${qty} x ${productName}`,
                        accounts: combinedDetailsText,
                        items: accountsList,
                        inventoryIds: soldInventoryIds
                    };

                    deliveryData = {
                        token,
                        details: deliveryDetails,
                        itemName: `${qty}x ${productName}`,
                        proofImage: body.proofImage || null
                    };

                    await query(
                        "INSERT INTO deliveries (token, orderId, itemName, details, proofImage) VALUES (?, ?, ?, ?, ?)",
                        [token, transactionId, deliveryData.itemName, JSON.stringify(deliveryDetails), deliveryData.proofImage]
                    );
                }

            }
            // --- SINGLE ITEM LOGIC (Legacy) ---
            else if (body.inventoryId) {
                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [body.inventoryId]);
                soldInventoryIds.push(body.inventoryId);

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
                description: body.description || (body.mode === 'bulk' ? `Bulk Sale: ${body.quantity}x ${body.productName}` : 'Direct Sale'),
                processedBy: body.staffName || 'Admin',
                inventoryId: soldInventoryIds.length === 1 ? soldInventoryIds[0] : 'bulk' // Store 'bulk' or single ID
            };

            await query(
                "INSERT INTO transactions (id, type, platform, amount, description, processedBy, inventoryId) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [newTransaction.id, newTransaction.type, newTransaction.platform, newTransaction.amount, newTransaction.description, newTransaction.processedBy, newTransaction.inventoryId]
            );

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, newTransaction.processedBy, 'Record Sale', `Sold items for $${newTransaction.amount} (${newTransaction.platform})`]
            );

            return NextResponse.json({ success: true, transaction: newTransaction, delivery: deliveryData });
        }

        if (action === 'bulk_import') {
            const { bulkData, platform, purchasePrice, namePrefix } = body;
            const lines = bulkData.split('\n');
            const created = [];

            // Check if it was out of stock before adding
            const currentStockRows: any = await query("SELECT COUNT(*) as count FROM inventory WHERE name = ? AND status = 'In Stock'", [namePrefix || `${platform} Account`]);
            const wasOutOfStock = (currentStockRows[0]?.count || 0) === 0;

            for (const line of lines) {
                if (!line.trim()) continue;

                let username = '';
                let password = '';
                let email = '';
                let extra = '';

                // SMART PARSING
                // 1. Check for basic Excel Paste (Tab Separated)
                if (line.includes('\t')) {
                    const parts = line.split('\t');
                    username = parts[0]?.trim();
                    password = parts[1]?.trim();
                    email = parts[2]?.trim() || '';
                    extra = parts.length > 3 ? parts.slice(3).join(' | ').trim() : '';
                }
                // 2. Check for Standard Combolist (User:Pass:Email or User:Pass)
                else if (line.includes(':')) {
                    const parts = line.trim().split(':');
                    username = parts[0]?.trim();
                    password = parts[1]?.trim();
                    // If 3 parts, 3rd is email. If more, join defaults to extra.
                    if (parts.length === 3) {
                        email = parts[2]?.trim();
                    } else if (parts.length > 3) {
                        email = parts[2]?.trim();
                        extra = parts.slice(3).join(':').trim();
                    }
                }
                // 3. Last Resort (Comma separated)
                else if (line.includes(',')) {
                    const parts = line.split(',');
                    username = parts[0]?.trim();
                    password = parts[1]?.trim();
                    email = parts[2]?.trim() || '';
                }

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
                        extraInfo: extra
                    })
                };

                await query(
                    "INSERT INTO inventory (id, name, platform, purchasePrice, status, accountDetails) VALUES (?, ?, ?, ?, ?, ?)",
                    [newItem.id, newItem.name, newItem.platform, newItem.purchasePrice, newItem.status, newItem.accountDetails]
                );
                created.push(newItem);
            }

            // Restock Announcement
            if (wasOutOfStock && created.length > 0) {
                const settingsRows: any = await query("SELECT setting_key, setting_value FROM settings");
                const settings = settingsRows.reduce((acc: any, row: any) => ({ ...acc, [row.setting_key]: row.setting_value }), {});

                if (settings.telegram_bot_token && settings.telegram_chat_id) {
                    const { sendTelegramMessage } = require('@/lib/telegram');
                    await sendTelegramMessage(
                        settings.telegram_chat_id,
                        `🚀 <b>MASSIVE RESTOCK!</b>\n\n${created[0].name} is back in stock with ${created.length} new accounts!\n\n🛒 Shop now at OfficialUM1!`,
                        settings.telegram_bot_token
                    );
                }
            }

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Bulk Import', `Imported ${created.length} accounts for ${platform}`]
            );

            return NextResponse.json({ success: true, count: created.length });
        }

        if (action === 'delete_sale') {
            const { transactionId } = body;

            // 1. Find delivery to get inventory items
            const deliveryRes: any = await query("SELECT details FROM deliveries WHERE orderId = ?", [transactionId]);
            if (deliveryRes.length > 0) {
                const details = JSON.parse(deliveryRes[0].details || '{}');
                let ids = details.inventoryIds || [];

                // Fallback for single sales or old sales
                if (!ids || ids.length === 0) {
                    const transRes: any = await query("SELECT inventoryId FROM transactions WHERE id = ?", [transactionId]);
                    if (transRes.length > 0 && transRes[0].inventoryId && transRes[0].inventoryId !== 'bulk') {
                        ids = [transRes[0].inventoryId];
                    }
                }

                // 2. Mark items as In Stock
                if (ids && ids.length > 0) {
                    const placeholders = ids.map(() => '?').join(',');
                    await query(`UPDATE inventory SET status = 'In Stock' WHERE id IN (${placeholders})`, ids);
                }
            }

            // 3. Delete Delivery & Transaction
            await query("DELETE FROM deliveries WHERE orderId = ?", [transactionId]);
            await query("DELETE FROM transactions WHERE id = ?", [transactionId]);

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Delete Sale', `Deleted transaction ${transactionId} and restored stock`]
            );

            return NextResponse.json({ success: true });
        }

        if (action === 'replace_sale') {
            const { transactionId } = body;

            // 1. Get current delivery to identify old items
            const deliveryRes: any = await query("SELECT * FROM deliveries WHERE orderId = ?", [transactionId]);
            if (deliveryRes.length === 0) return NextResponse.json({ error: "No delivery found" }, { status: 404 });

            const delivery = deliveryRes[0];
            const oldDetails = JSON.parse(delivery.details || '{}');
            const oldIds = oldDetails.inventoryIds || [];

            if (!oldIds.length) return NextResponse.json({ error: "No original items found to replace. This feature requires orders made after the recent update." }, { status: 400 });

            // 2. Mark old items as Defective
            const placeholdersOld = oldIds.map(() => '?').join(',');
            await query(`UPDATE inventory SET status = 'Defective' WHERE id IN (${placeholdersOld})`, oldIds);

            // 3. Find replacement items of SAME product type
            const itemInfo: any = await query("SELECT name FROM inventory WHERE id = ?", [oldIds[0]]);
            if (!itemInfo.length) return NextResponse.json({ error: "Original item info lost" }, { status: 500 });
            const productName = itemInfo[0].name;
            const qty = oldIds.length;

            const newItems: any = await query(
                "SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT ?",
                [productName, qty]
            );

            if (newItems.length < qty) {
                // REVERT: If we can't replace, don't mark as defective yet? No, keep it defective but fail the replacement.
                return NextResponse.json({ error: `Not enough stock to replace. Needed: ${qty}, Available: ${newItems.length}` }, { status: 400 });
            }

            // 4. Assign new items
            let newIds = [];
            let newAccountsText = "";
            let newItemsList = [];

            for (const item of newItems) {
                await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [item.id]);
                newIds.push(item.id);

                const details = JSON.parse(item.accountDetails || '{}');
                newItemsList.push({
                    email: details.email || '',
                    user: details.username || '',
                    pass: details.password || '',
                    extra: details.extraInfo || ''
                });

                let loginPart = details.email || details.username;
                if (details.email && details.username && details.email !== details.username) {
                    loginPart = `${details.email}:${details.username}`;
                }
                newAccountsText += `${loginPart}:${details.password}${details.extraInfo ? `:${details.extraInfo}` : ''}\n`;
            }

            // 5. Update Delivery Record
            const newDetails = {
                ...oldDetails,
                note: (oldDetails.note || '') + ` (Replaced on ${new Date().toLocaleDateString()})`,
                accounts: newAccountsText,
                items: newItemsList,
                inventoryIds: newIds
            };

            await query("UPDATE deliveries SET details = ? WHERE orderId = ?", [JSON.stringify(newDetails), transactionId]);

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Replace Sale', `Replaced ${qty} items for transaction ${transactionId}`]
            );

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        console.error("Inventory POST Error:", e.message);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
