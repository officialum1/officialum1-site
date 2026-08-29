import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const employees: any = await query("SELECT * FROM employees WHERE email = ?", [email]);
        if (employees.length === 0) return NextResponse.json({ error: 'Staff not found' }, { status: 404 });

        const { password, ...rest } = employees[0];
        return NextResponse.json({
            ...rest,
            allowedPlatforms: rest.allowedPlatforms ? JSON.parse(rest.allowedPlatforms) : [],
            permissions: rest.permissions ? JSON.parse(rest.permissions) : []
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

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
