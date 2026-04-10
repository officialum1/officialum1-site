import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Security: Require ADMIN_PASSWORD from environment (no fallback)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.warn("WARNING: ADMIN_PASSWORD not set in environment variables!");
}

// Session secret derived from ADMIN_PASSWORD or a dedicated env var
const SESSION_SECRET = process.env.SESSION_SECRET || ADMIN_PASSWORD || 'fallback-change-this-in-production';

/**
 * Creates a signed session token.
 * Format: randomHex.hmacSignature
 */
export function createSessionToken(): string {
    const payload = crypto.randomBytes(32).toString('hex');
    const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    return `${payload}.${signature}`;
}

/**
 * Validates a signed session token.
 */
function isValidSessionToken(token: string): boolean {
    if (!token || !token.includes('.')) return false;
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
    // Timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
    } catch {
        return false;
    }
}

/**
 * Sets the admin session cookie (call from login routes).
 */
export async function setAdminSession(): Promise<string> {
    const token = createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    // Also set the middleware cookie so page-level protection works
    cookieStore.set('admin_session', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
    });
    return token;
}

export async function isAuthenticated() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    if (!token?.value) return false;
    return isValidSessionToken(token.value);
}

export function jsonResponse(data: any, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}
