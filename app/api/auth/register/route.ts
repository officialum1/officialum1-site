import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'data', 'users.json');

export async function POST(req: Request) {
    try {
        const { email, password, telegram } = await req.json();

        // 1. Validation
        if (!email || !password) return NextResponse.json({ error: "Email/Pass required" }, { status: 400 });

        // 2. Load Users
        let users = [];
        try {
            const content = await fs.readFile(USERS_PATH, 'utf8');
            users = JSON.parse(content);
        } catch { }

        // 3. User Exists?
        if (users.find((u: any) => u.email === email)) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // 4. Create User (Simple plain text for MVP, should be hashed in prod)
        const newUser = { id: Date.now().toString(), email, password, telegram: telegram || '' }; // In real app: hash password
        users.push(newUser);
        await fs.writeFile(USERS_PATH, JSON.stringify(users, null, 2));

        return NextResponse.json({ success: true, userId: newUser.id });

    } catch (e) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
