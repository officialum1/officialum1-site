const { query } = require('./lib/db');

async function check() {
    try {
        const users = await query("SELECT * FROM users LIMIT 1");
        console.log("Users found:", users.length);
        if (users.length > 0) {
            console.log("Sample user:", users[0]);
        }
    } catch (e) {
        console.error("Database Error:", e.message);
    }
    process.exit();
}

check();
