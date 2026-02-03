import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { fulfillOrder } from '@/lib/payment';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const payload = await req.text();
    const sig = req.headers.get('stripe-signature');

    // Get Secret from DB
    const settingsRows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'stripeSecret'");
    const stripeSecret = settingsRows[0]?.setting_value;

    // Get Webhook Secret from DB
    const webhookSecretRows: any = await query("SELECT setting_value FROM settings WHERE setting_key = 'stripeWebhookSecret'");
    const webhookSecret = webhookSecretRows[0]?.setting_value;

    if (!stripeSecret) return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });

    const stripe = new Stripe(stripeSecret, { apiVersion: '2025-01-27' as any });

    let event;

    try {
        if (webhookSecret && sig) {
            event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        } else {
            console.error("Missing Stripe Webhook Secret or Signature");
            return NextResponse.json({ error: "Unauthorized: Missing Webhook Secret" }, { status: 401 });
        }
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.success_url?.split('orderId=')[1]?.split('&')[0] || session.metadata?.orderId;

        console.log(`[Stripe Webhook] Session completed: ${session.id}, Order: ${orderId}`);

        if (orderId) {
            await fulfillOrder(orderId);
        }
    }

    return NextResponse.json({ received: true });
}
