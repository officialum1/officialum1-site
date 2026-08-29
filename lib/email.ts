import nodemailer from 'nodemailer';
import { query } from '@/lib/db';

interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

/**
 * Core function to send emails using SMTP settings.
 * Includes a centralized Layout for all templates.
 */
export async function sendEmail({ to, subject, text, html }: EmailOptions, throwOnError = false) {
    let settings: any = {};
    try {
        const rows = await query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('smtpHost', 'smtpUser', 'smtpPass')") as any[];
        rows.forEach((r: any) => settings[r.setting_key] = r.setting_value);
    } catch (e) {
        console.warn("Failed to fetch SMTP settings from DB, using defaults");
    }

    const defaultHost = process.env.SMTP_HOST || 'smtp.titan.email';
    const defaultUser = process.env.SMTP_USER || 'no-reply@officialum1.com';
    const defaultPass = process.env.SMTP_PASS || '';

    const smtpHost = settings.smtpHost || defaultHost;
    const smtpUser = settings.smtpUser || defaultUser;
    const smtpPass = settings.smtpPass || defaultPass;

    const trySend = async (host: string, user: string, pass: string, isFallback = false) => {
        try {
            console.log(`${isFallback ? '[Fallback]' : '[Primary]'} Sending email to ${to} via ${host} ...`);
            const transporter = nodemailer.createTransport({
                host: host,
                port: 465,
                secure: true,
                auth: { user, pass }
            });

            await transporter.sendMail({
                from: `"OfficialUM1" <${user}>`,
                to,
                subject,
                text,
                html,
                replyTo: 'no-reply@officialum1.com',
                headers: {
                    'X-Auto-Response-Suppress': 'OOF, AutoReply',
                    'Precedence': 'bulk'
                }
            });
            return true;
        } catch (e: any) {
            console.error(`${isFallback ? '[Fallback]' : '[Primary]'} Email Send Error:`, e.message);
            throw e;
        }
    };

    try {
        return await trySend(smtpHost, smtpUser, smtpPass);
    } catch (primaryError: any) {
        const usedCustomSettings = (smtpHost !== defaultHost) || (smtpUser !== defaultUser) || (smtpPass !== defaultPass);
        if (usedCustomSettings) {
            try { return await trySend(defaultHost, defaultUser, defaultPass, true); }
            catch (fallbackError: any) { if (throwOnError) throw fallbackError; return false; }
        }
        if (throwOnError) throw primaryError;
        return false;
    }
}

function ModernLayout(content: string, type: 'success' | 'alert' | 'info' | 'auth' = 'info') {
    const accents = {
        success: '#ff4444',
        alert: '#ff4444',
        info: '#00c3ff',
        auth: '#7c3aed'
    };
    const accent = accents[type];

    return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #05070a; color: #ffffff; padding: 40px 10px; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background: #0d1117; border-radius: 28px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 40px 100px rgba(0,0,0,0.8);">
            
            <div style="padding: 40px 30px 20px; text-align: center; background: linear-gradient(180deg, #0d1117 0%, rgba(13,17,23,0) 100%);">
                <div style="font-size: 26px; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px;">
                    <span style="color: #ffffff;">OFFICIAL</span><span style="color: #ff4444;">UM1</span>
                </div>
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #4b5563; font-weight: 700;">Premium Marketplace</div>
            </div>

            <div style="background: linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%); height: 2px; margin: 0 40px;"></div>

            <div style="padding: 40px 45px;">
                ${content}
            </div>

            <div style="background: #05070a; padding: 40px 45px; text-align: center; border-top: 1px solid #1f2937;">
                <div style="margin-bottom: 25px;">
                    <a href="https://officialum1.com" style="color: #9ca3af; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 15px;">Shop</a>
                    <a href="https://officialum1.com/support" style="color: #9ca3af; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 15px;">Support</a>
                    <a href="https://officialum1.com/dashboard" style="color: #9ca3af; text-decoration: none; font-size: 13px; font-weight: 600; margin: 0 15px;">Dashboard</a>
                </div>
                <p style="margin: 0; color: #6b7280; font-size: 12px; margin-bottom: 10px;">&copy; 2026 OfficialUM1 Marketplace. All rights reserved.</p>
                <div style="background: rgba(255,68,68,0.05); border: 1px solid rgba(255,68,68,0.1); padding: 15px; border-radius: 12px; margin-top: 20px;">
                    <p style="margin: 0; color: #ef4444; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ This is an unmonitored mailbox</p>
                    <p style="margin: 5px 0 0; color: #4b5563; font-size: 11px; line-height: 1.4;">Replies to this address will not be read. For assistance, please open a support ticket.</p>
                </div>
            </div>
        </div>
    </div>
    `;
}

export async function sendVerificationEmail(to: string, link: string, settings?: any) {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">🎒</div>
            <h1 style="color: #ffffff; font-size: 30px; font-weight: 800; margin-bottom: 15px; letter-spacing: -0.5px;">Welcome Aboard!</h1>
            <p style="color: #9ca3af; font-size: 16px; margin-bottom: 35px;">Confirm your email address to unlock the full potential of OfficialUM1.</p>
            <a href="${link}" style="display: inline-block; background: #ff4444; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 16px; font-weight: 800; shadow: 0 20px 40px rgba(255,68,68,0.25);">Verify Identity</a>
        </div>
    `;
    return await sendEmail({ to, subject: "Action Required: Verify your Account", html: ModernLayout(content, 'info') });
}

