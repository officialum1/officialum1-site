import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'data', 'posts.json');

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading file:", error);
        return NextResponse.json([], { status: 500 });
    }
}

import { isAuthenticated } from '@/lib/auth';

export async function POST(request: Request) {
    if (!(await isAuthenticated())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const post = await request.json();
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const posts = JSON.parse(fileContents);

        const newPost = {
            ...post,
            id: posts.length > 0 ? Math.max(...posts.map((p: any) => p.id)) + 1 : 1,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };

        posts.unshift(newPost);
        await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 2));

        return NextResponse.json(newPost);
    } catch (error) {
        console.error("Error writing file:", error);
        return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
    }
}
