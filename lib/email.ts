import nodemailer from 'nodemailer';
import { query } from '@/lib/db';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
    try {
        // 1. Fetch SMTP settings from DB
        const rows = await query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('smtpHost', 'smtpUser', 'smtpPass')") as any[];
        const settings: any = {};
        rows.forEach((r: any) => settings[r.setting_key] = r.setting_value);

        if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPass) {
            console.error('SMTP Settings Missing');
            return false;
        }

        // 2. Configure Transporter
        const transporter = nodemailer.createTransport({
            host: settings.smtpHost,
            port: 465, // Default SSL port
            secure: true,
            auth: {
                user: settings.smtpUser,
                pass: settings.smtpPass
            }
        });

        // 3. Send Email
        await transporter.sendMail({
            from: `"OfficialUM1 Support" <${settings.smtpUser}>`,
            to,
            subject,
            text,
            html
        });

        console.log(`Email sent to ${to}`);
        return true;

    } catch (e: any) {
        console.error('Email Send Error:', e.message);
        return false;
    }
}
