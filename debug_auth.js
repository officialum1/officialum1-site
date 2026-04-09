const { query } = require('./lib/db');

async function check() {
    try {
        const settings = await query("SELECT * FROM settings WHERE setting_key = 'admin_password'");
        console.log("Settings:", settings);

        const staff = await query("SELECT email, username, role FROM users WHERE role IN ('admin', 'seller') LIMIT 5");
        console.log("Staff/Admins in users table:", staff);
    } catch (e) {
        console.error(e);
    }
}

check();
