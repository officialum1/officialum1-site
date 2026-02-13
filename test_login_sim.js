const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLoginSim() {
    const connection = await mysql.createConnection({
        host: "82.197.82.131",
        user: "u815786501_officialum1sit",
        password: "78b?aY&DkF8RM@y",
        database: "u815786501_officialum1sit"
    });

    const email = 'umar.mumtaz37@yahoo.com';
    // We don't know the password, but let's check what's in the DB
    try {
        const [users] = await connection.query("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [email, email]);
        if (users.length > 0) {
            const user = users[0];
            console.log("User found:", { email: user.email, role: user.role, hasPassword: !!user.password });
            console.log("Is password a hash?", user.password.startsWith('$2'));
        } else {
            console.log("User NOT found");
        }

        const [settings] = await connection.query("SELECT * FROM settings WHERE setting_key = 'admin_password'");
        console.log("Master Password in DB:", settings.length > 0 ? "EXISTS" : "MISSING");

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

testLoginSim();
