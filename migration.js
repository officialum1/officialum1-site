const mysql = require('mysql2/promise');
async function migrate() {
    try {
        const conn = await mysql.createConnection({
            host: '82.197.82.131',
            user: 'u815786501_officialum1sit',
            password: '&.8&@:@c%QcVrFi',
            database: 'u815786501_officialum1sit'
        });
        
        console.log("Connecting and performing migrations...");
        
        // 1. Add specific columns requested by the prompt (handling IF NOT EXISTS manually using error catch for safety if older mysql)
        const queries = [
            "ALTER TABLE playerup_listings ADD COLUMN last_bump_time TIMESTAMP NULL",
            "ALTER TABLE playerup_listings ADD COLUMN bump_interval_minutes INT DEFAULT 240",
            "ALTER TABLE playerup_listings ADD COLUMN last_bump_status VARCHAR(100)",
            "ALTER TABLE playerup_listings ADD COLUMN bump_failures_count INT DEFAULT 0",
            "ALTER TABLE playerup_listings ADD COLUMN last_bump_attempt TIMESTAMP NULL",
            "CREATE INDEX idx_auto_bump ON playerup_listings(autoBump, last_bump_time)"
        ];

        for (const q of queries) {
            try {
                await conn.query(q);
                console.log(`SUCCESS: ${q}`);
            } catch(e) {
                console.log(`SKIPPED/ERROR (Might already exist): ${q} - ${e.message}`);
            }
        }
        
        conn.end();
        console.log("Migration complete.");
    } catch(e) { console.log("CONNECTION ERROR", e); }
}
migrate();
