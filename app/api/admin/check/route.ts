import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');

    if (token?.value === 'authenticated_session_v1') {
        return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
}
