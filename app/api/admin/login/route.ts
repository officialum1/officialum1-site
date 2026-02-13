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
        const inputEmail = (body.email || '').trim().toLowerCase();
        const password = body.password;

        let isValid = false;
        let userRole = 'admin';

        console.log(`🔍 Admin Login Attempt: "${inputEmail}"`);

        // 1. MASTER ADMIN & SYSTEM USER CHECK
        if (!inputEmail || inputEmail === 'admin' || inputEmail === 'officialum1') {
            let storedMasterPass = DEFAULT_ADMIN_PASSWORD;

            try {
                const rows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'admin_password'");
                if (rows.length > 0 && rows[0].setting_value) {
                    storedMasterPass = rows[0].setting_value;
                }
            } catch (e) { }

            if (storedMasterPass) {
                const isMatch = await bcrypt.compare(password, storedMasterPass).catch(() => password === storedMasterPass);
                // Simple equality check too in case of plain text migration
                if (isMatch || password === storedMasterPass) {
                    isValid = true;
                    console.log("✅ Master Password check passed");
                }
            }
        }

        // 2. COMPREHENSIVE TABLE SEARCH (Employees -> Users)
        if (!isValid && inputEmail) {
            // Check Employees Table
            const employees: any = await query("SELECT * FROM employees WHERE LOWER(email) = ? OR LOWER(username) = ?", [inputEmail, inputEmail]);
            if (employees.length > 0) {
                for (const emp of employees) {
                    const isHashMatch = await bcrypt.compare(password, emp.password).catch(() => false);
                    const isPlainMatch = password === emp.password;
                    if (isHashMatch || isPlainMatch) {
                        isValid = true;
                        userRole = emp.position === 'Admin' ? 'admin' : 'seller';
                        console.log(`✅ Employee match: ${emp.email}`);
                        break;
                    }
                }
            }

            // Check Users Table (Only for Admin/Seller roles)
            if (!isValid) {
                const users: any = await query("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", [inputEmail, inputEmail]);
                if (users.length > 0) {
                    for (const user of users) {
                        const isHashMatch = await bcrypt.compare(password, user.password).catch(() => false);
                        const isPlainMatch = password === user.password;
                        if ((isHashMatch || isPlainMatch) && (user.role === 'admin' || user.role === 'seller')) {
                            isValid = true;
                            userRole = user.role;
                            console.log(`✅ User match: ${user.email} (Role: ${userRole})`);
                            break;
                        }
                    }
                }
            }

            // 3. Last Resort Fallback: If input was 'admin', check the user with admin role
            if (!isValid && inputEmail === 'admin') {
                const admins: any = await query("SELECT * FROM users WHERE role = 'admin' LIMIT 1");
                if (admins.length > 0) {
                    const admin = admins[0];
                    const isHashMatch = await bcrypt.compare(password, admin.password).catch(() => false);
                    const isPlainMatch = password === admin.password;
                    if (isHashMatch || isPlainMatch) {
                        isValid = true;
                        userRole = 'admin';
                        console.log(`✅ Admin user-table fallback match: ${admin.email}`);
                    }
                }
            }
        }

        if (isValid) {
            console.log(`🚀 Login SUCCESS: ${inputEmail || 'admin'} as ${userRole}`);
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

        console.log(`❌ Login FAILED: ${inputEmail || 'admin'}`);
        return NextResponse.json({
            success: false,
            message: 'Invalid credentials',
            debug: { email: inputEmail, hasPass: !!password }
        }, { status: 401 });

    } catch (error: any) {
        console.error('🔥 Login Error:', error);
        return NextResponse.json({ success: false, error: 'Server error', details: error.message }, { status: 500 });
    }
}
