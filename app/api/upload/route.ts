import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error("[Upload] No file found in FormData");
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || '.jpg';
        const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;

        // Ensure "public/uploads" exists using absolute path
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            console.log(`[Upload] Creating directory: ${uploadDir}`);
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        console.log(`[Upload] Saving file to: ${filePath}`);

        // Save file
        fs.writeFileSync(filePath, buffer);

        // Return public URL
        const publicUrl = `/uploads/${filename}`;
        console.log(`[Upload] Success: ${publicUrl}`);
        return NextResponse.json({ success: true, url: publicUrl });

    } catch (e: any) {
        console.error("[Upload Error]:", e);
        return NextResponse.json({ error: "Upload failed: " + e.message }, { status: 500 });
    }
}

