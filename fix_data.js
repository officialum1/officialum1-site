const mysql = require('mysql2/promise');

async function fix() {
    const config = { host: '82.197.82.131', user: 'u815786501_officialum1sit', password: '78b?aY&DkF8RM@y', database: 'u815786501_officialum1sit', ssl: { rejectUnauthorized: false } };
    const connection = await mysql.createConnection(config);
    try {
        const newId = 'user_initial_fix_' + Date.now();
        await connection.execute("UPDATE users SET id = ? WHERE email = 'mr.rj001@gmail.com' AND (id = '' OR id IS NULL)", [newId]);
        console.log("Fixed user ID for mr.rj001@gmail.com");

        // Also ensure all current users have role 'buyer' or 'user' if they aren't admin/seller
        await connection.execute("UPDATE users SET role = 'buyer' WHERE role = 'user'");
        console.log("Updated 'user' role to 'buyer' for consistency.");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await connection.end();
    }
}

fix();
