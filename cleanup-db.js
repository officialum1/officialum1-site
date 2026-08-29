const mysql = require('mysql2/promise');
async function runFinalPolish() {
    try {
        const conn = await mysql.createConnection({
            host: '82.197.82.131',
            user: 'u815786501_officialum1sit',
            password: '&.8&@:@c%QcVrFi',
            database: 'u815786501_officialum1sit'
        });
        
        console.log("Applying final Title Cleanup...");

        // Wipes out any entries captured erroneously as a Date or empty junk
        const [result] = await conn.query(`
            DELETE FROM playerup_listings 
            WHERE title REGEXP '^[0-9/]+$' 
               OR title REGEXP '^.{0,3}$'
        `);
        
        console.log(`✅ CLEANED: Deleted ${result.affectedRows} date-only strings from database.`);
        
        await conn.end();
    } catch (e) {
        console.error("Final Polish Error:", e);
    }
}
runFinalPolish();