export async function sendAuditReport(to: string, subject: string, data: any, settings?: any) {
    const content = `
        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin-bottom: 10px; text-align: center;">Order Fulfilled 🚀</h1>
        <div style="background: #161b22; border: 1px solid #1f2937; border-radius: 20px; padding: 25px; margin-bottom: 30px;">
            <div style="font-size: 11px; color: #ff4444; font-weight: 800; text-transform: uppercase; margin-bottom: 5px;">Item Name</div>
            <div style="font-size: 19px; font-weight: 700; color: #ffffff;">${data.pa || 'Digital Item'}</div>
        </div>
        <div style="background: #05070a; border: 1px solid #1f2937; border-radius: 20px; padding: 30px; font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #ff4444; word-break: break-all;">
            ${(data.details || '').replace(/\n/g, '<br/>')}
        </div>
    `;
    return await sendEmail({ to, subject: `Delivery: Access for ${data.pa || 'your order'}`, html: ModernLayout(content, 'success') });
}

export async function sendPasswordResetEmail(to: string, link: string, settings?: any) {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">🔐</div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin-bottom: 10px;">Reset Your Password</h1>
            <p style="color: #9ca3af; font-size: 15px; margin-bottom: 35px;">Click below to reset your password.</p>
            <a href="${link}" style="display: inline-block; background: #ff4444; color: #ffffff; text-decoration: none; padding: 18px 45px; border-radius: 16px; font-weight: 800;">Reset Security</a>
        </div>
    `;
    return await sendEmail({ to, subject: "Security Alert: Reset Your Password", html: ModernLayout(content, 'alert') });
}

export async function sendDepositEmail(to: string, amount: number, method: string, settings?: any) {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">💰</div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800;">Funds Received!</h1>
            <div style="background: #161b22; border: 1px solid #1f2937; border-radius: 20px; padding: 40px; margin: 20px 0;">
                <div style="font-size: 11px; color: #ff4444; font-weight: 800; text-transform: uppercase;">Amount Deposited</div>
                <div style="font-size: 40px; font-weight: 900; color: #ffffff;">$${amount.toFixed(2)}</div>
                <div style="font-size: 13px; color: #4b5563;">Via ${method}</div>
            </div>
        </div>
    `;
    return await sendEmail({ to, subject: `Deposit Confirmed: $${amount.toFixed(2)} credited`, html: ModernLayout(content, 'success') });
}

