import crypto from 'crypto';

const HMAC_KEY = process.env.SESSION_SECRET ?? "um1admin2024";

function makeAdminToken() {
  const payload = Buffer.from(JSON.stringify({ role: "admin", iat: Date.now(), exp: Date.now() + 43200000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", HMAC_KEY).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyAdminToken(token) {
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return false;
    const expectedSig = crypto.createHmac("sha256", HMAC_KEY).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.role !== "admin") return false;
    if (Date.now() > data.exp) return false;
    return true;
  } catch (e) { 
    console.error(e);
    return false; 
  }
}

const token = makeAdminToken();
console.log("Generated Token:", token);
console.log("Is Valid?", verifyAdminToken(token));

// Also simulate decoding to see if padding issues occur
const [payload, sig] = token.split(".");
console.log("Decoded Payload:", Buffer.from(payload, "base64url").toString());
