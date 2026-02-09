const nodemailer = require('nodemailer');

async function checkNow() {
    console.log("Checking email status with your current credentials...");
    const transporter = nodemailer.createTransport({
        host: 'smtp.hostinger.com',
        port: 465,
        secure: true,
        auth: {
            user: 'no-reply@officialum1.com',
            pass: ')Nn+z6X=edr9deL'
        }
    });

    try {
        await transporter.verify();
        console.log("✅ YES! The email system is NOW FULLY WORKING.");

        console.log("Sending a final confirmation test email to your Gmail...");
        await transporter.sendMail({
            from: '"OfficialUM1" <no-reply@officialum1.com>',
            to: 'officialum1@gmail.com',
            subject: 'Email System Online 🚀',
            text: 'This confirms that your automated email system is now active and authenticated correctly.'
        });
        console.log("✅ Confirmation email sent!");
    } catch (e) {
        console.error("❌ STUCK: It is still showing: " + e.message);
        console.log("\nIf you have already finished the 'Get Started' screen in webmail, please check your Hostinger panel to see if 'External SMTP' is enabled.");
    }
}

checkNow();
