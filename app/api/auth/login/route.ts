import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const content = await fs.readFile(USERS_PATH, 'utf8');
        const users = JSON.parse(content);
        const user = users.find((u: any) => u.email === email && u.password === password);

        if (user) {
            // Return simple user object (mock session)
            return NextResponse.json({ success: true, user: { id: user.id, email: user.email, telegram: user.telegram } });
        } else {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: "Auth Error" }, { status: 500 });
    }
}
