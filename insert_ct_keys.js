const mysql = require('mysql2/promise');

async function insertKeys() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit'
    });

    const keys = {
        'corptools_access_key': '37872498dfab6c4efc644c6b048cfa4de2184a029cbba169e422daa9b8b741b663838abadcdd16b3',
        'corptools_secret_key': 'e449819475ada558e5e69b59ec935c7be2030af85a3b1e6445ceda6797b877d037964d0b5d7e2dba',
        'corptools_account_id': '3f982fee-8528-4f89-8929-a4cfc9c9aa4c'
    };

    try {
        for (const [key, value] of Object.entries(keys)) {
            await connection.execute(`
                INSERT INTO settings (setting_key, setting_value) 
                VALUES (?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
            `, [key, value]);
            console.log(`Updated ${key}`);
        }
        console.log('--- DONE ---');
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

insertKeys();
