const mysql = require('mysql2/promise');

async function checkTables() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit',
        ssl: { rejectUnauthorized: false }
    });

    try {
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('--- TABLES IN DATABASE ---');
        rows.forEach(row => {
            console.log(Object.values(row)[0]);
        });
        console.log('--- END ---');
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkTables();
