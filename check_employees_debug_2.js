const mysql = require('mysql2/promise');

async function checkEmployees() {
    const connection = await mysql.createConnection({
        host: "82.197.82.131",
        user: "u815786501_officialum1sit",
        password: "78b?aY&DkF8RM@y",
        database: "u815786501_officialum1sit"
    });

    try {
        const [employees] = await connection.query("SELECT email, username, password FROM employees");
        console.log("Employees Table:", employees.map(e => ({
            email: e.email,
            username: e.username,
            isHash: (e.password || '').startsWith('$2')
        })));

    } catch (e) {
        console.error(e);
    } finally {
        await connection.end();
    }
}

checkEmployees();
