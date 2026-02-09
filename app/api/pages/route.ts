import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'data', 'pages.json');

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get('page');
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);

        if (page && data[page]) {
            return NextResponse.json({ content: data[page] });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading pages file:", error);
        return NextResponse.json({}, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // body should be { page: 'terms'|'privacy'|'about', content: '...' }

        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const pages = JSON.parse(fileContents);

        if (body.page && pages.hasOwnProperty(body.page)) {
            pages[body.page] = body.content;
            await fs.writeFile(dataFilePath, JSON.stringify(pages, null, 2));
            return NextResponse.json({ success: true, page: body.page });
        } else {
            return NextResponse.json({ error: 'Invalid page key' }, { status: 400 });
        }

    } catch (error) {
        console.error("Error writing pages file:", error);
        return NextResponse.json({ error: 'Failed to update page' }, { status: 500 });
    }
}
