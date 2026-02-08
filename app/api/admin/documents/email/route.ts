import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(req: Request) {
    try {
        const { id, recipientEmail } = await req.json();

        // 1. Fetch document (You might want to implement PDF generation here if you attach it)
        // For now, we'll send a link to verify/view the document if applicable, or just notify.
        // Or, assume the client sends the PDF blob/link.
        // Since we don't have server-side PDF generation yet, we will send an email with the verification link.

        // Fetch details from DB to personalize email
        const [doc]: any = await (require('@/lib/db').query)('SELECT * FROM documents WHERE id = ?', [id]);

        if (!doc) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?doc=${doc.document_number}&user=${encodeURIComponent(doc.recipient_name)}`;

        await transporter.sendMail({
            from: `"OfficialUM1 Documents" <${process.env.SMTP_USER}>`,
            to: recipientEmail,
            subject: `Official Document: ${doc.subject || doc.type.toUpperCase()} - ${doc.document_number}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2>Official Document Notification</h2>
                    <p>Dear ${doc.recipient_name},</p>
                    <p>An official document (${doc.type}) has been issued to you by OfficialUM1 LLC.</p>
                    
                    <div style="background: #f4f4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <strong>Document Number:</strong> ${doc.document_number}<br>
                        <strong>Date:</strong> ${new Date(doc.created_at).toLocaleDateString()}<br>
                        <strong>Subject:</strong> ${doc.subject || 'N/A'}
                    </div>

                    <p>You can verify and view the details of this document by clicking the link below:</p>
                    <a href="${verificationLink}" style="background: #2b4c7e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Document</a>
                    
                    <p style="margin-top: 30px; font-size: 0.8em; color: #888;">This is an automated message. Please do not reply.</p>
                </div>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email error:', error);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
}
