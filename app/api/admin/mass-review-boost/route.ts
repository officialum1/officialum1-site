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
    "Simple, fast, and secure. Best in the business.",
    "Fantastic experience. The account was delivered within seconds.",
    "Very impressed with the level of professionalism.",
    "If you're on the fence, just buy it. Totally worth it.",
    "Reliable and consistent. Never had a problem.",
    "The best prices I've found online."
];

export async function POST(request: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const { reviewsPerProduct = 10 } = body;

        // 1. Get all products
        const products = await query("SELECT id FROM products") as any[];

        // 2. Get all users to pick random buyers from
        const users = await query("SELECT id FROM users WHERE role = 'buyer' LIMIT 500") as any[];

        let totalAdded = 0;

        for (const product of products) {
            for (let i = 0; i < reviewsPerProduct; i++) {
                const randomReview = positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
                const randomRating = Math.random() > 0.1 ? 5 : 4; // 90% 5 stars

                let dummyUserId;
                if (users.length > 0) {
                    dummyUserId = users[Math.floor(Math.random() * users.length)].id;
                } else {
                    dummyUserId = `gen_cat_${Math.random().toString(36).substring(7)}`;
                }

                const randomDate = new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 60); // Last 60 days
                const orderId = `ord_auto_${Math.random().toString(36).substring(7)}`;

                // Insert Review
                await query(
                    "INSERT INTO reviews (product_id, user_id, rating, comment, status, created_at) VALUES (?, ?, ?, ?, 'approved', ?)",
                    [product.id, dummyUserId, randomRating, randomReview, randomDate]
                );

                // Insert Dummy Order for "Verified Purchase"
                await query(
                    "INSERT INTO orders (orderId, userId, productId, amount, status, date) VALUES (?, ?, ?, ?, 'completed', ?)",
                    [orderId, dummyUserId, product.id.toString(), '0.00', 'completed', randomDate]
                );

                totalAdded++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Successfully boosted store with ${totalAdded} reviews across ${products.length} products.`
        });

    } catch (e: any) {
        console.error("Auto Boost Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
