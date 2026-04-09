const mysql = require('mysql2/promise');
const fs = require('fs');

async function migrate() {
    // Parse .env.local manually
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const env = {};
    envFile.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) env[key.trim()] = val.trim();
    });

    const connection = await mysql.createConnection({
        host: env.DB_HOST,
        user: env.DB_USER,
        password: env.DB_PASSWORD,
        database: env.DB_NAME
    });

    try {
        console.log("Checking orders table...");
        await connection.query(`
            ALTER TABLE orders 
            ADD COLUMN delivery_details TEXT NULL,
            ADD COLUMN fulfilled_by VARCHAR(255) NULL
        `);
        console.log("Added delivery_details column.");
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log("Columns already exist.");
        } else {
            console.error(e);
        }
    }
    process.exit();
}

migrate();
