import { query } from './db';
import { sendAuditReport, sendDepositEmail } from './email';
import { sendTelegramMessage, sendTelegramAdminAlert } from './telegram';

export async function fulfillOrder(orderId: string) {
    try {
        console.log(`[Fulfillment] Starting for Order ${orderId}`);

        // 1. Get Order
        const orderRows: any = await query("SELECT * FROM orders WHERE orderId = ?", [orderId]);
        if (orderRows.length === 0) throw new Error("Order not found");
        const order = orderRows[0];

        if (order.status === 'paid' || order.status === 'completed') {
            console.log(`[Fulfillment] Order ${orderId} already processed.`);
            return;
        }

        // 2. Get Settings
        const settingsRows: any = await query("SELECT setting_key, setting_value FROM settings");
        const settings: any = {};
        settingsRows.forEach((s: any) => settings[s.setting_key] = s.setting_value);

        // 3. Mark as Paid
        await query("UPDATE orders SET status = 'paid' WHERE orderId = ?", [orderId]);

        // 4. Handle Wallet Deposit
        if (orderId.startsWith('DEP-')) {
            await query("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?", [order.amount, order.userId]);
            await query("INSERT INTO wallet_transactions (user_id, type, amount, description, status) VALUES (?, 'deposit', ?, ?, 'completed')",
                [order.userId, order.amount, `Deposit via ${order.method}`, 'completed']);

            // Notification
            await query("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [order.userId, "Deposit Successful! 💸", `Your wallet has been credited with $${order.amount} via ${order.method}.`, 'deposit']);

            // Email
            const uRows: any = await query("SELECT email FROM users WHERE id = ?", [order.userId]);
            if (uRows[0]?.email) {
                await sendDepositEmail(uRows[0].email, parseFloat(order.amount), order.method);
            }

            console.log(`[Fulfillment] Wallet credited for User ${order.userId}`);
            return;
        }

        // 5. Handle Membership Upgrade
        if (orderId.startsWith('MEM-')) {
            const plan = order.productId; // 'silver', 'gold', 'diamond'
            await query("UPDATE users SET membership = ?, membership_expires = DATE_ADD(NOW(), INTERVAL 30 DAY) WHERE id = ?", [plan, order.userId]);

            const uRows: any = await query("SELECT email FROM users WHERE id = ?", [order.userId]);
            const email = order.guestEmail || uRows[0]?.email;

            if (email) {
                await sendAuditReport(email, "VIP Access Activated!", {
                    pa: plan.toUpperCase() + " VIP Membership",
                    details: `Welcome to the elite! Your ${plan.toUpperCase()} VIP status is now active. Refresh your dashboard to see your new pricing.`
                }, settings);
            }

            await query("UPDATE orders SET status = 'completed' WHERE orderId = ?", [orderId]);
            console.log(`[Fulfillment] Membership activated for User ${order.userId}`);
            return;
        }

        // 6. Handle Product Delivery (Same as in checkout/process)
        const isBulk = orderId.startsWith('BULK-');
        let product: any = null;
        let itemsToProcess = [];

        if (isBulk) {
            // Bulk orders might need a separate table or a JSON blob in delivery_info
            // For now, if it's bulk and we don't have items saved, we can't auto-fulfill easily 
            // unless we saved them during checkout. 
            // Let's assume for now auto-fulfillment is primarily for single items or we need to refine this.
            console.log("[Fulfillment] Bulk auto-fulfillment not yet implemented in detail.");
            return;
        } else {
            const pRows: any = await query("SELECT * FROM products WHERE id = ?", [order.productId]);
            product = pRows[0];
            if (!product) throw new Error("Product not found");
            itemsToProcess = [{ id: order.productId, quantity: order.quantity }];
        }

        let combinedEmailBody = "Thank you for your purchase! Here are your order details:\n\n";

        for (const item of itemsToProcess) {
            const pRows: any = await query("SELECT * FROM products WHERE id = ?", [item.id]);
            const p = pRows[0];
            if (!p) continue;

            let itemCreds = "";
            const currentQuantity = item.quantity || 1;

            if (p.bundle_items) {
                const bundleIds = JSON.parse(p.bundle_items);
                itemCreds += `📦 **${p.name} Bundle:**\n`;
                for (const bundleId of bundleIds) {
                    const subRows: any = await query("SELECT name FROM products WHERE id = ?", [bundleId]);
                    if (subRows.length === 0) continue;
                    const subName = subRows[0].name;
                    const stockRows: any = await query("SELECT * FROM inventory WHERE name = ? AND status = 'In Stock' LIMIT ?", [subName, currentQuantity]);
                    if (stockRows.length < currentQuantity) {
                        itemCreds += `  ⚠️ ${subName}: Out of Stock (Contact Support)\n`;
                    } else {
                        for (const stockItem of stockRows) {
                            await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stockItem.id]);
                            const details = stockItem.accountDetails ? JSON.parse(stockItem.accountDetails) : {};
                            itemCreds += `  ✅ ${subName}: ${details.extraInfo || (details.email + ":" + details.password)}\n`;
                        }
                    }
                }
            } else if (p.type === 'service') {
                itemCreds += `⚡ **${p.name}:** Processing shortly.\n`;
            } else {
                let stockRows: any = [];

                // 1. Tag-Based Matching (Highest Priority)
                if (p.inventory_tag) {
                    stockRows = await query("SELECT * FROM inventory WHERE accountDetails LIKE ? AND status = 'In Stock' LIMIT ?", [`%${p.inventory_tag}%`, currentQuantity]);
                }

                // 2. Name-Based Matching (Fallback)
                if (stockRows.length < currentQuantity) {
                    const remainingNeeded = currentQuantity - stockRows.length;
                    const excludedIds = stockRows.length > 0 ? stockRows.map((r: any) => r.id) : [-1];

                    if (!p.inventory_tag) {
                        const fallbackRows: any = await query(
                            `SELECT * FROM inventory WHERE (name = ? OR platform = ?) AND status = 'In Stock' AND id NOT IN (${excludedIds.join(',')}) LIMIT ?`,
                            [p.name, p.platform, remainingNeeded]
                        );
                        stockRows = [...stockRows, ...fallbackRows];
                    }
                }

                if (stockRows.length >= currentQuantity) {
                    itemCreds += `✅ **${p.name}:**\n`;
                    for (const stockItem of stockRows) {
                        await query("UPDATE inventory SET status = 'Sold' WHERE id = ?", [stockItem.id]);
                        const details = stockItem.accountDetails ? JSON.parse(stockItem.accountDetails) : {};
                        const creds = details.extraInfo || (details.email ? `Email: ${details.email}\nPass: ${details.password}` : Object.values(details).join(':'));
                        itemCreds += `${creds}\n`;
                    }
                } else {
                    await query("UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?", [currentQuantity, p.id]);
                    itemCreds += `⏳ **${p.name}:** Pending manual fulfillment.\n`;
                }
            }
            combinedEmailBody += itemCreds + "\n---\n";
        }

        // --- UPDATE ORDER STATUS ---
        const needsManual = combinedEmailBody.includes("Pending manual fulfillment");
        const finalStatus = needsManual ? 'processing' : 'completed';
        await query("UPDATE orders SET status = ? WHERE orderId = ?", [finalStatus, orderId]);

        // Send Email
        const userRows: any = await query("SELECT email FROM users WHERE id = ?", [order.userId]);
        const email = order.guestEmail || userRows[0]?.email;
        if (email) {
            await sendAuditReport(email, "Order #" + orderId, {
                da: "ORDER CONFIRMED",
                pa: product?.name || "Order",
                links: Number(order.amount),
                details: combinedEmailBody
            }, settings);

            // Notification
            if (order.userId !== 'guest') {
                await query("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                    [order.userId, "Order Delivered! 📦", `Your order #${orderId} for ${product?.name} has been delivered. Check your emails or My Orders.`, 'order']);
            }
        }

        // UPDATE TOTAL SPENT & POINTS
        if (order.userId !== 'guest') {
            await query("UPDATE users SET total_spent = total_spent + ?, points = points + ? WHERE id = ?",
                [parseFloat(order.amount), Math.floor(parseFloat(order.amount)), order.userId]);
        }

        console.log(`[Fulfillment] Completed for Order ${orderId}`);

    } catch (e: any) {
        console.error(`[Fulfillment] Error:`, e);
    }
}
