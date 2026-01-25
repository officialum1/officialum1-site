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
                allowedPlatforms: e.allowedPlatforms ? JSON.parse(e.allowedPlatforms) : []
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
            password: hashedPassword,
            position: body.position,
            department: body.department,
            salary: Number(body.salary || 0),
            commissionRate: Number(body.commissionRate || 0),
            compensationType: body.compensationType,
            allowedPlatforms: JSON.stringify(body.allowedPlatforms || []),
            status: 'Active'
        };

        await query(
            "INSERT INTO employees (id, name, email, password, position, department, salary, commissionRate, compensationType, allowedPlatforms, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [newEmp.id, newEmp.name, newEmp.email, newEmp.password, newEmp.position, newEmp.department, newEmp.salary, newEmp.commissionRate, newEmp.compensationType, newEmp.allowedPlatforms, newEmp.status]
        );

        // Return without password
        const { password: _, ...responseEmp } = newEmp;

        return NextResponse.json(responseEmp);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
