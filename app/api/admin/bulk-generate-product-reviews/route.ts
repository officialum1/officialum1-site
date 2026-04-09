import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Nicole", "Jessica", "Amanda", "Mark", "Steven", "Paul", "Kevin", "Brian", "Eric"];
const lastInitials = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J.", "K.", "L.", "M.", "N.", "P.", "R.", "S.", "T.", "W.", "Z.", "V.", "M."];

const positiveReviews = [
    "Absolutely amazing! Exactly what I was looking for.",
    "Fast delivery and the quality is top-notch. Highly recommend.",
    "Best service ever. I've been a customer for months and never disappointed.",
    "Works perfectly. No issues at all.",
    "Surpassed my expectations. Great value for money.",
    "The support team was so helpful with my questions.",
    "Instant delivery and reliable accounts. 5 stars!",
    "OfficialUM1 is the only place I trust for these services.",
    "Very smooth transaction. Will definitely buy again.",
    "High quality and very affordable. Thank you!",
    "Everything was as described. Very happy with the purchase.",
    "Great communication and fast results.",
    "Legit and safe. Don't hesitate to buy.",
    "Saved me so much time and effort. Excellent!",
    "Simple, fast, and secure. Best in the business."
];

export async function POST(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { productIds, count = 5 } = body;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return NextResponse.json({ error: "Product IDs are required" }, { status: 400 });
        }

        // We'll use a dummy user ID for these reviews, or create a pool of dummy users
        // For simplicity, we'll use a fixed prefix for dummy users or just random strings

        let totalAdded = 0;

        for (const productId of productIds) {
            for (let i = 0; i < count; i++) {
                const randomName = firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastInitials[Math.floor(Math.random() * lastInitials.length)];
                const randomReview = positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
                const randomRating = Math.random() > 0.2 ? 5 : 4; // Mostly 5 stars, some 4 stars
                const dummyUserId = `ai_${Math.random().toString(36).substring(7)}`;
                const randomDate = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30);
                const orderId = `ord_${Math.random().toString(36).substring(7)}`;

                // We need an email for the user join in ReviewsSection
                // We'll insert a dummy user if needed, or just insert into reviews if foreign key allows
                // Looking at DB schema, there is no hard FK on user_id in reviews table in lib/db.ts

                // 1. Insert Review
                await query(
                    "INSERT INTO reviews (product_id, user_id, rating, comment, status, created_at) VALUES (?, ?, ?, ?, 'approved', ?)",
                    [productId, dummyUserId, randomRating, randomReview, randomDate]
                );

                // 2. Insert Dummy Order to trigger "Verified Purchase" badge
                await query(
                    "INSERT INTO orders (orderId, userId, productId, amount, status, date) VALUES (?, ?, ?, ?, 'completed', ?)",
                    [orderId, dummyUserId, productId.toString(), '0.00', 'completed', randomDate]
                );

                totalAdded++;
            }
        }

        return NextResponse.json({ success: true, message: `Successfully generated ${totalAdded} reviews.` });

    } catch (e: any) {
        console.error("Bulk Review Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
