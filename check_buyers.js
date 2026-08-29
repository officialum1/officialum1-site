const mysql = require('mysql2/promise');

async function check() {
    const config = { host: '82.197.82.131', user: 'u815786501_officialum1sit', password: '78b?aY&DkF8RM@y', database: 'u815786501_officialum1sit', ssl: { rejectUnauthorized: false } };
    const connection = await mysql.createConnection(config);
    try {
        const [orders] = await connection.execute("SELECT DISTINCT guestEmail FROM orders WHERE guestEmail IS NOT NULL AND guestEmail != ''");
        console.log("Unique Guest Emails in Orders:", orders.length);
        console.table(orders);

        const [users] = await connection.execute("SELECT email FROM users WHERE role = 'buyer'");
        console.log("Registered Buyers:", users.length);
        console.table(users);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await connection.end();
    }
}

check();
