const mysql = require('mysql2/promise');
async function f() {
    try {
        const conn = await mysql.createConnection({
            host: '82.197.82.131',
            user: 'u815786501_officialum1sit',
            password: '&.8&@:@c%QcVrFi',
            database: 'u815786501_officialum1sit'
        });
        const [rows] = await conn.query('SELECT email, password, role FROM users WHERE email="admin@officialum1.com"');
        console.log(rows);
        conn.end();
    } catch(e) { console.log(e); }
}
f();
