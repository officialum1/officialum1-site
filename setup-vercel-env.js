#!/usr/bin/env node

/**
 * Automatic Vercel Environment Variable Setup
 * Run this script to add all required environment variables to your Vercel project
 * 
 * Usage: node setup-vercel-env.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log('\n🚀 Vercel Environment Variable Setup\n');
    console.log('This script will add all required environment variables to your Vercel project.\n');

    // Check if Vercel CLI is installed
    try {
        execSync('vercel --version', { stdio: 'ignore' });
    } catch (error) {
        console.log('❌ Vercel CLI not found. Installing...\n');
        try {
            execSync('npm install -g vercel', { stdio: 'inherit' });
            console.log('\n✅ Vercel CLI installed successfully!\n');
        } catch (e) {
            console.error('Failed to install Vercel CLI. Please run: npm install -g vercel');
            process.exit(1);
        }
    }

    console.log('📝 Please provide the following information:\n');

    // Collect user inputs
    const ADMIN_PASSWORD = await question('1. Enter ADMIN_PASSWORD (create a strong password): ');
    const G2G_API_KEY = await question('2. Enter G2G_API_KEY (or press Enter to skip): ');
    const G2G_SECRET_KEY = await question('3. Enter G2G_SECRET_KEY (or press Enter to skip): ');
    const G2G_USER_ID = await question('4. Enter G2G_USER_ID (or press Enter to skip): ');
    const DOMAIN = await question('5. Enter your domain (e.g., officialum1.com): ');

    // Generate webhook secrets
    const crypto = require('crypto');
    const ORDER_WEBHOOK_SECRET = crypto.randomBytes(32).toString('hex');
    const OFFER_WEBHOOK_SECRET = crypto.randomBytes(32).toString('hex');

    rl.close();

    console.log('\n🔐 Generated webhook secrets automatically\n');
    console.log('📤 Adding environment variables to Vercel...\n');

    // Environment variables to add
    const envVars = [
        // Database
        { key: 'DB_HOST', value: '82.197.82.131' },
        { key: 'DB_USER', value: 'u815786501_officialum1sit' },
        { key: 'DB_PASSWORD', value: '78b?aY&DkF8RM@y' },
        { key: 'DB_NAME', value: 'u815786501_officialum1sit' },

        // Admin
        { key: 'ADMIN_PASSWORD', value: ADMIN_PASSWORD },

        // G2G
        { key: 'G2G_API_KEY', value: G2G_API_KEY || '' },
        { key: 'G2G_SECRET_KEY', value: G2G_SECRET_KEY || '' },
        { key: 'G2G_USER_ID', value: G2G_USER_ID || '' },
        { key: 'ORDER_WEBHOOK_SECRET', value: ORDER_WEBHOOK_SECRET },
        { key: 'OFFER_WEBHOOK_SECRET', value: OFFER_WEBHOOK_SECRET },

        // Application
        { key: 'NEXT_PUBLIC_BASE_URL', value: `https://${DOMAIN}` },
        { key: 'NODE_ENV', value: 'production' }
    ];

    // Add each environment variable
    let successCount = 0;
    let failCount = 0;

    for (const { key, value } of envVars) {
        if (!value) {
            console.log(`⏭️  Skipping ${key} (no value provided)`);
            continue;
        }

        try {
            // Add to production environment
            const command = `vercel env add ${key} production`;
            execSync(command, {
                input: value + '\n',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            console.log(`✅ Added: ${key}`);
            successCount++;
        } catch (error) {
            console.log(`❌ Failed to add: ${key}`);
            console.log(`   You can add it manually in Vercel dashboard`);
            failCount++;
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Successfully added: ${successCount} variables`);
    if (failCount > 0) {
        console.log(`⚠️  Failed to add: ${failCount} variables`);
    }

    console.log('\n📊 Summary of added variables:');
    console.log('==========================================');
    console.log('Database: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    console.log('Admin: ADMIN_PASSWORD');
    if (G2G_API_KEY) console.log('G2G: G2G_API_KEY, G2G_SECRET_KEY, G2G_USER_ID');
    console.log('Webhooks: ORDER_WEBHOOK_SECRET, OFFER_WEBHOOK_SECRET');
    console.log('App: NEXT_PUBLIC_BASE_URL, NODE_ENV');
    console.log('==========================================\n');

    console.log('🔑 IMPORTANT - Save these generated secrets:\n');
    console.log(`ORDER_WEBHOOK_SECRET = ${ORDER_WEBHOOK_SECRET}`);
    console.log(`OFFER_WEBHOOK_SECRET = ${OFFER_WEBHOOK_SECRET}\n`);
    console.log('📋 Copy these secrets to your G2G webhook configuration!\n');

    console.log('🚀 Next steps:');
    console.log('1. Run: vercel --prod (to redeploy with new env vars)');
    console.log('2. Wait 2-3 minutes for deployment');
    console.log('3. Test: https://' + DOMAIN + '/api/health');
    console.log('\n✨ Done! Your site is ready to go live!\n');
}

main().catch(err => {
    console.error('\n❌ Error:', err.message);
    process.exit(1);
});
