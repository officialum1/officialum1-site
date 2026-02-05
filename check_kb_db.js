require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const [rows] = await connection.execute("SELECT * FROM knowledge_base ORDER BY created_at DESC");
        console.log(`TOTAL ARTICLES: ${rows.length}`);
        if (rows.length > 0) {
            console.log("COLUMNS FOUND:", Object.keys(rows[0]).join(', '));
        }
        rows.forEach(r => {
            console.log(`- [${r.id}] ${r.title} | Slug: ${r.slug} | Cat: ${r.category} | Pub: ${r.is_published}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

check();
