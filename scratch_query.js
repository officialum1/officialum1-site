const mysql = require('mysql2/promise');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '82.197.82.131',
      user: 'u815786501_officialum1sit',
      password: '&.8&@:@c%QcVrFi',
      database: 'u815786501_officialum1sit'
    });
    
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const tableName = tableNames.find(t => t.toLowerCase().includes('product'));
    if (tableName) {
      const [products] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 5`);
      console.log(JSON.stringify(products, null, 2));
    } else {
      console.log("No table with 'product' in its name found.");
    }
    
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}

main();
