import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

const dataFilePath = path.join(process.cwd(), 'data', 'services.json');

export async function GET() {
    try {
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContents);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error reading services file:", error);
        return NextResponse.json([], { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const service = await request.json();
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        const services = JSON.parse(fileContents);

        // Check if we are updating an existing service or adding a new one
        if (service.id) {
            // Update existing
            const index = services.findIndex((s: any) => s.id === service.id);
            if (index !== -1) {
                services[index] = service;
            } else {
                // Treat as new if ID not found (shouldn't happen with correct logic)
                services.push(service);
            }
        } else {
            // Add new
            const newService = {
                ...service,
                id: services.length > 0 ? Math.max(...services.map((s: any) => s.id)) + 1 : 1,
            };
            services.push(newService);
        }

        await fs.writeFile(dataFilePath, JSON.stringify(services, null, 2));
        return NextResponse.json({ success: true, services });
    } catch (error) {
        console.error("Error writing services file:", error);
        return NextResponse.json({ error: 'Failed to save service' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();
        const fileContents = await fs.readFile(dataFilePath, 'utf8');
        let services = JSON.parse(fileContents);

        services = services.filter((s: any) => s.id !== id);

        await fs.writeFile(dataFilePath, JSON.stringify(services, null, 2));
        return NextResponse.json({ success: true, services });
    } catch (error) {
        console.error("Error deleting service:", error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
