import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isAuthenticated } from '@/lib/auth';

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily"];
const lastInitials = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J.", "K.", "L.", "M.", "N.", "P.", "R.", "S.", "T.", "W."];

const genericReviews = [
    "Amazing service! Delivered exactly as described.",
    "Very fast delivery, I was surprised.",
    "High quality accounts, will definitely buy again.",
    "Support was very helpful when I had a question.",
    "Best prices I've found for this quality.",
    "Legit seller. Everything works perfectly.",
    "Saved me so much time. Highly recommend!",
    "Smooth transaction and instant access.",
    "Five stars! exceeded my expectations.",
    "Simple, fast, and reliable. Thanks OfficialUM1!",
    "The accounts are very good quality, aged nicely.",
    "Great communication from the team.",
    "Works great, no issues at all so far.",
    "Reliable vendor, I have bought multiple times.",
    "Good value for money."
];

export async function POST(req: Request) {
    if (!await isAuthenticated()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { count = 1, productNames = [] } = await req.json();

        // Fetch products if names not provided
        let products: any[] = [];
        if (productNames.length === 0) {
            products = await query("SELECT name FROM products") as any[];
        } else {
            products = productNames.map((n: string) => ({ name: n }));
        }

        if (products.length === 0) {
            products = [{ name: "Premium Service" }, { name: "Social Boost" }];
        }

        let addedCount = 0;

        for (let i = 0; i < count; i++) {
            const randomName = firstNames[Math.floor(Math.random() * firstNames.length)] + " " + lastInitials[Math.floor(Math.random() * lastInitials.length)];
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            const randomReview = genericReviews[Math.floor(Math.random() * genericReviews.length)];

            // Randomly customize review
            const customizedReview = Math.random() > 0.5
                ? randomReview.replace("service", randomProduct.name).replace("accounts", randomProduct.name)
                : randomReview;

            await query(
                "INSERT INTO testimonials (name, role, review, rating, approved) VALUES (?, ?, ?, ?, ?)",
                [randomName, `Buyer - ${randomProduct.name}`, customizedReview, 5, true]
            );
            addedCount++;
        }

        return NextResponse.json({ success: true, message: `Added ${addedCount} reviews.` });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
