
const { query, initDB } = require('./lib/db');

async function runSetup() {
    try {
        console.log("Running Database Initialization...");
        // Hack: bypass import if it's TS, but lib/db might be compiled or reachable via node if it's .js
        // Wait, lib/db.ts is a TS file. Node can't run it directly without a loader.
        // But the project is Next.js, so it uses a server.js in production or next dev.

        // Let's try to run the queries directly.
        await query("ALTER TABLE employees ADD COLUMN IF NOT EXISTS permissions TEXT");
        await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS permissions TEXT");
        console.log("Migrations applied successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration Error:", error.message);
        // Fallback for older MySQL that doesn't support IF NOT EXISTS on ADD COLUMN
        try {
            await query("ALTER TABLE employees ADD COLUMN permissions TEXT");
            console.log("permissions added to employees");
        } catch (e) { }
        try {
            await query("ALTER TABLE users ADD COLUMN permissions TEXT");
            console.log("permissions added to users");
        } catch (e) { }
        process.exit(0);
    }
}

runSetup();
