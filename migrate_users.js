const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit'
    });

    try {
        console.log("Checking users table...");
        const [columns] = await connection.execute("SHOW COLUMNS FROM users");
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('membership')) {
            console.log("Adding membership column...");
            await connection.execute("ALTER TABLE users ADD COLUMN membership VARCHAR(50) DEFAULT 'none'");
        }

        if (!columnNames.includes('membership_expires')) {
            console.log("Adding membership_expires column...");
            await connection.execute("ALTER TABLE users ADD COLUMN membership_expires DATETIME NULL");
        }

        if (!columnNames.includes('total_spent')) {
            console.log("Adding total_spent column...");
            await connection.execute("ALTER TABLE users ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0");
        }

        if (!columnNames.includes('points')) {
            console.log("Adding points column...");
            await connection.execute("ALTER TABLE users ADD COLUMN points INT DEFAULT 0");
        }

        console.log("Migration complete!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await connection.end();
    }
}

migrate();
