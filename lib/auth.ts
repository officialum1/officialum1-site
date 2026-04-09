import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Security: Require ADMIN_PASSWORD from environment (no fallback)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.warn("WARNING: ADMIN_PASSWORD not set in environment variables!");
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    return token?.value === 'authenticated_session_v1';
}

export function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
