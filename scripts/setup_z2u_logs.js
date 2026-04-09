const { query } = require('../lib/db');

async function setup() {
    console.log("Setting up Z2U Bump Logs table...");
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS z2u_bump_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                message TEXT,
                type VARCHAR(50) DEFAULT 'info',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Table z2u_bump_logs created or already exists.");
    } catch (e) {
        console.error("Error setting up table:", e);
    }
    process.exit(0);
}

setup();
