const mysql = require('mysql2/promise');

async function check() {
    const connection = await mysql.createConnection({
        host: "82.197.82.131",
        user: "u815786501_officialum1sit",
        password: "78b?aY&DkF8RM@y",
        database: "u815786501_officialum1sit"
    });

    try {
        const [settings] = await connection.query("SELECT * FROM settings WHERE setting_key = 'admin_password'");
        console.log("Settings admin_password:", settings);

        const [staff] = await connection.query("SELECT email, username, role FROM users WHERE role IN ('admin', 'seller') LIMIT 5");
        console.log("Staff/Admins in users table:", staff);
    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

check();
