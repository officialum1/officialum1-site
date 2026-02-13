async function checkApi() {
    try {
        const res = await fetch('https://officialum1.com/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test', password: 'test' })
        });
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Body Snippet:", text.substring(0, 500));
        try {
            console.log("JSON Output:", JSON.parse(text));
        } catch (e) {
            console.log("Response is not JSON");
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

checkApi();
