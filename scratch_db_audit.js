const mysql = require('mysql2/promise');
require('dotenv').config();

async function auditDatabase() {
  console.log('--- DB AUDIT START ---');
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ DB Connection: SUCCESS');

    const tables = [
      'users',
      'products',
      'categories',
      'orders',
      'inventory',
      'blogs',
      'testimonials',
      'promocodes',
      'tickets',
      'settings'
    ];

    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ Table '${table}': ${rows[0].count} records`);
      } catch (err) {
        console.log(`⚠️ Table '${table}': NOT FOUND or ERROR (${err.message})`);
      }
    }

    await connection.end();
  } catch (err) {
    console.error('❌ DB Connection FAILED:', err.message);
  }
  console.log('--- DB AUDIT END ---');
}

auditDatabase();
