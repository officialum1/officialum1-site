import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'data', 'testimonials.json');

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('all') === 'true'; // Admin wants to see all

        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const testimonials = JSON.parse(fileContents);

        // Return only approved for public, all for admin
        const data = showAll ? testimonials : testimonials.filter((t: any) => t.approved);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading testimonials file:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const testimonials = JSON.parse(fileContents);

        if (body.action === 'approve') {
            // Approve existing
            const index = testimonials.findIndex((t: any) => t.id === body.id);
            if (index !== -1) {
                testimonials[index].approved = true;
                await fs.writeFile(dataFilePath, JSON.stringify(testimonials, null, 2));
                return NextResponse.json({ success: true });
            }
        } else {
            // Create new
            const newTestimonial = {
                id: testimonials.length > 0 ? Math.max(...testimonials.map((t: any) => t.id)) + 1 : 1,
                name: body.name,
                role: body.role || 'Client',
                review: body.review,
                rating: body.rating || 5,
                approved: body.isAdmin ? true : false // Auto-approve if admin adds it, otherwise pending
            };

            testimonials.push(newTestimonial);
            await fs.writeFile(dataFilePath, JSON.stringify(testimonials, null, 2));
            return NextResponse.json(newTestimonial);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error("Error writing testimonials file:", error);
        return NextResponse.json({ error: 'Failed to save testimonial' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        let testimonials = JSON.parse(fileContents);

        testimonials = testimonials.filter((t: any) => t.id !== id);

        await fs.writeFile(dataFilePath, JSON.stringify(testimonials, null, 2));
        return NextResponse.json({ success: true, testimonials });
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        return NextResponse.json({ error: 'Failed to delete testimonial' }, { status: 500 });
    }
}
