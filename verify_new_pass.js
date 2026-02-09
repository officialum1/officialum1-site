const nodemailer = require('nodemailer');

async function checkNow() {
    console.log("Testing with the NEW RESET password...");
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply@officialum1.com',
            pass: 'KPH-@w?.5ryU,hm'
        }
    });

    try {
        await transporter.verify();
        console.log("✅ SUCCESS! The email server accepted the new password.");

        console.log("Sending a success notification email...");
        await transporter.sendMail({
            from: '"OfficialUM1" <no-reply@officialum1.com>',
            to: 'officialum1@gmail.com',
            subject: 'Email Fixed 🚀',
            text: 'This confirms your SMTP is now fully authenticated with the new password.'
        });
        console.log("✅ Confirmation email sent!");
    } catch (e) {
        console.error("❌ STILL FAILING: " + e.message);
    }
}

checkNow();
