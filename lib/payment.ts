import { query } from './db';
import { sendAuditReport } from './email';
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
            console.log(`[Fulfillment] Wallet credited for User ${order.userId}`);
            return;
        }

        // 5. Handle Membership Upgrade
        // (If we had a field in order to identify membership, but for now we assume it's a product or we check productId)

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
                const stockRows: any = await query("SELECT * FROM inventory WHERE (name = ? OR platform = ?) AND status = 'In Stock' LIMIT ?", [p.name, p.platform, currentQuantity]);
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
