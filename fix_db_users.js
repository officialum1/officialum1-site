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
    console.log("Connected to DB");

    const columnsToAdd = [
        "ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE",
        "ALTER TABLE users ADD COLUMN membership VARCHAR(50) DEFAULT 'none'",
        "ALTER TABLE users ADD COLUMN membership_expires TIMESTAMP NULL",
        "ALTER TABLE users ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0.00",
        "ALTER TABLE users ADD COLUMN points INT DEFAULT 0"
    ];

    for (const sql of columnsToAdd) {
        try {
            await connection.execute(sql);
            console.log(`Success: ${sql}`);
        } catch (e) {
            console.log(`Skipped (likely exists): ${sql}`);
        }
    }

    await connection.end();
    console.log("Done");
}

fix().catch(console.error);
