const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function seed() {
    console.log("🌱 Seeding Knowledge Base...");

    // Create connection manually since we are running a script outside Next.js context
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const articles = [
        {
            title: "How to Buy an Account?",
            slug: "how-to-buy",
            category: "Getting Started",
            content: `
                <h3>Step 1: Choose your Product</h3>
                <p>Browse our shop and select the account or service you need.</p>
                <h3>Step 2: Add to Cart</h3>
                <p>Click "Add to Cart" and proceed to checkout.</p>
                <h3>Step 3: Payment</h3>
                <p>We accept Crypto, Credit Cards, and seamless wallet payments. Once paid, your account details are delivered instantly to your email and dashboard.</p>
            `
        },
        {
            title: "Refund & Replacement Policy",
            slug: "refund-policy",
            category: "Policies",
            content: `
                <p>We offer a <strong>24-hour guarantee</strong> on all accounts.</p>
                <ul>
                    <li>If an account is invalid upon login, we replace it instantly.</li>
                    <li>Refunds are processed to your site wallet.</li>
                    <li>Please contact support with your order ID if you face any issues.</li>
                </ul>
            `
        },
        {
            title: "How does the Affiliate Program work?",
            slug: "affiliate-program",
            category: "Affiliates",
            content: `
                <p>Earn money by inviting friends!</p>
                <ol>
                    <li>Copy your unique link from the <a href="/dashboard">Dashboard</a>.</li>
                    <li>Share it on social media, Discord, or forums.</li>
                    <li>When someone signs up and buys, you earn <strong>5% commission</strong> forever.</li>
                </ol>
            `
        },
        {
            title: "Is my payment secure?",
            slug: "payment-security",
            category: "Safety",
            content: `
                <p>Yes. We use industry-standard encryption and do not store your credit card details. Crypto payments are processed via secure gateways.</p>
            `
        },
        {
            title: "Do you offer bulk discounts?",
            slug: "bulk-discounts",
            category: "Sales",
            content: `
                <p>Yes! For orders over $500, please open a support ticket or contact us via Telegram for special rates.</p>
            `
        }
    ];

    for (const art of articles) {
        try {
            await connection.execute(
                `INSERT INTO knowledge_base (title, slug, category, content, is_published) 
                 VALUES (?, ?, ?, ?, 1) 
                 ON DUPLICATE KEY UPDATE content = VALUES(content), title = VALUES(title)`,
                [art.title, art.slug, art.category, art.content]
            );
            console.log(`✅ Upserted: ${art.title}`);
        } catch (e) {
            console.error(`❌ Failed: ${art.title}`, e.message);
        }
    }

    console.log("✨ KB Seed Complete!");
    process.exit(0);
}

seed();
