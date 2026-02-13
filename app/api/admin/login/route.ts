import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!DEFAULT_ADMIN_PASSWORD) {
    console.warn("WARNING: ADMIN_PASSWORD not configured");
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        let isValid = false;
        let userRole = 'admin';

        // 1. MASTER ADMIN CHECK (If email is 'admin' or empty)
        if (!email || email === 'admin') {
            let storedPass = DEFAULT_ADMIN_PASSWORD;
            let isDefault = true;

            try {
                const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
                if (rows.length > 0 && rows[0].setting_value) {
                    storedPass = rows[0].setting_value;
                    isDefault = false;
                }
            } catch (e) { }

            if (isDefault) {
                if (storedPass && password === storedPass) isValid = true;
            } else if (storedPass) {
                const isMatch = await bcrypt.compare(password, storedPass).catch(() => false);
                if (isMatch) {
                    isValid = true;
                } else if (password === storedPass) {
                    isValid = true;
                    const newHash = await bcrypt.hash(password, 10);
                    await query("UPDATE settings SET setting_value = ? WHERE setting_key = 'admin_password'", [newHash]);
                }
            }
        }

        // 2. STAFF / EMPLOYEE CHECK
        if (!isValid && email) {
            const employees: any = await query("SELECT * FROM employees WHERE email = ? OR username = ?", [email, email]);
            if (employees.length > 0) {
                const emp = employees[0];
                const isMatch = await bcrypt.compare(password, emp.password).catch(() => password === emp.password);
                if (isMatch) {
                    isValid = true;
                    userRole = emp.role || 'staff';
                }
            } else {
                // 3. USER TABLE CHECK (For other admins/sellers)
                const users: any = await query("SELECT * FROM users WHERE email = ? OR username = ?", [email, email]);
                if (users.length > 0) {
                    const user = users[0];
                    const isHashMatch = await bcrypt.compare(password, user.password).catch(() => false);
                    const isPlainMatch = password === user.password;

                    if ((isHashMatch || isPlainMatch) && (user.role === 'admin' || user.role === 'seller')) {
                        isValid = true;
                        userRole = user.role;
                    }
                }
            }
        }

        if (isValid) {
            console.log(`✅ Login Success: ${email || 'admin'} as ${userRole}`);
            const response = NextResponse.json({ success: true, role: userRole });
            const cookieStore = await cookies();
            cookieStore.set('admin_token', 'authenticated_session_v1', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });
            return response;
        }

        console.log(`❌ Login Failed: ${email || 'admin'} - No matching credentials found.`);
        return NextResponse.json({
            success: false,
            message: 'Invalid credentials',
            debug: {
                hasEmail: !!email,
                isMasterAttempt: !email || email === 'admin',
                stage: !isValid ? 'Verification Failed' : 'Success'
            }
        }, { status: 401 });
    } catch (error: any) {
        console.error('🔥 Login Error:', error);
        return NextResponse.json({ success: false, error: 'Server error', details: error.message }, { status: 500 });
    }
}
