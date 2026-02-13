const mysql = require('mysql2/promise');

async function groupStats() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit'
    });

    try {
        console.log('--- TRANSACTIONS BY MONTH ---');
        const [trans] = await connection.execute(`
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(amount) as revenue,
                COUNT(*) as count
            FROM transactions 
            WHERE type = 'sale'
            GROUP BY month
        `);
        console.table(trans);

        console.log('\n--- ORDERS BY MONTH ---');
        const [orders] = await connection.execute(`
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(CASE 
                    WHEN CAST(amount AS DECIMAL(10,2)) > 0 THEN CAST(amount AS DECIMAL(10,2))
                    ELSE 0 -- We'll check fallback separately
                END) as revenue,
                COUNT(*) as count
            FROM orders 
            WHERE status IN ('paid', 'completed')
            GROUP BY month
        `);
        console.table(orders);

        console.log('\n--- FULL DATA CHECK (Feb 2026) ---');
        const [febTrans] = await connection.execute("SELECT id, amount, date FROM transactions WHERE type='sale' AND date >= '2026-02-01'");
        console.log('Feb Transactions:', febTrans);

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

groupStats();
