const { query } = require('./lib/db');

async function test() {
    try {
        const settings = await query("SELECT * FROM settings WHERE setting_key LIKE 'g2g_%'");
        console.log("G2G Settings Found:", settings.length);
        settings.forEach(s => {
            console.log(`${s.setting_key}: ${s.setting_value ? s.setting_value.substring(0, 4) + '...' : 'NULL'}`);
        });
    } catch (e) {
        console.error("Error:", e);
    }
    process.exit();
}

test();
