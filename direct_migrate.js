
const mysql = require('mysql2/promise');

async function migrate() {
    const connection = await mysql.createConnection({
        host: '82.197.82.131',
        user: 'u815786501_officialum1sit',
        password: '78b?aY&DkF8RM@y',
        database: 'u815786501_officialum1sit',
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("Checking for 'permissions' column in 'employees'...");
        const [columns] = await connection.execute("SHOW COLUMNS FROM employees LIKE 'permissions'");
        if (columns.length === 0) {
            console.log("Adding 'permissions' column to 'employees'...");
            await connection.execute("ALTER TABLE employees ADD COLUMN permissions TEXT");
            console.log("Success.");
        } else {
            console.log("Column already exists.");
        }

        console.log("Checking for 'permissions' column in 'users'...");
        const [userColumns] = await connection.execute("SHOW COLUMNS FROM users LIKE 'permissions'");
        if (userColumns.length === 0) {
            console.log("Adding 'permissions' column to 'users'...");
            await connection.execute("ALTER TABLE users ADD COLUMN permissions TEXT");
            console.log("Success.");
        } else {
            console.log("Column already exists.");
        }

    } catch (err) {
        console.error("Migration Error:", err.message);
    } finally {
        await connection.end();
    }
}

migrate();
