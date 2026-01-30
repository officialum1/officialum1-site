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

export async function sendAuditReport(to: string, subject: string, data: any, settings: any) {
    const html = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d1117; color: #ffffff; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 24px; overflow: hidden; border: 1px solid #30363d; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
                <!-- Banner -->
                <div style="background: linear-gradient(135deg, #00ff88 0%, #00c3ff 100%); height: 6px;"></div>
                
                <!-- Header -->
                <div style="padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">OFFICIAL<span style="color: #00ff88;">UM1</span></h1>
                    <div style="display: inline-block; margin-top: 10px; padding: 4px 12px; background: rgba(0,255,136,0.1); border-radius: 20px; border: 1px solid rgba(0,255,136,0.2);">
                        <span style="color: #00ff88; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Secure Delivery</span>
                    </div>
                </div>
                
                <!-- Content -->
                <div style="padding: 0 40px 40px;">
                    <div style="text-align: center; margin-bottom: 35px;">
                        <h2 style="margin: 0; font-size: 22px; color: #ffffff;">Your Purchase is Ready!</h2>
                        <p style="margin: 10px 0 0; color: #8b949e; line-height: 1.5;">Thank you for your order. Your digital assets have been processed and are ready for immediate use.</p>
                    </div>

                    <div style="background: #0d1117; padding: 25px; border-radius: 16px; border: 1px solid #30363d; margin-bottom: 30px;">
                        <p style="margin: 0; color: #8b949e; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Item Delivered</p>
                        <p style="margin: 8px 0 0; color: #ffffff; font-size: 18px; font-weight: 700;">${data.pa || 'Digital Item'}</p>
                    </div>

                    <div style="margin-bottom: 30px;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                            <span style="color: #00ff88; font-size: 18px;">🔑</span>
                            <span style="color: #ffffff; font-size: 14px; font-weight: 600;">ACCESS CREDENTIALS</span>
                        </div>
                        <div style="background: #1c2128; padding: 30px; border-radius: 16px; border: 1px solid #30363d; color: #00ff88; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 16px; line-height: 1.6; word-break: break-all; position: relative;">
                            ${(data.details || '').replace(/\n/g, '<br/>')}
                        </div>
                    </div>

                    <div style="background: rgba(255,160,0,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,160,0,0.2); margin-bottom: 35px;">
                        <p style="margin: 0; color: #ffa000; font-size: 13px; line-height: 1.5;">
                            <strong>Pro Tip:</strong> For maximum security, we recommend changing the password and linking your own recovery methods immediately after the first login.
                        </p>
                    </div>

                    <div style="text-align: center;">
                        <a href="https://officialum1.com/support" style="display: inline-block; padding: 16px 40px; background: #00ff88; color: #0d1117; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 15px; box-shadow: 0 10px 20px rgba(0,255,136,0.2); transition: all 0.2s;">View Full Order Details</a>
                        <p style="margin-top: 25px; color: #484f58; font-size: 13px;">Need help? Reply to this email or chat with us on Telegram.</p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="padding: 30px 40px; text-align: center; background: #0d1117; border-top: 1px solid #30363d;">
                    <div style="margin-bottom: 20px;">
                        <a href="#" style="color: #8b949e; text-decoration: none; margin: 0 10px; font-size: 12px;">Privacy</a>
                        <a href="#" style="color: #8b949e; text-decoration: none; margin: 0 10px; font-size: 12px;">Terms</a>
                        <a href="#" style="color: #8b949e; text-decoration: none; margin: 0 10px; font-size: 12px;">About</a>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #484f58; line-height: 1.5;">
                        &copy; 2026 OfficialUM1 Marketplace. All rights reserved.<br/>
                        This is an automated delivery email. Please do not share your credentials with anyone.
                    </p>
                </div>
            </div>
        </div>
    `;

    return await sendEmail({ to, subject, html });
}

export async function sendRestockEmail(to: string, product: any, productUrl: string, settings: any) {
    const html = `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0d1117; color: #ffffff; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 24px; overflow: hidden; border: 1px solid #30363d; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
                <div style="background: linear-gradient(135deg, #00ff88 0%, #00c3ff 100%); height: 6px;"></div>
                
                <div style="padding: 40px 30px; text-align: center;">
                    <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
                    <h1 style="margin: 0; font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Back in Stock!</h1>
                    <p style="margin: 15px 0 0; color: #8b949e; font-size: 16px; line-height: 1.5;">
                        Good news! The item you were waiting for is now available.
                    </p>
                </div>
                
                <div style="padding: 0 40px 40px;">
                    <div style="background: #0d1117; padding: 25px; border-radius: 16px; border: 1px solid #30363d; margin-bottom: 35px; text-align: center;">
                        <img src="${product.image ? product.image : 'https://officialum1.com/logo.jpg'}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 50%; border: 2px solid #30363d; background: #1c2128; padding: 5px; margin-bottom: 15px;">
                        <h2 style="margin: 0; color: #ffffff; font-size: 20px;">${product.name}</h2>
                        <div style="margin-top: 5px; color: #00ff88; font-weight: bold;">$${product.price}</div>
                    </div>

                    <div style="text-align: center;">
                        <a href="${productUrl}" style="display: inline-block; padding: 18px 50px; background: #00c3ff; color: #000000; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 30px rgba(0,195,255,0.3); transition: all 0.2s;">
                            Buy Now
                        </a>
                        <p style="margin-top: 20px; color: #484f58; font-size: 13px;">Hurry! Stock is limited and sells out fast.</p>
                    </div>
                </div>

                <div style="padding: 30px 40px; text-align: center; background: #0d1117; border-top: 1px solid #30363d;">
                    <p style="margin: 0; font-size: 12px; color: #484f58; line-height: 1.5;">
                        &copy; 2026 OfficialUM1 Marketplace. Stop receiving these emails? <a href="#" style="color: #8b949e;">Unsubscribe</a>.
                    </p>
                </div>
            </div>
        </div>
    `;

    return await sendEmail({ to, subject: `Back in Stock: ${product.name} is available now! 🚀`, html });
}

export async function sendDepositEmail(to: string, amount: number, method: string) {
    const html = `
        <div style="font-family: 'Inter', sans-serif; background-color: #0d1117; color: #ffffff; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 20px; overflow: hidden; border: 1px solid #30363d;">
                <div style="background: #00ff88; height: 5px;"></div>
                <div style="padding: 40px; text-align: center;">
                    <div style="font-size: 50px; margin-bottom: 20px;">💸</div>
                    <h1 style="margin: 0; color: #fff;">Deposit Successful!</h1>
                    <p style="color: #8b949e; margin-top: 10px;">Your wallet has been credited with $${amount.toFixed(2)} via ${method}.</p>
                    <div style="margin-top: 30px; padding: 20px; background: #0d1117; border-radius: 12px; border: 1px dashed #30363d;">
                        <span style="display: block; color: #8b949e; font-size: 12px; text-transform: uppercase;">Current Balance</span>
                        <span style="font-size: 24px; font-weight: bold; color: #00ff88;">Check Dashboard</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    return await sendEmail({ to, subject: `Deposit Confirmed: $${amount.toFixed(2)} added to your wallet`, html });
}

export async function sendTicketReplyEmail(to: string, ticketSubject: string, message: string) {
    const html = `
        <div style="font-family: 'Inter', sans-serif; background-color: #0d1117; color: #ffffff; padding: 40px 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #161b22; border-radius: 20px; overflow: hidden; border: 1px solid #30363d;">
                <div style="background: #4f46e5; height: 5px;"></div>
                <div style="padding: 40px;">
                    <h2 style="margin: 0; color: #fff;">New Reply to your Ticket</h2>
                    <p style="color: #8b949e; margin-top: 5px;">Subject: ${ticketSubject}</p>
                    <div style="margin-top: 30px; padding: 25px; background: #0d1117; border-radius: 12px; border: 1px solid #30363d; line-height: 1.6;">
                        ${message.replace(/\n/g, '<br/>')}
                    </div>
                    <div style="text-align: center; margin-top: 40px;">
                        <a href="https://officialum1.com/dashboard" style="background: #4f46e5; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">View Ticket & Reply</a>
                    </div>
                </div>
            </div>
        </div>
    `;
    return await sendEmail({ to, subject: `New Support Reply: ${ticketSubject}`, html });
}
