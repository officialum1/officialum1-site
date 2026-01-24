import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const employeesFile = path.join(process.cwd(), 'data', 'employees.json');

function getEmployees() {
    if (!fs.existsSync(employeesFile)) {
        return [];
    }
    const data = fs.readFileSync(employeesFile, 'utf8');
    return JSON.parse(data);
}

function saveEmployees(employees: any[]) {
    fs.writeFileSync(employeesFile, JSON.stringify(employees, null, 2));
}

export async function GET() {
    try {
        const employees = getEmployees();
        return NextResponse.json(employees);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const employees = getEmployees();

        const newEmployee = {
            id: `emp_${Date.now()}`,
            ...body,
            joinDate: body.joinDate || new Date().toISOString().split('T')[0],
            status: 'Active' // Default status
        };

        employees.push(newEmployee);
        saveEmployees(employees);

        return NextResponse.json(newEmployee);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add employee' }, { status: 500 });
    }
}
