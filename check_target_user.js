
const mysql = require('mysql2/promise');

async function checkUser() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit',
        ssl: { rejectUnauthorized: false }
    });

    try {
        const email = 'umar.mumtaz37@yahoo.com';
        console.log(`Checking user: ${email}`);

        const [users] = await connection.execute("SELECT id, email, password, role FROM users WHERE email = ?", [email]);
        console.log("User in 'users' table:", users);

        const [employees] = await connection.execute("SELECT id, email, password, position FROM employees WHERE email = ?", [email]);
        console.log("User in 'employees' table:", employees);

    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await connection.end();
    }
}

checkUser();
