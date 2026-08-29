import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error("[Upload] No file found in FormData");
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Convert file to Base64 Data URI
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = file.type || 'image/jpeg'; // Default to jpeg if type is missing
        const dataUri = `data:${mimeType};base64,${base64}`;

        console.log(`[Upload] Processed file: ${file.name} (${(buffer.length / 1024).toFixed(2)} KB)`);

        // Return Data URI as the URL
        // Note: For production use with large files, consider using S3 or similar storage.
        // This Base64 approach avoids filesystem write errors on serverless environments.
        return NextResponse.json({ success: true, url: dataUri });

    } catch (e: any) {
        console.error("[Upload Error]:", e);
        return NextResponse.json({ error: "Upload failed: " + e.message }, { status: 500 });
    }
}

