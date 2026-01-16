import nodemailer from 'nodemailer';

export async function sendAuditReport(to: string, url: string, data: any, settings: any = {}) {
    // Check if credentials are set (Env or Settings)
    const host = settings.smtpHost || process.env.SMTP_HOST;
    const user = settings.smtpUser || process.env.SMTP_USER;
    const pass = settings.smtpPass || process.env.SMTP_PASS;

    if (!host || !user) {
        console.log("Mock Email Sent to " + to + ":", data);
        return true; // Simulate success if no SMTP
    }

    const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: user,
            pass: pass,
        },
    });

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
            <h1 style="color: #4f46e5;">OfficialUM1 Backlink Report</h1>
            <p>Here is the requested authority analysis for <strong>${url}</strong></p>
        </div>
        
        <div style="display: flex; justify-content: space-around; margin: 30px 0; background-color: #f8fafc; padding: 20px; border-radius: 8px;">
            <div style="text-align: center;">
                <div style="font-size: 14px; color: #666;">Domain Authority</div>
                <div style="font-size: 32px; font-weight: bold; color: #00bfa5;">${data.da}</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 14px; color: #666;">Page Authority</div>
                <div style="font-size: 32px; font-weight: bold; color: #0ea5e9;">${data.pa}</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 14px; color: #666;">Backlinks</div>
                <div style="font-size: 32px; font-weight: bold; color: #6366f1;">${data.links}</div>
            </div>
        </div>

        <div style="background-color: #fff; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
            <h3 style="margin-top: 0;">Analysis Details:</h3>
            <ul style="padding-left: 20px;">
                ${data.details.map((d: string) => `<li style="margin-bottom: 10px;">${d}</li>`).join('')}
            </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="margin-bottom: 20px;">Want to increase these numbers? We specialize in high-DA guest posting.</p>
            <a href="https://officialum1.com/contact" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Book a Strategy Call</a>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: '"OfficialUM1 Tools" <tools@officialum1.com>',
            to,
            subject: `Your Backlink Intelligence Report: ${url}`,
            html: html,
        });
        return true;
    } catch (error) {
        console.error("Email Sending Failed:", error);
        return false;
    }
}
