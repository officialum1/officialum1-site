import crypto from 'crypto';
const HMAC_KEY = "um1admin2024";
const payload = Buffer.from(JSON.stringify({ role: "admin", exp: Date.now() + 86400000 })).toString("base64url");
const sig = crypto.createHmac("sha256", HMAC_KEY).update(payload).digest("base64url");
const token = `${payload}.${sig}`;

fetch('http://localhost:5000/api/admin/db/test', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log("Response:", JSON.stringify(data, null, 2));
})
.catch(err => {
  console.error("Error:", err);
});
