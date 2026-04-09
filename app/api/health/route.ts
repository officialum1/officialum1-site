import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // Check database connection
        await query("SELECT 1");

        // Check required environment variables
        const missingVars = [];
        const requiredVars = [
            'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME',
            'ADMIN_PASSWORD',
            'G2G_API_KEY', 'G2G_SECRET_KEY', 'G2G_USER_ID',
            'ORDER_WEBHOOK_SECRET', 'OFFER_WEBHOOK_SECRET'
        ];

        for (const varName of requiredVars) {
            if (!process.env[varName]) {
                missingVars.push(varName);
            }
        }

        return NextResponse.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            missingEnvVars: missingVars.length > 0 ? missingVars : undefined,
            warnings: missingVars.length > 0 ? ['Some environment variables are not configured'] : []
        }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
