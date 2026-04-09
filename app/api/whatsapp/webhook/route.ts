import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // The verify token matches the one you will set in the WhatsApp Cloud API Portal
    if (mode === "subscribe" && token === "officialum1_whatsapp_webhook") {
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    const value = change.value;
                    if (value.messages && value.messages[0]) {
                        const message = value.messages[0];
                        const contact = value.contacts?.[0];
                        
                        const phone = message.from;
                        const name = contact?.profile?.name || "Unknown";
                        const text = message.text?.body || "";
                        const messageId = message.id;

                        // Insert the incoming message into the database
                        await query(
                            "INSERT INTO whatsapp_messages (message_id, sender_phone, sender_name, message_text, direction) VALUES (?, ?, ?, ?, 'inbound') ON DUPLICATE KEY UPDATE message_text = VALUES(message_text)",
                            [messageId, phone, name, text]
                        );
                    }
                }
            }
        }

        return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } catch (e) {
        console.error("WhatsApp Webhook Error:", e);
        return new NextResponse("Error", { status: 500 });
    }
}
