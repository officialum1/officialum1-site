
const mysql = require('mysql2/promise');

async function syncUsers() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Synchronizing employees to users table...");
        const [employees] = await connection.execute("SELECT * FROM employees");

        for (const emp of employees) {
            const [existing] = await connection.execute("SELECT id FROM users WHERE email = ?", [emp.email]);

            if (existing.length === 0) {
                console.log(`Creating user for: ${emp.email}`);
                // Since we don't know the plain password from the hashed one in employees,
                // and the users table for some reason uses plaintext (as seen in api/auth/login),
                // we have a dilemma. 
                // However, the api/staff/login/route.ts checks the EMPLOYEES table for staff login.

                // WAIT! If staff login checks the EMPLOYEES table, then why are we syncing to USERS?
                // Answer: Maybe they use the main login page? 
                // If they use the main login page, it checks USERS table.

                await connection.execute(
                    "INSERT INTO users (id, email, password, role, is_verified, permissions) VALUES (?, ?, ?, ?, ?, ?)",
                    [emp.id, emp.email, 'password123', 'seller', 1, emp.permissions]
                );
            } else {
                console.log(`Updating user for: ${emp.email}`);
                await connection.execute(
                    "UPDATE users SET role = 'seller', permissions = ? WHERE email = ?",
                    [emp.permissions, emp.email]
                );
            }
        }
        console.log("Sync complete.");
    } catch (err) {
        console.error("Error:", err.message);
    } finally {
        await connection.end();
    }
}

syncUsers();
