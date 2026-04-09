async function checkStats() {
    try {
        const res = await fetch('https://officialum1.com/api/admin/g2g?action=get_stats', {
            method: 'GET'
        });
        console.log("Status:", res.status);
        const data = await res.json();
        console.log("JSON Output:", data);
        console.log("Type of data:", typeof data);
        console.log("Is array?", Array.isArray(data));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

checkStats();
