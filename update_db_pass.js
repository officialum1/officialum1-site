const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    try {
        await pool.query("UPDATE settings SET setting_value = ? WHERE setting_key = 'smtpPass'", ['KPH-@w?.5ryU,hm']);
        console.log("✅ Database updated with new password");
    } catch (e) {
        console.error(e);
    }
    await pool.end();
}
run();
