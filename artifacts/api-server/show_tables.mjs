import mysql from 'mysql2/promise';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '82.197.82.131',
      user: 'u815786501_officialum1sit',
      password: '78b?aY&DkF8RM@y',
      database: 'u815786501_officialum1sit',
    });

    console.log("Successfully connected to MySQL!");
    const [rows] = await connection.execute('SHOW TABLES;');
    console.log("Tables in database:", rows);

    await connection.end();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

main();
