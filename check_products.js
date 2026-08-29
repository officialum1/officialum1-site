const { query } = require('./lib/db');

async function check() {
    try {
        const products = await query('SELECT name, platform, image FROM products LIMIT 50');
        console.log(JSON.stringify(products, null, 2));
    } catch (e) {
        console.error(e);
    }
}

check();
