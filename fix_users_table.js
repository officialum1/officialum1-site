const mysql = require('mysql2/promise');

async function fix() {
    const config = {
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit',
        ssl: { rejectUnauthorized: false }
    };

    const connection = await mysql.createConnection(config);
    try {
        console.log("Checking users table...");
        const [rows] = await connection.execute("DESCRIBE users");
        console.log("Users Table Structure:", rows);

        // If ID is int(11), we need to change it
        const idCol = rows.find(r => r.Field === 'id');
        if (idCol && idCol.Type.includes('int')) {
            console.log("Changing id column to VARCHAR(50)...");
            // We need to drop AUTO_INCREMENT first if it exists
            // But changing type to VARCHAR will remove it anyway or fail.
            // Let's be careful.
            await connection.execute("ALTER TABLE users MODIFY id VARCHAR(50)");
            console.log("Successfully changed id to VARCHAR(50)");
        } else {
            console.log("id column is already correct or not an INT.");
        }

        const [users] = await connection.execute("SELECT id, email FROM users LIMIT 5");
        console.log("Current Users:", users);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await connection.end();
    }
}

fix();
