import mysql from 'mysql2/promise';

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '82.197.82.131',
      user: 'u815786501_officialum1sit',
      password: '78b?aY&DkF8RM@y',
      database: 'u815786501_officialum1sit',
    });

    const [rows] = await connection.execute('SELECT email, password, role FROM users WHERE role = "admin" OR role = "superadmin"');
    console.log("Admin Users Found:");
    console.log(JSON.stringify(rows, null, 2));

    await connection.end();
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
