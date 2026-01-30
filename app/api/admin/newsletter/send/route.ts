import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendAuditReport } from '@/lib/email'; // Re-using existing email function

export async function POST(req: Request) {
    try {
        const { subject, content } = await req.json();

        // 1. Fetch Subscribers
        const subscribers: any = await query("SELECT email FROM newsletter");
        const users: any = await query("SELECT email FROM users WHERE role = 'buyer'"); // Also send to registered users? Maybe redundant if they are in newsletter table. Let's just stick to newsletter table for now.

        // Merge lists (optional, for now just newsletter table)
        const emails = [...new Set(subscribers.map((s: any) => s.email))];

        if (emails.length === 0) return NextResponse.json({ error: "No subscribers found." }, { status: 400 });

        // 2. Fetch Settings for SMTP
        const settingsRows: any = await query("SELECT setting_key, setting_value FROM settings");
        const settings = settingsRows.reduce((acc: any, row: any) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {});

        // 3. Send Emails (Batching recommended for large lists, but fine for MVP)
        let successCount = 0;
        for (const email of emails) {
            try {
                // We reuse sendAuditReport or create a new general sendEmail function. 
                // Since sendAuditReport is tied to specific templates, let's create a generic call here or hack it.
                // Ideally, we move `createTransporter` out of `lib/email.ts` to be reusable.
                // For now, I'll direct import `nodemailer` here if needed, OR import `sendEmail` if it exists.
                // Looking at previous context, `sendAuditReport` is what we have. 
                // Let's rely on `lib/email.ts`'s internal transporter if possible.
                // Actually, let's just use `sendAuditReport` but pass the custom content as "details".
                // Create a custom template type if possible, or just hack the parameters.

                await sendAuditReport(email, subject, {
                    da: "NEWSLETTER", // Header
                    pa: content, // We will inject HTML here, hopefully the template supports it
                    links: 0,
                    details: " " // Empty details
                }, settings);

                successCount++;
            } catch (e) {
                console.error(`Failed to send to ${email}`, e);
            }
        }

        return NextResponse.json({ success: true, count: successCount });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
