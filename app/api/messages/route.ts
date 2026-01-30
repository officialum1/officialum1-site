import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';

const dataFilePath = path.join(process.cwd(), 'data', 'messages.json');

export async function GET() {
    // Basic check for authenticated session
    const isAuth = await isAuthenticated();
    if (!isAuth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json([]);
    }
}
