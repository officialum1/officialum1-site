import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'data', 'messages.json');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let messages = [];

        try {
            const fileContents = await fs.readFile(dataFilePath, 'utf8');
            messages = JSON.parse(fileContents);
        } catch (error) {
            // If file doesn't exist or is invalid, start with empty array
            messages = [];
        }

        const newMessage = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            ...body,
            status: 'new'
        };

        messages.unshift(newMessage);

        // Ensure directory exists
        const dir = path.dirname(dataFilePath);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }

        await fs.writeFile(dataFilePath, JSON.stringify(messages, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving message:", error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
