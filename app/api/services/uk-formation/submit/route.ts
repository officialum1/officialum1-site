import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sendTelegramAdminAlert } from '@/lib/telegram';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            packageName = 'Starter UK LTD',
            packagePrice = 269,
            companyName,
            companySuffix = 'LTD',
            natureOfBusiness,
            director = {},
            shares = {},
            registeredOffice = 'London Prestigious Address (1-Year Included)',
            mailForwarding = true,
            bankingKit = false,
            vatRegistration = false,
            specialInstructions = ''
        } = body;

        if (!companyName || companyName.trim().length < 2) {
            return NextResponse.json({ error: 'Please enter a valid UK Company Name.' }, { status: 400 });
        }

        if (!director.fullName || !director.email) {
            return NextResponse.json({ error: 'Director full name and email are mandatory.' }, { status: 400 });
        }

        const fullCompanyName = `${companyName.trim().toUpperCase()} ${companySuffix.toUpperCase()}`;
        const orderId = `UK-LTD-${Date.now()}`;

        const caseData = {
            orderId,
            companyName: fullCompanyName,
            rawName: companyName.trim(),
            suffix: companySuffix,
            packageName,
            packagePrice,
            natureOfBusiness: natureOfBusiness || 'Corporate & Business Consulting Services',
            director: {
                fullName: director.fullName,
                email: director.email,
                phone: director.phone || '',
                nationality: director.nationality || 'British',
                occupation: director.occupation || 'Director',
                dob: director.dob || '',
                residentialAddress: director.residentialAddress || '',
                serviceAddress: director.useRegisteredAddress ? 'Same as London Registered Office' : (director.serviceAddress || director.residentialAddress)
            },
            shares: {
                shareCount: shares.shareCount || 100,
                currency: 'GBP',
                valuePerShare: shares.valuePerShare || 1,
                totalCapital: (shares.shareCount || 100) * (shares.valuePerShare || 1)
            },
            registeredOffice,
            mailForwarding,
            bankingKit,
            vatRegistration,
            specialInstructions,
            createdAt: new Date().toISOString()
        };

        const notesContent = `UK LTD FORMATION CASE:
Order ID: ${orderId}
Company: ${fullCompanyName}
Package: ${packageName} ($${packagePrice})
Director: ${director.fullName} (${director.email} | ${director.phone || 'N/A'})
Nationality: ${director.nationality || 'N/A'} | Occupation: ${director.occupation || 'Director'}
London Address: ${registeredOffice}
Banking/Stripe Kit: ${bankingKit ? 'YES' : 'NO'} | VAT Filing: ${vatRegistration ? 'YES' : 'NO'}
Special Instructions: ${specialInstructions || 'None'}

METADATA_JSON:
${JSON.stringify(caseData)}`;

        // Save to CRM / Formations Pipeline
        try {
            await query(
                `INSERT INTO leads (name, email, phone, platform, service_type, budget, status, notes, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    director.fullName,
                    director.email,
                    director.phone || '',
                    `UK Formation: ${packageName}`,
                    'UK LTD Formation',
                    `$${packagePrice}`,
                    'New Case',
                    notesContent
                ]
            );
        } catch (dbErr) {
            console.error('Failed to insert into leads table:', dbErr);
        }

        // Send Telegram alert if configured
        try {
            await sendTelegramAdminAlert(
                `🇬🇧 *NEW UK LTD FORMATION ORDER!*\n\n` +
                `*Company:* ${fullCompanyName}\n` +
                `*Package:* ${packageName} ($${packagePrice})\n` +
                `*Director:* ${director.fullName}\n` +
                `*Email:* ${director.email}\n` +
                `*Phone:* ${director.phone || 'N/A'}\n` +
                `*Order ID:* \`${orderId}\``
            );
        } catch (tgErr) {
            // Ignore optional telegram alert errors
        }

        // Send Client Confirmation Email
        try {
            await sendEmail({
                to: director.email,
                subject: `UK Company Formation Order Received — ${fullCompanyName} (Order #${orderId})`,
                html: `
                <div style="font-family: Arial, sans-serif; background-color: #07090e; color: #ffffff; padding: 40px 20px; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background: #0e131f; border-radius: 20px; border: 1px solid #146c78; padding: 35px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
                        <div style="text-align: center; margin-bottom: 25px;">
                            <span style="font-size: 26px; font-weight: 900; color: #146c78;">Official</span><span style="font-size: 26px; font-weight: 900; color: #c4472d;">UM1</span>
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #9ca3af; margin-top: 4px;">UK Corporate Formation Desk</div>
                        </div>

                        <h2 style="color: #ffffff; font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 10px;">🇬🇧 Company Formation Order Confirmed</h2>
                        <p style="color: #9ca3af; font-size: 14px; text-align: center; margin-bottom: 30px;">Thank you for choosing OfficialUM1. Our UK incorporation specialists are now preparing your filing for Companies House submission.</p>

                        <div style="background: rgba(20, 108, 120, 0.08); border: 1px solid rgba(20, 108, 120, 0.3); border-radius: 14px; padding: 20px; margin-bottom: 25px;">
                            <div style="font-size: 11px; text-transform: uppercase; color: #146c78; font-weight: 800;">Order Summary</div>
                            <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 5px;">${fullCompanyName}</div>
                            <div style="font-size: 13px; color: #9ca3af; margin-top: 5px;">Package: <strong style="color: #ffffff;">${packageName}</strong> ($${packagePrice})</div>
                            <div style="font-size: 13px; color: #9ca3af;">Director: <strong style="color: #ffffff;">${director.fullName}</strong></div>
                            <div style="font-size: 13px; color: #9ca3af;">Registered Address: <strong style="color: #ffffff;">${registeredOffice}</strong></div>
                        </div>

                        <div style="border-left: 3px solid #146c78; padding-left: 15px; margin-bottom: 25px;">
                            <div style="font-size: 12px; font-weight: 700; color: #146c78; text-transform: uppercase;">What Happens Next?</div>
                            <p style="color: #d1d5db; font-size: 13px; margin: 5px 0 0;">1. Our compliance team verifies your company name availability with Companies House.<br/>2. Standard UK incorporation is processed within 24 to 48 business hours.<br/>3. Official Certificate of Incorporation, Memorandum & Articles will be delivered to your inbox.</p>
                        </div>

                        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px; border-top: 1px solid #1f2937; paddingTop: 20px;">
                            OfficialUM1 LLC &bull; Corporate Formation & Advisory &bull; <a href="https://officialum1.com" style="color: #146c78; text-decoration: none;">officialum1.com</a>
                        </p>
                    </div>
                </div>
                `
            });
        } catch (mailErr) {
            console.warn('Confirmation email error:', mailErr);
        }

        return NextResponse.json({
            success: true,
            orderId,
            companyName: fullCompanyName,
            message: 'Your UK LTD formation case has been submitted successfully.'
        });

    } catch (error: any) {
        console.error('UK Formation Submission Error:', error);
        return NextResponse.json({ error: error.message || 'Server error processing your formation case.' }, { status: 500 });
    }
}
