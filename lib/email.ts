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

// Wrapper for existing calls (Backward Compatibility)
export async function sendAuditReport(to: string, subject: string, data: any, settings: any) {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4;">
            <div style="background: white; padding: 20px; border-radius: 8px;">
                <h2 style="color: #333;">${subject}</h2>
                <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;" />
                
                <h3 style="color: #0070f3;">${data.da || 'Notification'}</h3>
                <p><strong>Ref:</strong> ${data.pa || 'N/A'}</p>
                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #0070f3; margin: 20px 0;">
                    ${(data.details || '').replace(/\n/g, '<br/>')}
                </div>
                
                <p style="font-size: 12px; color: #888; margin-top: 30px;">
                    Sent by OfficialUM1 Automated System
                </p>
            </div>
        </div>
    `;

    return await sendEmail({ to, subject, html });
}
