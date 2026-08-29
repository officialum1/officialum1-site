import { query } from './lib/db';

async function seedLeads() {
    const leads = [
        { id: 'lead_1', clientName: 'Thruster Finance', platform: 'Blast/Discord', budget: 1500, status: 'New', notes: 'DEX on Blast. Needs community scaling and professional moderation.' },
        { id: 'lead_2', clientName: 'The HoneyJar', platform: 'BeraChain', budget: 2000, status: 'New', notes: 'Berachain visual-heavy site. Needs Next.js speed optimization.' },
        { id: 'lead_3', clientName: 'Monad Nomad', platform: 'Monad', budget: 5000, status: 'New', notes: 'Upcoming dApp. Current site is a basic MVP; needs pro Next.js build.' },
        { id: 'lead_4', clientName: 'True Classic', platform: 'E-commerce', budget: 3000, status: 'New', notes: 'Shopify mobile speed optimization opportunity.' },
        { id: 'lead_5', clientName: 'Onyx Coffee Lab', platform: 'E-commerce', budget: 1200, status: 'New', notes: 'SEO strategy for specialty coffee keywords and media tuning.' },
        { id: 'lead_6', clientName: 'Perplexity AI', platform: 'SaaS', budget: 10000, status: 'New', notes: 'Backlink strategy and niche-specific authority building.' },
        { id: 'lead_7', clientName: 'Resend', platform: 'DevTools', budget: 2500, status: 'New', notes: 'Community development on Discord and technical SEO for blog.' },
        { id: 'lead_8', clientName: 'Tensor.trade', platform: 'Solana/NFT', budget: 4000, status: 'New', notes: 'Pro-trading UI performance optimization for high-traffic mints.' },
        { id: 'lead_9', clientName: 'Holdstation', platform: 'Crypto Wallet', budget: 1800, status: 'New', notes: 'Telegram growth integration and community building.' },
        { id: 'lead_10', clientName: 'Aether Apparel', platform: 'E-commerce', budget: 2200, status: 'New', notes: 'Technical SEO and aggressive backlink strategy against giants.' }
    ];

    console.log("Seeding leads...");
    for (const lead of leads) {
        try {
            await query(
                "INSERT IGNORE INTO leads (id, clientName, platform, budget, status, notes) VALUES (?, ?, ?, ?, ?, ?)",
                [lead.id, lead.clientName, lead.platform, lead.budget, lead.status, lead.notes]
            );
            console.log(`Inserted: ${lead.clientName}`);
        } catch (e) {
            console.error(`Failed: ${lead.clientName}`, e.message);
        }
    }
    console.log("Done!");
    process.exit(0);
}

seedLeads();
