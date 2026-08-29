import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const employees: any = await query("SELECT * FROM employees ORDER BY joinDate DESC");
        const parsed = employees.map((e: any) => {
            const { password, ...rest } = e;
            return {
                ...rest,
                allowedPlatforms: e.allowedPlatforms ? JSON.parse(e.allowedPlatforms) : [],
                permissions: e.permissions ? JSON.parse(e.permissions) : []
            };
        });
        return NextResponse.json(parsed);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Hash password
        const plainPassword = body.password || 'default123';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        const newEmp = {
            id: `emp_${Date.now()}`,
            name: body.name,
            email: body.email,
            username: body.username || null,
            password: hashedPassword,
            position: body.position,
            department: body.department,
            salary: Number(body.salary || 0),
            commissionRate: Number(body.commissionRate || 0),
            compensationType: body.compensationType,
            allowedPlatforms: JSON.stringify(body.allowedPlatforms || []),
            permissions: JSON.stringify(body.permissions || []),
            status: 'Active'
        };

        // 1. Insert into employees
        await query(
            "INSERT INTO employees (id, name, username, email, password, position, department, salary, commissionRate, compensationType, allowedPlatforms, status, permissions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [newEmp.id, newEmp.name, newEmp.username, newEmp.email, newEmp.password, newEmp.position, newEmp.department, newEmp.salary, newEmp.commissionRate, newEmp.compensationType, newEmp.allowedPlatforms, newEmp.status, newEmp.permissions]
        );

        // 2. Synchronize with users table for login
        // Check if exists
        const existing: any = await query("SELECT id FROM users WHERE email = ?", [newEmp.email]);
        if (existing.length === 0) {
            await query(
                "INSERT INTO users (id, email, username, password, role, is_verified, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [newEmp.id, newEmp.email, newEmp.username, plainPassword, 'seller', true, newEmp.permissions]
            );
        } else {
            // Update existing user to staff
            await query(
                "UPDATE users SET role = 'seller', permissions = ?, password = ?, username = ? WHERE email = ?",
                [newEmp.permissions, plainPassword, newEmp.username, newEmp.email]
            );
        }

        // Return without password
        const { password: _, ...responseEmp } = newEmp;

        return NextResponse.json(responseEmp);
    } catch (e: any) {
        console.error("Employee Creation Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, status, name, position, department, salary, commissionRate, compensationType, allowedPlatforms, permissions, password } = body;

        if (status) {
            await query("UPDATE employees SET status = ? WHERE id = ?", [status, id]);

            // If suspended, revoke login access in users table?? 
            if (status !== 'Active') {
                const empRows: any = await query("SELECT email FROM employees WHERE id = ?", [id]);
                if (empRows.length > 0) {
                    await query("UPDATE users SET role = 'buyer' WHERE email = ?", [empRows[0].email]);
                }
            } else {
                const empRows: any = await query("SELECT email, permissions FROM employees WHERE id = ?", [id]);
                if (empRows.length > 0) {
                    await query("UPDATE users SET role = 'seller', permissions = ? WHERE email = ?", [empRows[0].permissions, empRows[0].email]);
                }
            }
        } else {
            // Full Update
            await query(
                `UPDATE employees SET 
                    name = ?, 
                    username = ?,
                    position = ?, 
                    department = ?, 
                    salary = ?, 
                    commissionRate = ?, 
                    compensationType = ?, 
                    allowedPlatforms = ?, 
                    permissions = ? 
                WHERE id = ?`,
                [name, body.username || null, position, department, Number(salary || 0), Number(commissionRate || 0), compensationType, JSON.stringify(allowedPlatforms || []), JSON.stringify(permissions || []), id]
            );

            // Update or Create user for login synchronization
            const empRows: any = await query("SELECT email, username FROM employees WHERE id = ?", [id]);
            if (empRows.length > 0) {
                const userEmail = empRows[0].email;
                const userUsername = empRows[0].username;
                const existingUser: any = await query("SELECT id FROM users WHERE email = ?", [userEmail]);

                if (existingUser.length > 0) {
                    const updateParams: any[] = [JSON.stringify(permissions || []), userUsername, userEmail];
                    let updateQuery = "UPDATE users SET role = 'seller', permissions = ?, username = ? WHERE email = ?";

                    if (password) {
                        updateQuery = "UPDATE users SET role = 'seller', permissions = ?, username = ?, password = ? WHERE email = ?";
                        updateParams.splice(2, 0, password); // Insert password before email, after username
                    }
                    await query(updateQuery, updateParams);
                } else {
                    // Create missing user entry
                    await query(
                        "INSERT INTO users (id, email, username, password, role, is_verified, permissions) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        [id, userEmail, userUsername, password || 'default123', 'seller', true, JSON.stringify(permissions || [])]
                    );
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Employee PATCH Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Get email first to cleanup user table
        const empRows: any = await query("SELECT email FROM employees WHERE id = ?", [id]);

        await query("DELETE FROM employees WHERE id = ?", [id]);

        // Downgrade user to buyer
        if (empRows.length > 0) {
            await query("UPDATE users SET role = 'buyer', permissions = NULL WHERE email = ?", [empRows[0].email]);
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
