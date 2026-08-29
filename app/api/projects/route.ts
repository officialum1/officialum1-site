import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'data', 'projects.json');

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json([]);
    }
}

import { isAuthenticated } from '@/lib/auth';

export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const project = await request.json();
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const projects = JSON.parse(fileContents);

        const newProject = {
            ...project,
            id: projects.length > 0 ? Math.max(...projects.map((p: any) => p.id)) + 1 : 1,
        };
        projects.push(newProject);
        await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2));

        return NextResponse.json(newProject);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save project' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const { id } = await request.json();
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        let projects = JSON.parse(fileContents);
        projects = projects.filter((p: any) => p.id !== id);
        await fs.writeFile(dataFilePath, JSON.stringify(projects, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
