import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { id, email, password } = await request.json();

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await query("UPDATE employees SET email = ?, password = ? WHERE id = ?", [email, hashedPassword, id]);
        } else {
            await query("UPDATE employees SET email = ? WHERE id = ?", [email, id]);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
