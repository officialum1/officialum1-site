const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function sendApplication() {
    try {
        const envContent = fs.readFileSync('.env.local', 'utf8');
        const envVars = {};
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const idx = trimmed.indexOf('=');
                if (idx > -1) {
                    envVars[trimmed.substring(0, idx).trim()] = trimmed.substring(idx + 1).trim();
                }
            }
        });

        const conn = await mysql.createConnection({
            host: envVars.DB_HOST,
            user: envVars.DB_USER,
            password: envVars.DB_PASSWORD,
            database: envVars.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });

        const [rows] = await conn.execute("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('smtpHost', 'smtpUser', 'smtpPass')");
        const settings = {};
        rows.forEach(r => settings[r.setting_key] = r.setting_value);
        await conn.end();

        const smtpHost = settings.smtpHost || 'smtp.titan.email';
        const smtpUser = settings.smtpUser || 'hello@officialum1.com';
        const smtpPass = settings.smtpPass;

        console.log(`Configured SMTP: ${smtpUser} via ${smtpHost}`);

        if (!smtpPass) {
            console.error('Error: No SMTP password found in settings table.');
            return false;
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: 465,
            secure: true,
            auth: {
                user: smtpUser,
                pass: smtpPass
            }
        });

        // Verify connection
        await transporter.verify();
        console.log('SMTP Connection verified successfully!');

        const pdfPath = path.resolve('OfficialUM1_Companies_House_Credit_Account_FILLED.pdf');
        if (!fs.existsSync(pdfPath)) {
            throw new Error(`PDF file not found at: ${pdfPath}`);
        }

        const mailOptions = {
            from: `"OfficialUM1 LLC" <${smtpUser}>`,
            to: 'chdfinance@companieshouse.gov.uk',
            cc: smtpUser, // Keep a copy in OfficialUM1 inbox
            subject: 'Application for Companies House Credit Account - OfficialUM1 LLC',
            text: `Dear Companies House Finance Team,

Please find attached our completed and signed Application Form for a Companies House Credit Account on behalf of OfficialUM1 LLC, including our UK Direct Debit mandate.

Summary of Application:
- Entity Name: OfficialUM1 LLC (US Entity)
- Primary Contact: Muhammad Umar Mumtaz, Managing Director
- Email: hello@officialum1.com
- Invoicing Email: hello@officialum1.com
- Preferred Filing Mode: WebFiling & Software Filing
- Bank Mandate: Barclays Bank PLC (Sort Code: 23-14-86, Account: 03905664)

Kindly process our application and issue our Presenter ID and Presenter Authentication Code at your earliest convenience.

Best regards,

Muhammad Umar Mumtaz
Managing Director | OfficialUM1 LLC
https://officialum1.com`,
            attachments: [
                {
                    filename: 'OfficialUM1_Companies_House_Credit_Account_FILLED.pdf',
                    path: pdfPath
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Application email sent successfully!', info.messageId);
        return true;
    } catch (err) {
        console.error('Failed to send email:', err.message);
        return false;
    }
}

sendApplication();
