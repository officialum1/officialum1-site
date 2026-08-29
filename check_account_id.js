const { getAccount } = require('./lib/corptools');

async function checkAccount() {
    try {
        console.log("Fetching account details...");
        const account = await getAccount();
        console.log("Response:", JSON.stringify(account, null, 2));

        if (account.result && account.result.id) {
            console.log("\n--- FOUND ACCOUNT ID ---");
            console.log("ID:", account.result.id);
            console.log("-------------------------\n");
        } else {
            console.log("Wholesaler ID not found in response.");
        }
    } catch (e) {
        console.error("Error fetching account:", e.message);
    }
}

checkAccount();
