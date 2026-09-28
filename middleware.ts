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
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || request.nextUrl.hostname || '';
    const isShopSubdomain = host.startsWith('shop.') || host.startsWith('shop.localhost');
    const isProduction = !host.includes('localhost') && !host.includes('127.0.0.1');
    const mainOrigin = isProduction ? 'https://officialum1.com' : 'http://localhost:3000';
    const shopOrigin = isProduction ? 'https://shop.officialum1.com' : 'http://shop.localhost:3000';

    // 1. Subdomain Routing Logic
    if (isShopSubdomain) {
        if (path === '/') {
            const shopUrl = new URL('/shop', request.url);
            return NextResponse.rewrite(shopUrl);
        }
        if (path === '/shop') {
            return NextResponse.redirect(new URL('/', request.url));
        }

        const isShopRoute = 
            path.startsWith('/product') || 
            path.startsWith('/checkout') || 
            path.startsWith('/cart') || 
            path.startsWith('/order-success') || 
            path.startsWith('/api') || 
            path.startsWith('/_next') ||
            path.includes('.');

        // If user on shop.officialum1.com clicks an agency page (Services, Blog, Reviews, etc.), redirect to main domain
        if (!isShopRoute) {
            const targetUrl = new URL(`${mainOrigin}${path}${request.nextUrl.search}`);
            return NextResponse.redirect(targetUrl);
        }
    } else {
        // If user on officialum1.com navigates to /shop, redirect to dedicated shop subdomain in production
        if (isProduction && (path === '/shop' || path.startsWith('/shop/'))) {
            const targetUrl = new URL(`${shopOrigin}${path === '/shop' ? '/' : path.replace(/^\/shop/, '')}${request.nextUrl.search}`);
            return NextResponse.redirect(targetUrl);
        }
    }

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
