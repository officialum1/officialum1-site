const mysql = require('mysql2/promise');

async function checkSettings() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit'
    });

    try {
        const [rows] = await connection.execute('SELECT * FROM settings');
        console.log('--- DATABASE SETTINGS ---');
        rows.forEach(row => {
            console.log(`${row.setting_key}: ${row.setting_value ? (row.setting_value.length > 5 ? row.setting_value.substring(0, 5) + '...' : row.setting_value) : 'EMPTY'}`);
        });
        console.log('--- END ---');
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkSettings();
