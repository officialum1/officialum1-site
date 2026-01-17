import nodemailer from 'nodemailer';

export async function sendAuditReport(to: string, subject: string, data: any, settings: any = {}) {
    // Check if credentials are set (Env or Settings)
    const host = settings.smtpHost || process.env.SMTP_HOST;
    const user = settings.smtpUser || process.env.SMTP_USER;
    const pass = settings.smtpPass || process.env.SMTP_PASS;
    const port = parseInt(settings.smtpPort || process.env.SMTP_PORT || '587');

    if (!host || !user) {
        console.log("Mock Email Sent to " + to + ":", subject);
        return true;
    }

    const transporter = nodemailer.createTransport({
        host, port, secure: port === 465, auth: { user, pass }
    });

    // Handle generic content
    const detailsHtml = Array.isArray(data.details)
        ? data.details.map((d: string) => `<li style="margin-bottom: 10px;">${d}</li>`).join('')
        : `<p>${data.details}</p>`;

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <h1 style="color: #4f46e5;">${data.da || 'Notification'}</h1>
            <p>${data.pa || subject}</p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${detailsHtml}
        </div>

        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
           <p style="color: #888; font-size: 12px;">OfficialUM1 Automated System</p>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: `"OfficialUM1" <${user}>`,
            to,
            subject: subject,
            html: html,
        });
        return true;
    } catch (error) {
        console.error("Email Sending Failed:", error);
        return false;
    }
}
