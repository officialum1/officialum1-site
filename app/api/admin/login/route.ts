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
        const email = (body.email || '').trim().toLowerCase();
        const password = body.password;

        let isValid = false;
        let userRole = 'admin';

        console.log(`🔍 Admin Login Attempt: "${email}"`);

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

            if (storedPass) {
                const isMatch = await bcrypt.compare(password, storedPass).catch(() => password === storedPass);
                if (isMatch || password === storedPass) {
                    isValid = true;
                    console.log("✅ Master Admin check passed");
                }
            }
        }

        // 2. STAFF / EMPLOYEE / USER CHECK
        if (!isValid && email) {
            // Check Employees first
            const employees: any = await query("SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(username) = ?", [email, email]);
            if (employees.length > 0) {
                const emp = employees[0];
                const isMatch = await bcrypt.compare(password, emp.password).catch(() => password === emp.password);
                if (isMatch || password === emp.password) {
                    isValid = true;
                    userRole = emp.role || 'seller';
                    console.log(`✅ Employee check passed: ${emp.email}`);
                }
            }

            // Check Users table
            if (!isValid) {
                const users: any = await query("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [email, email]);
                if (users.length > 0) {
                    const user = users[0];
                    const isHashMatch = await bcrypt.compare(password, user.password).catch(() => false);
                    const isPlainMatch = password === user.password;

                    if ((isHashMatch || isPlainMatch) && (user.role === 'admin' || user.role === 'seller')) {
                        isValid = true;
                        userRole = user.role;
                        console.log(`✅ User table check passed: ${user.email} (Role: ${userRole})`);
                    }
                }
            }
        }

        if (isValid) {
            console.log(`🚀 Login SUCCESS: ${email || 'admin'} as ${userRole}`);
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

        console.log(`❌ Login FAILED: ${email || 'admin'} - No matching credentials.`);
        return NextResponse.json({
            success: false,
            message: 'Invalid credentials',
            debug: { email, hasPass: !!password, isMaster: !email || email === 'admin' }
        }, { status: 401 });
    } catch (error: any) {
        console.error('🔥 Login Critical Error:', error);
        return NextResponse.json({ success: false, error: 'Server error', details: error.message }, { status: 500 });
    }
}
