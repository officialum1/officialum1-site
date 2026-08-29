const mysql = require('mysql2/promise');

async function check() {
    const config = {
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit',
        ssl: { rejectUnauthorized: false }
    };

    const connection = await mysql.createConnection(config);
    try {
        const [users] = await connection.execute("SELECT id, email, role FROM users");
        console.log("All Users and Roles:");
        console.table(users);

        const buyers = users.filter(u => u.role === 'buyer' || u.role === 'user');
        console.log("Filtered Buyers (role == buyer or user):", buyers.length);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await connection.end();
    }
}

check();
