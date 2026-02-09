const nodemailer = require('nodemailer');

async function checkTLS() {
    console.log("Testing with Port 587 (TLS/STARTTLS)...");
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 587,
        secure: false, // Must be false for 587
        auth: {
            user: 'no-reply@officialum1.com',
            pass: 'KPH-@w?.5ryU,hm'
        },
        tls: {
            rejectUnauthorized: false // Bypass cert issues for testing
        }
    });

    try {
        await transporter.verify();
        console.log("✅ SUCCESS with Port 587!");
    } catch (e) {
        console.error("❌ Port 587 Failed: " + e.message);
    }
}

checkTLS();
