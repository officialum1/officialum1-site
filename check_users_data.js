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
    const [rows] = await connection.execute("SELECT id, email, role FROM users LIMIT 10");
    console.log("Found Users:", rows.length);
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}

check().catch(console.error);
