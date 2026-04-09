import { NextResponse } from 'next/server';
import { query, withTransaction } from '@/lib/db';
import { syncG2GStock } from '@/lib/g2g';
import { ApiResponse } from '@/lib/api-response';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    if (!await isAuthenticated()) return ApiResponse.unauthorized();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const role = searchParams.get('role');
    const action = searchParams.get('action');

    try {
        if (action === 'get_tickets') {
            const tickets = await query("SELECT * FROM tickets ORDER BY created_at DESC");
            return ApiResponse.success(tickets);
        }
        if (type === 'balance') {
            let transactions: any[] = [];
            const email = searchParams.get('email');

            if (role === 'staff') {
                if (!email) return ApiResponse.success([]);
                // Staff only sees their own transactions
                const staffInfo: any = await query("SELECT name FROM employees WHERE email = ?", [email]);
                const staffName = staffInfo.length > 0 ? staffInfo[0].name : null;

                transactions = (await query(
                    "SELECT * FROM transactions WHERE processedBy = ? OR (processedBy = ? AND ? IS NOT NULL) ORDER BY date DESC",
                    [email, staffName, staffName]
                )) as any[];
            } else {
                transactions = (await query("SELECT * FROM transactions ORDER BY date DESC")) as any[];
            }

            // Fetch deliveries to map tokens
            const deliveries = (await query("SELECT orderId, token, views, ipAddress, userAgent, revealedAt FROM deliveries")) as any[];

            // Merge
            const merged = transactions.map((t: any) => {
                const delivery = deliveries.find((d: any) => d.orderId === t.id);
                return {
                    ...t,
                    deliveryToken: delivery ? delivery.token : null,
                    deliveryViews: delivery ? delivery.views || 0 : 0,
                    ipAddress: delivery ? delivery.ipAddress : null,
                    userAgent: delivery ? delivery.userAgent : null,
                    revealedAt: delivery ? delivery.revealedAt : null
                };
            });

            return ApiResponse.success(merged);
        }

        // Default: Inventory
        let sql = "SELECT * FROM inventory";
        let params: any[] = [];

        // Staff Permission Check
        if (role === 'staff') {
            const email = searchParams.get('email');
            if (!email) return ApiResponse.success([]);

            const staffRes: any = await query("SELECT allowedPlatforms FROM employees WHERE email = ?", [email]);
            if (staffRes.length === 0) return ApiResponse.success([]);

            const allowed = JSON.parse(staffRes[0].allowedPlatforms || '[]');
            if (allowed.length > 0) {
                const placeholders = allowed.map(() => '?').join(',');
                sql += ` WHERE platform IN (${placeholders})`;
                params = allowed;
            } else {
                return ApiResponse.success([]);
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

        return ApiResponse.success(parsed);
    } catch (e: any) {
        return ApiResponse.internalError(e);
    }
}

export async function POST(request: Request) {
    if (!await isAuthenticated()) return ApiResponse.unauthorized();

    try {
        const body = await request.json();
        const action = body.action;

        if (action === 'add_inventory') {
            const result = await withTransaction(async (conn) => {
                // Check if it was out of stock before adding
                const [currentStockRows]: any = await conn.execute("SELECT COUNT(*) as count FROM inventory WHERE name = ? AND status = 'In Stock'", [body.name]);
                const wasOutOfStock = (currentStockRows[0]?.count || 0) === 0;

                const detailsObj = {
                    username: body.username || '',
                    password: body.password || '',
                    email: body.email || '',
                    emailPassword: body.emailPassword || '',
                    country: body.country || '',
                    extraInfo: body.extraInfo || '',
                    tag: body.tag || ''
                };

                const newItem: any = {
                    id: `inv_${Date.now()}`,
                    name: body.name,
                    platform: body.platform,
                    purchasePrice: Number(body.purchasePrice),
                    status: 'In Stock',
                    accountDetails: JSON.stringify(detailsObj),
                    account_email: detailsObj.email,
                    account_username: detailsObj.username,
                    account_password: detailsObj.password,
                    account_region: body.country || body.region || null,
                    account_level: body.level || null,
                    image: body.image || null
                };

                await conn.execute(
                    `INSERT INTO inventory (id, name, platform, purchasePrice, status, accountDetails, account_email, account_username, account_password, account_region, account_level, image) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [newItem.id, newItem.name, newItem.platform, newItem.purchasePrice, newItem.status, newItem.accountDetails, newItem.account_email, newItem.account_username, newItem.account_password, newItem.account_region, newItem.account_level, newItem.image]
                );

                // Restock Announcement
                if (wasOutOfStock) {
                    const [settingsRows]: any = await conn.execute("SELECT setting_key, setting_value FROM settings");
                    const settings = settingsRows.reduce((acc: any, row: any) => ({ ...acc, [row.setting_key]: row.setting_value }), {});

                    if (settings.telegram_bot_token && settings.telegram_chat_id) {
                        try {
                            const { sendTelegramMessage } = require('@/lib/telegram');
                            await sendTelegramMessage(
                                settings.telegram_chat_id,
                                `✨ <b>RESTOCK ALERT!</b>\n\n${newItem.name} is now back in stock!\n\n🚀 Grab yours now at OfficialUM1!`,
                                settings.telegram_bot_token
                            );
                        } catch (e) { console.error("Telegram fail", e); }
                    }
                }

                // Log
                await conn.execute("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                    [`log_${Date.now()}`, 'Admin', 'Add Inventory', `Added ${newItem.name} (${newItem.platform})`]
                );

                return newItem;
            });
            // Sync G2G - OUTSIDE transaction to avoid locking
            await syncG2GStock(body.name);
            return ApiResponse.success(result);
        }

        if (action === 'record_sale') {
            // Migration: Ensure currency exists
            try { await query("ALTER TABLE transactions ADD COLUMN currency VARCHAR(10) DEFAULT 'USD'"); } catch (e) { }
            const transactionId = `trans_${Date.now()}`;
            let deliveryData = null;
            let soldInventoryIds: string[] = [];
            let combinedDetailsText = "";

            let totalCost = 0;

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
                    return ApiResponse.error(`Not enough stock. Requested: ${qty}, Available: ${availableItems.length}`, 400);
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
                        emailPass: details.emailPassword || '',
                        country: details.country || '',
                        extra: details.extraInfo || '',
                        image: item.image || ''
                    });

                    // Format: "email:username:password" (Only include email/username if they exist and are different)
                    let loginPart = details.email || details.username;
                    if (details.email && details.username && details.email !== details.username) {
                        loginPart = `${details.email}:${details.username}`;
                    }

                    totalCost += Number(item.purchasePrice || 0);
                    const line = `${loginPart}:${details.password}${details.emailPassword ? `:${details.emailPassword}` : ''}${details.country ? `:${details.country}` : ''}${details.extraInfo ? `:${details.extraInfo}` : ''}`;
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

                    // Ensure details has a consistent structure with inventoryIds
                    const deliveryDetails = {
                        ...details,
                        image: item.image || '',
                        inventoryIds: [body.inventoryId]
                    };

                    deliveryData = {
                        token,
                        details: deliveryDetails,
                        itemName: item.name,
                        proofImage: body.proofImage || null
                    };

                    totalCost = Number(item.purchasePrice || 0);

                    await query(
                        "INSERT INTO deliveries (token, orderId, itemName, details, proofImage) VALUES (?, ?, ?, ?, ?)",
                        [token, transactionId, item.name, JSON.stringify(deliveryDetails), body.proofImage || null]
                    );
                }
            }

            // Record Transaction
            const newTransaction = {
                id: transactionId,
                type: 'sale',
                platform: body.platform,
                amount: Number(body.salePrice),
                currency: body.currency || 'USD',
                description: body.description || (body.mode === 'bulk' ? `Bulk Sale: ${body.quantity}x ${body.productName}` : 'Direct Sale'),
                processedBy: body.staffName || 'Admin',
                inventoryId: soldInventoryIds.length === 1 ? soldInventoryIds[0] : 'bulk',
                quantity: body.mode === 'bulk' ? parseInt(body.quantity || '1') : 1
            };

            await query(
                "INSERT INTO transactions (id, type, platform, amount, currency, description, processedBy, inventoryId, cost, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [newTransaction.id, newTransaction.type, newTransaction.platform, newTransaction.amount, newTransaction.currency, newTransaction.description, newTransaction.processedBy, newTransaction.inventoryId, totalCost, newTransaction.quantity]
            );

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, newTransaction.processedBy, 'Record Sale', `Sold items for $${newTransaction.amount} (${newTransaction.platform})`]
            );

            // Sync G2G
            await syncG2GStock(body.mode === 'bulk' ? body.productName : body.itemName);

            return ApiResponse.success({ success: true, transaction: newTransaction, delivery: deliveryData });
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
                let tag = '';

                // SMART PARSING
                // 1. Check for Tab Separated (Excel)
                if (line.includes('\t')) {
                    const parts = line.split('\t');
                    username = parts[0]?.trim() || '';
                    password = parts[1]?.trim() || '';

                    // Intelligent assignment based on content
                    for (let i = 2; i < parts.length; i++) {
                        const p = parts[i]?.trim();
                        if (!p) continue;
                        if (p.includes('@')) email = p;
                        else if (p.startsWith('#')) tag = p;
                        else if (!extra) extra = p; // First unknown part is extra
                        else extra += ' ' + p;
                    }
                }
                // 2. Check for Colon Separated (Standard Combolist)
                else if (line.includes(':')) {
                    const parts = line.trim().split(':');
                    username = parts[0]?.trim() || '';
                    password = parts[1]?.trim() || '';

                    for (let i = 2; i < parts.length; i++) {
                        const p = parts[i]?.trim();
                        if (!p) continue;
                        if (p.includes('@')) email = p;
                        else if (p.startsWith('#')) tag = p;
                        else if (!extra) extra = p;
                        else extra += ':' + p;
                    }
                }
                // 3. Last Resort (Comma separated)
                else if (line.includes(',')) {
                    const parts = line.split(',');
                    username = parts[0]?.trim() || '';
                    password = parts[1]?.trim() || '';
                    if (parts[2]?.includes('@')) email = parts[2].trim();
                    else extra = parts.slice(2).join(',').trim();
                }
                // 4. Single line / No delimiter (Assume username)
                else {
                    username = line.trim();
                    password = 'PASSWORD_REQUIRED';
                }

                // POST-PROCESSING: If username is an email but email is empty, sync them
                if (username.includes('@') && !email) {
                    email = username;
                }

                if (!username || !password) continue;

                const newItem = {
                    id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                    name: namePrefix || `${platform} Account`,
                    platform: platform,
                    purchasePrice: Number(purchasePrice) || 0,
                    status: 'In Stock',
                    accountDetails: JSON.stringify({
                        username, password, email, extraInfo: extra, tag: tag
                    }),
                    account_email: email,
                    account_username: username,
                    account_password: password
                };

                await query(
                    `INSERT INTO inventory (id, name, platform, purchasePrice, status, accountDetails, account_email, account_username, account_password) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [newItem.id, newItem.name, newItem.platform, newItem.purchasePrice, newItem.status, newItem.accountDetails, newItem.account_email, newItem.account_username, newItem.account_password]
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

            // Sync G2G
            if (created.length > 0) await syncG2GStock(created[0].name);

            return ApiResponse.success({ success: true, count: created.length });
        }

        if (action === 'delete_sale') {
            const { transactionId } = body;
            return await withTransaction(async (conn) => {
                // 1. Find delivery to get inventory items
                const [deliveryRes]: any = await conn.execute("SELECT details FROM deliveries WHERE orderId = ?", [transactionId]);
                if (deliveryRes.length > 0) {
                    const details = JSON.parse(deliveryRes[0].details || '{}');
                    let ids = details.inventoryIds || [];

                    if (!ids || ids.length === 0) {
                        const [transRes]: any = await conn.execute("SELECT inventoryId FROM transactions WHERE id = ?", [transactionId]);
                        if (transRes.length > 0 && transRes[0].inventoryId && transRes[0].inventoryId !== 'bulk') {
                            ids = [transRes[0].inventoryId];
                        }
                    }

                    // 2. Mark items as In Stock
                    if (ids && ids.length > 0) {
                        const placeholders = ids.map(() => '?').join(',');
                        await conn.execute(`UPDATE inventory SET status = 'In Stock' WHERE id IN (${placeholders})`, ids);

                        const [nameRes]: any = await conn.execute("SELECT name FROM inventory WHERE id = ?", [ids[0]]);
                        if (nameRes.length > 0) await syncG2GStock(nameRes[0].name);
                    }
                }

                // 3. Delete Delivery & Transaction
                await conn.execute("DELETE FROM deliveries WHERE orderId = ?", [transactionId]);
                await conn.execute("DELETE FROM transactions WHERE id = ?", [transactionId]);

                // Log
                await conn.execute("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                    [`log_${Date.now()}`, 'Admin', 'Delete Sale', `Deleted transaction ${transactionId} and restored stock`]
                );

                return ApiResponse.success({ success: true });
            });
        }

        if (action === 'replace_item') {
            const { itemId, replacementData } = body;

            return await withTransaction(async (conn) => {
                // 1. Get original item details
                const [itemRows]: any = await conn.execute("SELECT name, status FROM inventory WHERE id = ?", [itemId]);
                if (!itemRows.length) throw new Error("Item not found");
                const oldItem = itemRows[0];
                if (oldItem.status !== 'Sold') throw new Error("Only sold items can be replaced");

                // 2. Find which delivery this item belongs to
                // We search the 'details' JSON field for the inventoryId
                const [delRes]: any = await conn.execute("SELECT * FROM deliveries WHERE details LIKE ?", [`%${itemId}%`]);
                if (!delRes.length) throw new Error("No associated delivery record found for this item");

                const delivery = delRes[0];
                const details = JSON.parse(delivery.details || '{}');
                const inventoryIds = details.inventoryIds || [];
                const itemsList = details.items || [];

                // 3. Mark old item as Defective
                await conn.execute("UPDATE inventory SET status = 'Defective' WHERE id = ?", [itemId]);

                if (replacementData) {
                    // Try to parse the pasted data if it's in user:pass:email:emailPass:extra format
                    const parts = replacementData.split(':');
                    let user = '', pass = '', email = '', emailPass = '', extra = '';

                    if (parts.length >= 1) user = parts[0].trim();
                    if (parts.length >= 2) pass = parts[1].trim();
                    if (parts.length >= 3) email = parts[2].trim();
                    if (parts.length >= 4) emailPass = parts[3].trim();
                    if (parts.length >= 5) extra = parts.slice(4).join(':').trim();

                    if (user.includes('@') && !email) email = user;

                    // Ensure there's at least a pass, if not dump it all in user
                    if (!pass) {
                        user = "Manual Setup";
                        pass = replacementData;
                    }

                    // Manual replacement: skip stock check and overwrite directly
                    const updatedDetails = {
                        ...details,
                        note: (details.note || '') + ` (Item ${itemId} manually replaced on ${new Date().toLocaleDateString()})`,
                        accounts: replacementData,
                        items: [{ user, pass, email, emailPass, extra }],
                        isReplacement: true
                    };

                    const newToken = Math.random().toString(36).substring(2, 10);
                    await conn.execute("UPDATE deliveries SET details = ?, token = ? WHERE token = ?", [JSON.stringify(updatedDetails), newToken, delivery.token]);

                    await conn.execute("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                        [`log_${Date.now()}`, 'Admin', 'Replace Item', `Manually replaced item ${itemId} in order ${delivery.orderId} (New Link Generated)`]
                    );

                    await syncG2GStock(oldItem.name);
                    return ApiResponse.success({ success: true, replacementId: 'manual', newToken });
                }

                // 4. Find ONE replacement item of SAME product type
                const [newItems]: any = await conn.execute(
                    "SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT 1",
                    [oldItem.name]
                );

                if (newItems.length === 0) throw new Error(`Not enough stock. No '${oldItem.name}' available.`);
                const newItem = newItems[0];

                // 5. Mark new item as Sold
                await conn.execute("UPDATE inventory SET status = 'Sold' WHERE id = ?", [newItem.id]);

                // 6. Update Delivery Details JSON
                // Swap the ID in inventoryIds array
                const newInventoryIds = inventoryIds.map((id: string) => id === itemId ? newItem.id : id);

                // Swap the details in items list
                const newItemDetails = JSON.parse(newItem.accountDetails || '{}');
                const newItemsList = itemsList.map((it: any) => {
                    // Try to match based on credentials if possible, or just replace one matching item
                    // For simplicity, if we can't perfectly match, we'll rebuild the accounts text later
                    return it;
                });

                // Rebuild the 'accounts' string and 'items' list
                let newAccountsText = "";
                let updatedItemsList = [];

                // We need to fetch ALL items in the new inventoryIds to rebuild the text correctly
                const placeholders = newInventoryIds.map(() => '?').join(',');
                const [allCurrentItems]: any = await conn.execute(`SELECT accountDetails, id FROM inventory WHERE id IN (${placeholders})`, newInventoryIds);

                // Sort them back to original order
                const sortedItems = newInventoryIds.map((id: string) => allCurrentItems.find((i: any) => i.id === id));

                for (const item of sortedItems) {
                    if (!item) continue;
                    const det = JSON.parse(item.accountDetails || '{}');
                    updatedItemsList.push({
                        email: det.email || '',
                        user: det.username || '',
                        pass: det.password || '',
                        extra: det.extraInfo || ''
                    });

                    let loginPart = det.username || det.email;
                    if (det.email && det.username && det.email !== det.username) {
                        loginPart = `${det.email}:${det.username}`;
                    }
                    newAccountsText += `${loginPart}:${det.password}${det.emailPassword ? `:${det.emailPassword}` : ''}${det.country ? `:${det.country}` : ''}${det.extraInfo ? `:${det.extraInfo}` : ''}\n`;
                }

                const updatedDetails = {
                    ...details,
                    note: (details.note || '') + ` (Item ${itemId} replaced by ${newItem.id} on ${new Date().toLocaleDateString()})`,
                    accounts: newAccountsText,
                    items: updatedItemsList,
                    inventoryIds: newInventoryIds,
                    isReplacement: true
                };

                const newToken = Math.random().toString(36).substring(2, 10);
                await conn.execute("UPDATE deliveries SET details = ?, token = ? WHERE token = ?", [JSON.stringify(updatedDetails), newToken, delivery.token]);

                // 7. Log
                await conn.execute("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                    [`log_${Date.now()}`, 'Admin', 'Replace Item', `Replaced item ${itemId} with ${newItem.id} in order ${delivery.orderId} (New Link Generated)`]
                );

                // Sync G2G
                await syncG2GStock(oldItem.name);

                return ApiResponse.success({ success: true, replacementId: newItem.id, newToken });
            });
        }

        if (action === 'update_item') {
            const { itemId, name, platform, purchasePrice, credentials, tag, image, username: upUser, password: upPass, email: upEmail, emailPassword: upEmailPass, country: upCountry, extraInfo: upExtra } = body;

            // Priority to direct fields, fallback to credentials parse
            let username = upUser || '', password = upPass || '', email = upEmail || '', extra = upExtra || '';
            let emailPassword = upEmailPass || '', country = upCountry || '';

            if (!username && credentials) {
                const parts = credentials.split(':');
                if (parts.length >= 1) username = parts[0].trim();
                if (parts.length >= 2) password = parts[1].trim();
                if (parts.length >= 3) email = parts[2].trim();
                if (parts.length >= 4) extra = parts.slice(3).join(':').trim();
            }

            if (username.includes('@') && !email) email = username;

            const detailsObj = {
                username,
                password,
                email,
                emailPassword,
                country,
                extraInfo: extra,
                tag: tag || ''
            };

            await query(
                `UPDATE inventory 
                 SET name = ?, platform = ?, purchasePrice = ?, accountDetails = ?, account_email = ?, account_username = ?, account_password = ?, account_region = ?, image = ?
                 WHERE id = ?`,
                [name, platform, Number(purchasePrice), JSON.stringify(detailsObj), email, username, password, country || null, image || null, itemId]
            );

            // Log
            await query("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                [`log_${Date.now()}`, 'Admin', 'Update Item', `Updated item ${itemId} (${name})`]
            );

            return ApiResponse.success({ success: true });
        }

        if (action === 'replace_sale') {
            const { transactionId } = body;

            return await withTransaction(async (conn) => {
                // 1. Get current delivery to identify old items
                const [deliveryRes]: any = await conn.execute("SELECT * FROM deliveries WHERE orderId = ?", [transactionId]);
                if (deliveryRes.length === 0) throw new Error("No delivery found");

                const delivery = deliveryRes[0];
                const oldDetails = JSON.parse(delivery.details || '{}');
                let oldIds = oldDetails.inventoryIds || [];

                // FALLBACK for legacy orders: check transactions table
                if (!oldIds.length) {
                    const [transRes]: any = await conn.execute("SELECT inventoryId FROM transactions WHERE id = ?", [transactionId]);
                    if (transRes.length > 0 && transRes[0].inventoryId && transRes[0].inventoryId !== 'bulk') {
                        oldIds = [transRes[0].inventoryId];
                    }
                }

                if (!oldIds.length) throw new Error("No original items found to replace. If this was a legacy bulk sale, it cannot be auto-replaced.");

                // 2. Mark old items as Defective
                const placeholdersOld = oldIds.map(() => '?').join(',');
                await conn.execute(`UPDATE inventory SET status = 'Defective' WHERE id IN (${placeholdersOld})`, oldIds);

                // 3. Find replacement items of SAME product type
                const [itemInfo]: any = await conn.execute("SELECT name FROM inventory WHERE id = ?", [oldIds[0]]);
                if (!itemInfo.length) throw new Error("Original item info lost");
                const productName = itemInfo[0].name;
                const qty = oldIds.length;

                let newIds = [];
                let newAccountsText = "";
                let newItemsList = [];

                if (body.replacementData) {
                    newAccountsText = body.replacementData;

                    // Try to parse the pasted data if it's in user:pass:email:emailPass:extra format
                    const parts = body.replacementData.split(':');
                    let user = '', pass = '', email = '', emailPass = '', extra = '';

                    if (parts.length >= 1) user = parts[0].trim();
                    if (parts.length >= 2) pass = parts[1].trim();
                    if (parts.length >= 3) email = parts[2].trim();
                    if (parts.length >= 4) emailPass = parts[3].trim();
                    if (parts.length >= 5) extra = parts.slice(4).join(':').trim();

                    if (user.includes('@') && !email) email = user;

                    // Ensure there's at least a pass, if not dump it all in user
                    if (!pass) {
                        user = "Manual Setup";
                        pass = body.replacementData;
                    }

                    newItemsList = [{ user, pass, email, emailPass, extra }];
                    newIds = oldIds; // Keep original IDs just to not break schema, they are marked defective anyway
                } else {
                    const [newItems]: any = await conn.execute(
                        `SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT ${parseInt(qty as any)}`,
                        [productName]
                    );

                    if (newItems.length < qty) {
                        throw new Error(`Not enough stock to replace. Needed: ${qty}, Available: ${newItems.length}`);
                    }

                    // 4. Assign new items
                    for (const item of newItems) {
                        await conn.execute("UPDATE inventory SET status = 'Sold' WHERE id = ?", [item.id]);
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
                        newAccountsText += `${loginPart}:${details.password}${details.emailPassword ? `:${details.emailPassword}` : ''}${details.country ? `:${details.country}` : ''}${details.extraInfo ? `:${details.extraInfo}` : ''}\n`;
                    }
                }

                // 5. Update Delivery Record
                const newDetails = {
                    ...oldDetails,
                    note: (oldDetails.note || '') + ` (Replaced on ${new Date().toLocaleDateString()})`,
                    accounts: newAccountsText,
                    items: newItemsList,
                    inventoryIds: newIds,
                    isReplacement: true
                };

                const newToken = Math.random().toString(36).substring(2, 10);
                await conn.execute("UPDATE deliveries SET details = ?, token = ? WHERE orderId = ?", [JSON.stringify(newDetails), newToken, transactionId]);

                // Log
                await conn.execute("INSERT INTO activity_logs (id, user, action, details) VALUES (?, ?, ?, ?)",
                    [`log_${Date.now()}`, 'Admin', 'Replace Sale', `Replaced ${qty} items for transaction ${transactionId} (New Link Generated)`]
                );

                // Sync G2G
                await syncG2GStock(productName);

                return ApiResponse.success({ success: true, newToken });
            });
        }

        if (action === 'resolve_ticket') {
            const { id, resolution } = body;
            await query("UPDATE tickets SET status = ? WHERE id = ?", [resolution, id]);
            return ApiResponse.success({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ success: false, error: e.message || 'An internal server error occurred.' }, { status: 500 });
    }
}