export async function sendTicketReplyEmail(to: string, ticketSubject: string, message: string, settings?: any) {
    const content = `
        <h2 style="color: #ffffff; font-size: 24px; font-weight: 800;">Support Update</h2>
        <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">Subject: <span style="color: #ff4444;">${ticketSubject}</span></p>
        <div style="background: #05070a; border: 1px solid #1f2937; border-radius: 20px; padding: 35px; color: #9ca3af; line-height: 1.8;">
            ${message.replace(/\n/g, '<br/>')}
        </div>
    `;
    return await sendEmail({ to, subject: `New Support Reply: ${ticketSubject}`, html: ModernLayout(content, 'info') });
}

export async function sendRestockEmail(to: string, product: any, productUrl: string, settings?: any) {
    const content = `
        <div style="text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800;">Back in Stock!</h1>
            <div style="background: #161b22; border: 1px solid #1f2937; border-radius: 24px; padding: 30px; margin: 20px 0;">
                <img src="${product.image ? product.image : 'https://officialum1.com/logo.jpg'}" style="width: 100px; height: 100px; border-radius: 20px;">
                <h2 style="color: #ffffff; margin-top: 15px;">${product.name}</h2>
                <div style="color: #ff4444; font-weight: 900; font-size: 22px;">$${product.price}</div>
            </div>
            <a href="${productUrl}" style="display: inline-block; background: #ff4444; color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 16px; font-weight: 800;">Buy Now</a>
        </div>
    `;
    return await sendEmail({ to, subject: `Back in Stock: ${product.name}`, html: ModernLayout(content, 'success') });
}

export async function sendReferralBonusEmail(to: string, amount: number, settings?: any) {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">🎁</div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800;">Bonus Credited!</h1>
            <div style="background: #161b22; border: 1px solid #1f2937; border-radius: 20px; padding: 40px; margin: 20px 0;">
                <div style="font-size: 40px; font-weight: 900; color: #ffffff;">$${amount.toFixed(2)}</div>
            </div>
        </div>
    `;
    return await sendEmail({ to, subject: `Referral Bonus Earned!`, html: ModernLayout(content, 'success') });
}

export async function sendOrderReceivedEmail(to: string, itemName: string, orderId: string, settings?: any) {
    const content = `
        <div style="text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800;">Order Received</h1>
            <p style="color: #9ca3af; margin-bottom: 25px;">Preparing <strong>${itemName}</strong> for delivery.</p>
            <div style="background: #161b22; border: 1px solid #1f2937; border-radius: 20px; padding: 25px; margin-bottom: 20px;">
                <div style="font-size: 11px; color: #ff4444; font-weight: 800; text-transform: uppercase;">Order #</div>
                <div style="font-size: 18px; font-weight: 700; color: #ffffff;">${orderId}</div>
            </div>
            <p style="color: #4b5563; font-size: 13px;">You'll receive another email with credentials shortly.</p>
        </div>
    `;
    return await sendEmail({ to, subject: `Received: Order #${orderId}`, html: ModernLayout(content, 'info') });
}

export async function sendVerificationStatusEmail(to: string, status: 'approved' | 'rejected', reason?: string, settings?: any) {
    const isApproved = status === 'approved';
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 50px; margin-bottom: 20px;">${isApproved ? '🎖️' : '⚠️'}</div>
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin-bottom: 10px;">
                ${isApproved ? 'Identity Approved!' : 'Verification Declined'}
            </h1>
            <p style="color: #9ca3af; font-size: 16px; margin-bottom: 25px; line-height: 1.6;">
                ${isApproved
            ? 'Congratulations! Your identity verification has been approved. You now have full access to our premium marketplace.'
            : `Your identity verification was declined. Reason: <strong>${reason || 'Documents unclear'}</strong>. Please try again with clear photos.`}
            </p>
            ${isApproved
            ? `<a href="https://officialum1.com/dashboard" style="display: inline-block; background: #ff4444; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 14px; font-weight: 800;">Go to Dashboard</a>`
            : `<a href="https://officialum1.com/dashboard/verification" style="display: inline-block; background: #ff4444; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 14px; font-weight: 800;">Try Again</a>`}
        </div>
    `;
    return await sendEmail({
        to,
        subject: isApproved ? "Identity Verified Successfully" : "Action Required: Verification Declined",
        html: ModernLayout(content, isApproved ? 'success' : 'alert')
    });
}
