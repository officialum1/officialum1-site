const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function main() {
  try {
    const connection = await mysql.createConnection({
      host: '82.197.82.131',
      user: 'u815786501_officialum1sit',
      password: '&.8&@:@c%QcVrFi',
      database: 'u815786501_officialum1sit'
    });

    const [users] = await connection.query("SELECT email, password, role FROM users WHERE role = 'admin' OR role = 'seller'");
    console.log("Admin Users Data:");
    console.log(users);
    
    // Check if 'speed5753' matches the admin user's password
    const adminUser = users.find(u => u.email === 'admin@officialum1.com');
    if (adminUser) {
      if (adminUser.password === 'speed5753') {
        console.log("Password for admin matches 'speed5753' as plain text.");
      } else {
        const isMatch = await bcrypt.compare('speed5753', adminUser.password).catch(() => false);
        if (isMatch) {
          console.log("Password for admin matches 'speed5753' as bcrypt hash.");
        } else {
          console.log("Password for admin DOES NOT match 'speed5753'.");
          // Let's reset it to speed5753 as plain text to allow fallback, or bcrypt hash.
          const newHash = await bcrypt.hash('speed5753', 10);
          await connection.query("UPDATE users SET password = ? WHERE email = ?", [newHash, 'admin@officialum1.com']);
          console.log("Successfully updated admin password to 'speed5753'");
        }
      }
    }

    await connection.end();
  } catch (err) {
    console.error("Database Query Error:", err);
  }
}

main();
