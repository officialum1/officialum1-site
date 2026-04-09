import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';

export async function POST(req: Request) {
    try {
        await initDB();

        const body = await req.json();
        const {
            type,
            documentNumber,
            recipientName,
            recipientEmail,
            recipientAddress,
            subject,
            content,
            items,
            amount
        } = body;

        // Generate ID
        const id = `DOC-${Date.now()}`;

        await query(
            `INSERT INTO documents 
            (id, type, document_number, recipient_name, recipient_email, recipient_address, subject, content, items, amount, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                id,
                type,
                documentNumber,
                recipientName,
                recipientEmail || null,
                recipientAddress,
                subject,
                content,
                items ? JSON.stringify(items) : null,
                amount || 0
            ]
        );

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error saving document:', error);
        return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await initDB(); // Ensure DB is init for GET as well just in case

        const url = new URL(req.url);
        const type = url.searchParams.get('type');

        let sql = 'SELECT * FROM documents ORDER BY created_at DESC';
        const params: any[] = [];

        if (type && type !== 'all') {
            sql = 'SELECT * FROM documents WHERE type = ? ORDER BY created_at DESC';
            params.push(type);
        }

        const documents = await query(sql, params);
        return NextResponse.json({ documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }
}
