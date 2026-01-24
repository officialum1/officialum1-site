import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
    try {
        const { token } = await context.params;

        const deliveriesFile = path.join(process.cwd(), 'data', 'deliveries.json');
        if (!fs.existsSync(deliveriesFile)) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const deliveries = JSON.parse(fs.readFileSync(deliveriesFile, 'utf8'));
        const order = deliveries.find((d: any) => d.token === token);

        if (!order) {
            return NextResponse.json({ error: 'Invalid Link' }, { status: 404 });
        }

        // Increment Views
        order.views = (order.views || 0) + 1;
        fs.writeFileSync(deliveriesFile, JSON.stringify(deliveries, null, 2));

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
