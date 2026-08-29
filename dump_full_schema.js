const mysql = require('mysql2/promise');

async function dumpSchema() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit',
        ssl: { rejectUnauthorized: false }
    });

    try {
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('# Database Schema Overview\n');

        for (const tableRow of tables) {
            const tableName = Object.values(tableRow)[0];
            console.log(`## Table: ${tableName}`);

            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            console.log('| Field | Type | Null | Key | Default | Extra |');
            console.log('|-------|------|------|-----|---------|-------|');
            columns.forEach(col => {
                console.log(`| ${col.Field} | ${col.Type} | ${col.Null} | ${col.Key} | ${col.Default || 'NULL'} | ${col.Extra} |`);
            });
            console.log('\n');
        }
    } catch (e) {
        console.error('Error dumping schema:', e.message);
    } finally {
        await connection.end();
    }
}

dumpSchema();
