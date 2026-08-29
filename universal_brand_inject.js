const mysql = require('mysql2/promise');

async function f() {
    try {
        const conn = await mysql.createConnection({
            host: '82.197.82.131',
            user: 'u815786501_officialum1sit',
            password: '&.8&@:@c%QcVrFi',
            database: 'u815786501_officialum1sit'
        });

        console.log("🚀 STARTING UNIVERSAL BRAND TAG INJECTION...");
        const [rows] = await conn.query("SELECT id, slug, content FROM blogs");
        
        const brandTags = " #officialum1 #officialum1llc #officialum1smc";

        for (const post of rows) {
            // Only append if not already present
            if (post.content && !post.content.includes("#officialum1smc")) {
                let newContent = post.content;
                
                // If existing tag section, append there. Otherwise add new line.
                if (newContent.includes("**Tags:**")) {
                    newContent = newContent.replace("**Tags:**", "**Tags:**" + brandTags);
                } else {
                    newContent += "\n\n***\n**Tags:**" + brandTags;
                }

                await conn.execute("UPDATE blogs SET content = ? WHERE id = ?", [newContent, post.id]);
                console.log(`✅ Injected Brand Tags -> ${post.slug}`);
            } else {
                console.log(`ℹ️ Skipped (Already Exists) -> ${post.slug}`);
            }
        }

        console.log("🌟 UNIVERSAL BRAND LOCKDOWN COMPLETE!");
        conn.end();
    } catch(e) { console.log("ERROR:", e); }
}
f();
