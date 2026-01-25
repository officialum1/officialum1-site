import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
        }

        const employees: any = await query("SELECT * FROM employees WHERE email = ?", [email]);
        const employee = employees[0];

        if (!employee) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        // Check password
        let isValid = false;
        const storedPass = employee.password || '';

        if (storedPass) {
            // Try hash
            const isMatch = await bcrypt.compare(password, storedPass).catch(() => false);

            if (isMatch) {
                isValid = true;
            } else if (storedPass === password) {
                // Legacy plain text
                isValid = true;
                // Migrate
                const newHash = await bcrypt.hash(password, 10);
                await query("UPDATE employees SET password = ? WHERE id = ?", [newHash, employee.id]);
            }
        } else {
            // No password set? Fail? Or allow if user typed empty password?
            // Assuming strict login mostly. If no password in DB, fail unless migration logic exists (e.g. initial login?)
            // I'll fail for now to be secure.
        }

        if (isValid) {
            const { password: _, ...userWithoutPass } = employee;
            return NextResponse.json({ success: true, user: userWithoutPass });
        }

        return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
