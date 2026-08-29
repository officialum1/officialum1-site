import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildLinkHeader, homepageMarkdown } from '@/lib/agent-readiness/config';

const ALLOWED_API_ORIGINS = new Set([
    'http://127.0.0.1:4173',
    'http://localhost:4173',
    'https://officialum1.com',
    'https://www.officialum1.com',
]);

function applyCorsHeaders(request: NextRequest, response: NextResponse) {
    const origin = request.headers.get('origin');
    if (!origin || !ALLOWED_API_ORIGINS.has(origin)) return response;

    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-Admin-Password, PAYMENT-SIGNATURE, X-PAYMENT');
    response.headers.set('Vary', 'Origin');

    return response;
}

function wantsMarkdown(request: NextRequest): boolean {
    const accept = request.headers.get('accept') || '';
    return accept.includes('text/markdown');
}

function estimateTokens(text: string): string {
    return String(Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3));
}

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    if (path === '/' && wantsMarkdown(request)) {
        const md = homepageMarkdown();
        return new NextResponse(md, {
            status: 200,
            headers: {
                'Content-Type': 'text/markdown; charset=utf-8',
                'Link': buildLinkHeader(),
                'x-markdown-tokens': estimateTokens(md),
                'Vary': 'Accept',
            },
        });
    }

    if (path.startsWith('/api/')) {
        if (request.method === 'OPTIONS') {
            return applyCorsHeaders(request, new NextResponse(null, { status: 204 }));
        }

        return applyCorsHeaders(request, NextResponse.next());
    }

    if ((path.startsWith('/admin') && !path.startsWith('/admin/login')) || path.startsWith('/hr')) {
        const adminSession = request.cookies.get('admin_session');
        const adminToken = request.cookies.get('admin_token');

        const hasAdminSession = adminSession?.value === 'true' || adminToken?.value === 'authenticated_session_v1';

        if (!hasAdminSession) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    if (path === '/') {
        const response = NextResponse.next();
        response.headers.set('Link', buildLinkHeader());
        response.headers.set('Vary', 'Accept');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
