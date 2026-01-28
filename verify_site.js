// Native fetch used
// Actually, standard fetch is available in Node 18+. I will assume Node 18+.

async function checkUrl(url, label) {
    try {
        const res = await fetch(url);
        console.log(`[${res.status}] ${label}: ${url} `);
        return res.status;
    } catch (e) {
        console.error(`[FAIL] ${label}: ${e.message}`);
        return 0;
    }
}

async function runTests() {
    console.log("🚀 Starting Site Verification...");

    // 0. Initialize DB
    await checkUrl('http://localhost:3000/api/setup', 'DB Setup');

    // 1. Public Pages
    await checkUrl('http://localhost:3000', 'Home Page');
    await checkUrl('http://localhost:3000/shop', 'Shop Page');
    await checkUrl('http://localhost:3000/help', 'Help Center');

    // 2. Auth Required Redirects (Should be 200 or 401/307)
    await checkUrl('http://localhost:3000/dashboard', 'User Dashboard');

    // 3. Admin Pages
    await checkUrl('http://localhost:3000/admin/login', 'Admin Login');
    // Note: We can't easily test logged-in state purely via simple fetch without handling cookies, 
    // but getting a response from login page proves the route exists.

    // 4. API Endpoints
    await checkUrl('http://localhost:3000/api/kb', 'Knowledge Base API');
    await checkUrl('http://localhost:3000/api/products', 'Products API');
    await checkUrl('http://localhost:3000/sitemap.xml', 'Dynamic Sitemap');

    console.log("✅ Basic Routing Check Complete.");
}

runTests();
