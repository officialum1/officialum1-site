const mysql = require('mysql2/promise');

async function f() {
    try {
        const conn = await mysql.createConnection({
            host: '82.197.82.131',
            user: 'u815786501_officialum1sit',
            password: '&.8&@:@c%QcVrFi',
            database: 'u815786501_officialum1sit'
        });

        console.log("🔄 FETCHING RECENT BLOG POSTS...");
        const [rows] = await conn.query("SELECT id, slug, content FROM blogs WHERE author = 'OfficialUM1 Editorial' OR id >= 15");
        
        for (const post of rows) {
            let tags = "";
            if (post.slug.includes('sahiwal')) {
                tags = "\n\n***\n**Tags:** #DigitalMarketingSahiwal #SEOServicesSahiwal #WebDesignSahiwal #OfficialUM1 #SahiwalBusiness";
            } else if (post.slug.includes('guest') || post.slug.includes('link')) {
                tags = "\n\n***\n**Tags:** #GuestPostingServices #BuyGuestPosts #LinkBuilding #DomainAuthority #BacklinkStrategy";
            } else if (post.slug.includes('karachi')) {
                tags = "\n\n***\n**Tags:** #SEOKarachi #DigitalMarketingPakistan #BusinessGrowthKarachi #LocalSEO";
            } else {
                tags = "\n\n***\n**Tags:** #WebDevelopmentPakistan #AffordableWebDev #DigitalAgencyPakistan #ConversionDesign";
            }

            // Append tags if not already present
            if (!post.content.includes("**Tags:**")) {
                const newContent = post.content + tags;
                await conn.execute("UPDATE blogs SET content = ? WHERE id = ?", [newContent, post.id]);
                console.log(`✅ Appended tags to slug: ${post.slug}`);
            } else {
                console.log(`ℹ️ Tags already present for: ${post.slug}`);
            }
        }

        console.log("🌟 TAG INJECTIONS COMPLETE!");
        conn.end();
    } catch(e) { console.log("ERROR:", e); }
}
f();
