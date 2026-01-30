import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replace(/\s/g, '_');

        // Ensure "public/uploads" exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);

        // Save file
        fs.writeFileSync(filePath, buffer);

        // Return public URL
        const publicUrl = `/uploads/${filename}`;
        return NextResponse.json({ success: true, url: publicUrl });

    } catch (e: any) {
        console.error("Upload Error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
