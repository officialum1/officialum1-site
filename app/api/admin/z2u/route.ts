import { NextResponse } from 'next/server';
import { query, initDB } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await initDB();
        const body = await req.json();
        const headersPass = req.headers.get('x-admin-password');

        // Robust Auth Strategy
        let isAuthorized = false;

        // 1. Extension Auth via Environment Var
        if (headersPass && process.env.ADMIN_PASSWORD && headersPass === process.env.ADMIN_PASSWORD) {
            isAuthorized = true;
        }

        // 2. Extension Auth via Database Setting (Fallback)
        if (!isAuthorized && headersPass) {
            try {
                const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
                if (rows.length > 0 && headersPass === rows[0].setting_value) {
                    isAuthorized = true;
                }
            } catch (e) { }
        }

        // 3. User Session Context (Dashboard usage)
        if (!isAuthorized && await isAuthenticated()) {
            isAuthorized = true;
        }

        if (body.action === 'log_bump') {
            await query(
                'INSERT INTO z2u_bump_logs (message, type) VALUES (?, ?)',
                [body.message, body.type || 'info']
            );
            return NextResponse.json({ success: true });
        }

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (body.action === 'delete' && body.id) {
            await query('DELETE FROM z2u_listings WHERE id = ?', [body.id]);
            return NextResponse.json({ success: true });
        }

        const { listings } = body;
        console.log(`[API Z2U] Received ${listings?.length || 0} listings for sync.`);
        if (listings && Array.isArray(listings)) {
            let count = 0;
            for (const item of listings) {
                // simple status check
                let status = 'Active';
                if (item.status && (item.status.toLowerCase().includes('deactiv') || item.status.toLowerCase().includes('inactive'))) {
                    status = 'Inactive';
                }

                await query(
                    `INSERT INTO z2u_listings (id, title, price, stock, status, last_sync, url, editUrl, relistUrl, extendUrl)
                            VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                            title = VALUES(title),
                            price = VALUES(price),
                            stock = VALUES(stock),
                            status = VALUES(status),
                            last_sync = NOW(),
                            url = VALUES(url),
                            editUrl = VALUES(editUrl),
                            relistUrl = VALUES(relistUrl),
                            extendUrl = VALUES(extendUrl)`,
                    [item.id, item.title, item.price, item.stock, status, item.url, item.editUrl, item.relistUrl, item.extendUrl]
                );
                count++;
            }
            return NextResponse.json({ success: true, count });
        }

        return NextResponse.json({ error: 'No listings provided' }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await initDB();
        const { searchParams } = new URL(req.url);
        if (searchParams.get('type') === 'logs') {
            const logs = await query(
                'SELECT * FROM z2u_bump_logs ORDER BY created_at DESC LIMIT 100'
            );
            return NextResponse.json({ logs });
        }

        const listings = await query(
            'SELECT * FROM z2u_listings ORDER BY last_sync DESC LIMIT 500'
        );
        return NextResponse.json({ listings });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
