
import { query } from './lib/db';

async function checkSchema() {
    try {
        console.log("Checking employees table schema...");
        const columns: any = await query("SHOW COLUMNS FROM employees");
        console.log("Columns in employees:", columns.map((c: any) => c.Field));

        console.log("\nChecking users table schema...");
        const userColumns: any = await query("SHOW COLUMNS FROM users");
        console.log("Columns in users:", userColumns.map((c: any) => c.Field));

        process.exit(0);
    } catch (error) {
        console.error("Error checking schema:", error);
        process.exit(1);
    }
}

checkSchema();
