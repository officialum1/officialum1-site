const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await conn.execute("DESCRIBE coupons");
    console.log("COUPONS TABLE:", rows);

    try {
        const [blogRows] = await conn.execute("DESCRIBE blogs");
        console.log("BLOGS TABLE:", blogRows);
    } catch (e) { console.log("No blogs table"); }

    conn.end();
}

checkSchema();
