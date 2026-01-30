const mysql = require('mysql2/promise');

async function check() {
    const config = { host: '82.197.82.131', user: 'u815786501_officialum1sit', password: '78b?aY&DkF8RM@y', database: 'u815786501_officialum1sit', ssl: { rejectUnauthorized: false } };
    const connection = await mysql.createConnection(config);
    try {
        const [users] = await connection.execute("SELECT * FROM users");
        console.log("Total Users in DB:", users.length);
        console.table(users.map(u => ({ id: u.id, email: u.email, role: u.role, created_at: u.created_at })));
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await connection.end();
    }
}

check();
