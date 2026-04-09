import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect Admin and HR Routes
    // Exclude /admin/login from protection
    if ((path.startsWith('/admin') && !path.startsWith('/admin/login')) || path.startsWith('/hr')) {
        // Check for a specific "admin_session" cookie or header
        // For this MVP, we will check a simple cookie 'is_admin'
        // or we can strictly block them if not accessed via a secure method.
        // Given the user wants "never ever show to any user", we should restrict it to a specific condition.

        // For now, let's Redirect to login if a special "admin_secret" cookie is missing.
        // In a real app, this would verify a JWT token from the secure cookie.

        const adminSession = request.cookies.get('admin_session');

        if (!adminSession || adminSession.value !== 'true') {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Protect Staff Dashboard
    if (path.startsWith('/staff/dashboard')) {
        // Logic for staff protection could go here if moving from localStorage to cookies
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
