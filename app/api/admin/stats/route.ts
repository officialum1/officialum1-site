import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        let transStats: any = [{ totalRevenue: 0, totalProfit: 0, totalOrders: 0 }];
        let webOrders: any = [{ webRevenue: 0, webCount: 0 }];
        let g2gStats: any = [{ g2gRevenue: 0, g2gCount: 0 }];
        let stockStats: any = [{ stockValue: 0 }];
        let walletRows: any = [];

        // 1. Transaction Stats (Direct & Manual Sales)
        try {
            transStats = await query(`
                SELECT 
                    COALESCE(SUM(amount), 0) as totalRevenue,
                    COALESCE(SUM(amount - cost), 0) as totalProfit,
                    COUNT(*) as totalOrders
                FROM transactions
                WHERE type = 'sale'
                AND currency = 'USD'
            `) as any;
        } catch (e) { console.error("Stats Error (Trans):", e); }

        // 2. Wallet Breakdown
        try {
            walletRows = await query(`
                SELECT 
                    platform,
                    SUM(CASE 
                        WHEN type IN ('sale', 'deposit', 'bonus', 'adjustment', 'manual_adjustment') THEN amount 
                        WHEN type IN ('expense', 'purchase', 'payout', 'transfer_out') THEN -amount
                        ELSE 0 END) as balance
                FROM transactions
                GROUP BY platform
            `) as any;
        } catch (e) { console.error("Stats Error (Wallets):", e); }

        const wallets: any = {
            z2u: 0, g2g: 0, meezan: 0, ubl: 0, binance: 0, redotpay: 0, skrill: 0
        };

        walletRows.forEach((row: any) => {
            const p = row.platform?.toLowerCase() || '';
            if (p.includes('z2u')) wallets.z2u = Number(row.balance);
            else if (p.includes('g2g')) wallets.g2g = Number(row.balance);
            else if (p.includes('meezan')) wallets.meezan = Number(row.balance);
            else if (p.includes('ubl') || p.includes('paisa') || p.includes('jazz')) wallets.ubl = Number(row.balance);
            else if (p.includes('binance')) wallets.binance = Number(row.balance);
            else if (p.includes('redot')) wallets.redotpay = Number(row.balance);
            else if (p.includes('skrill')) wallets.skrill = Number(row.balance);
        });

        // 3. Web Store Stats
        try {
            webOrders = await query(`
                SELECT 
                    COALESCE(SUM(CAST(amount AS DECIMAL(10,2))), 0) as webRevenue,
                    COUNT(*) as webCount
                FROM orders
                WHERE status = 'paid' OR status = 'completed'
            `) as any;
        } catch (e) { console.error("Stats Error (Web):", e); }

        // 4. G2G Stats
        try {
            g2gStats = await query(`
                SELECT 
                    COALESCE(SUM(amount), 0) as g2gRevenue,
                    COUNT(*) as g2gCount
                FROM g2g_orders
            `) as any;
        } catch (e) { console.error("Stats Error (G2G):", e); }

        // 5. Stock Asset Value
        try {
            stockStats = await query(`
                SELECT COALESCE(SUM(purchasePrice), 0) as stockValue 
                FROM inventory 
                WHERE status = 'In Stock'
            `) as any;
        } catch (e) { console.error("Stats Error (Stock):", e); }

        const combinedRevenue = Number(transStats[0].totalRevenue) + Number(webOrders[0].webRevenue) + Number(g2gStats[0].g2gRevenue);
        const combinedOrders = Number(transStats[0].totalOrders) + Number(webOrders[0].webCount) + Number(g2gStats[0].g2gCount);
        const combinedProfit = Number(transStats[0].totalProfit) + (Number(webOrders[0].webRevenue) * 0.95) + (Number(g2gStats[0].g2gRevenue) * 0.95);

        return NextResponse.json({
            success: true,
            totalRevenue: combinedRevenue,
            totalProfit: combinedProfit,
            totalOrders: combinedOrders,
            totalVolume: combinedRevenue, // Alias for mobile app
            stockValue: Number(stockStats[0].stockValue),
            wallets,
            breakdown: {
                direct: transStats[0].totalRevenue,
                website: webOrders[0].webRevenue,
                g2g: g2gStats[0].g2gRevenue
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('Stats API Error:', error);
        return NextResponse.json({
            success: false,
            totalRevenue: 0,
            totalProfit: 0,
            totalOrders: 0,
            wallets: { z2u: 0, g2g: 0, meezan: 0, ubl: 0, binance: 0, redotpay: 0, skrill: 0 },
            error: error.message
        });
    }
}
