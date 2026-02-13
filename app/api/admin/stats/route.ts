import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Date Ranges (Fixed strings for MySQL)
        const now = new Date();
        const curMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

        // Calculate last month strings
        let lmYear = now.getFullYear();
        let lmMonth = now.getMonth(); // previous month index
        if (lmMonth === 0) { // If January, last month is Dec of prev year
            lmMonth = 12;
            lmYear--;
        }
        const lastMonthStr = `${lmYear}-${String(lmMonth).padStart(2, '0')}-01`;
        const lastMonthEndStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`; // Start of current is end of last

        // Helper to fetch stats for a range (STRICTLY FROM TRANSACTIONS to match Web UI)
        const getRangeStats = async (startStr: string, endStr?: string) => {
            const dateFilter = endStr ? "AND date >= ? AND date < ?" : "AND date >= ?";
            const params = endStr ? [startStr, endStr] : [startStr];

            const t = await query(`
                SELECT 
                    COALESCE(SUM(amount), 0) as rev,
                    COALESCE(SUM(amount - cost), 0) as prof,
                    COUNT(*) as count
                FROM transactions WHERE type = 'sale' AND currency = 'USD' ${dateFilter}
            `, params) as any[];

            const tr = t[0] || { rev: 0, prof: 0, count: 0 };

            return {
                revenue: Number(tr.rev),
                profit: Number(tr.prof),
                orders: Number(tr.count)
            };
        };

        const currentMonth = await getRangeStats(curMonthStr);
        const lastMonth = await getRangeStats(lastMonthStr, lastMonthEndStr);

        // --- LIFETIME STATS (Strictly Transactions) ---
        let lifetime: any = { revenue: 0, profit: 0, orders: 0 };
        try {
            const rows = await query(`
                SELECT 
                    COALESCE(SUM(amount), 0) as rev, 
                    COALESCE(SUM(amount - cost), 0) as prof, 
                    COUNT(*) as count 
                FROM transactions 
                WHERE type = 'sale' AND currency = 'USD'
            `) as any[];
            if (rows.length) {
                lifetime = {
                    revenue: Number(rows[0].rev),
                    profit: Number(rows[0].prof),
                    orders: Number(rows[0].count)
                };
            }
        } catch (e) { }

        // Wallet Breakdown (Keep as is, it's already transaction based)
        let walletRows: any[] = [];
        try {
            walletRows = await query(`
                    SELECT 
                        platform,
                        SUM(CASE 
                            WHEN type IN ('sale', 'deposit', 'bonus', 'adjustment', 'manual_adjustment', 'transfer_in') THEN amount 
                            WHEN type IN ('expense', 'purchase', 'payout', 'transfer_out') THEN -amount
                            ELSE 0 END) as balance
                    FROM transactions
                    GROUP BY platform
                `) as any[];
        } catch (e) { }

        const wallets: any = { z2u: 0, g2g: 0, meezan: 0, ubl: 0, binance: 0, redotpay: 0, skrill: 0 };
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

        // Stock Value
        let stockVal = 0;
        try {
            const rows = await query(`SELECT COALESCE(SUM(purchasePrice), 0) as val FROM inventory WHERE status = 'In Stock'`) as any[];
            if (rows.length) stockVal = Number(rows[0].val);
        } catch (e) { }

        // --- PRODUCT PROFIT (STRICTLY FROM TRANSACTIONS) ---
        let productProfit: any[] = [];
        try {
            productProfit = await query(`
                SELECT 
                    description as name, 
                    SUM(amount - cost) as profit
                FROM transactions 
                WHERE type = 'sale' AND currency = 'USD'
                GROUP BY description
                ORDER BY profit DESC
                LIMIT 10
            `) as any[];
        } catch (e) { }

        // --- TOP SELLING (STRICTLY FROM TRANSACTIONS) ---
        let productVolume: any[] = [];
        try {
            productVolume = await query(`
                SELECT 
                    description as name, 
                    COUNT(*) as count
                FROM transactions 
                WHERE type = 'sale' AND currency = 'USD'
                GROUP BY description
                ORDER BY count DESC
                LIMIT 10
            `) as any[];
        } catch (e) { }

        // --- MONTHLY BREAKDOWN (LIFETIME) ---
        let monthlyBreakdown: any[] = [];
        try {
            monthlyBreakdown = await query(`
                SELECT 
                    DATE_FORMAT(date, '%Y-%m') as month,
                    SUM(amount - cost) as profit,
                    SUM(amount) as revenue
                FROM transactions 
                WHERE type = 'sale' AND currency = 'USD'
                GROUP BY DATE_FORMAT(date, '%Y-%m')
                ORDER BY month DESC
                LIMIT 12
            `) as any[];
        } catch (e) { }

        // --- RECENT TRANSACTIONS ---
        let recentTransactions: any[] = [];
        try {
            recentTransactions = await query(`
                SELECT * FROM transactions 
                ORDER BY date DESC 
                LIMIT 20
            `) as any[];
        } catch (e) { }

        return NextResponse.json({
            success: true,
            totalRevenue: currentMonth.revenue,
            totalProfit: currentMonth.profit,
            totalOrders: currentMonth.orders,
            totalVolume: currentMonth.revenue,
            currentMonth,
            lastMonth,
            lifetime: lifetime,
            stockValue: stockVal,
            wallets,
            productProfit,
            productVolume,
            monthlyBreakdown,
            recentTransactions,
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

