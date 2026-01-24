import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        // 1. Fetch In-Stock Inventory
        const items: any = await query("SELECT * FROM inventory WHERE status = 'In Stock'");

        // 2. Group items by Name to create "Products"
        const productMap: any = {};

        items.forEach((item: any) => {
            // Normalize name to group accurately
            const key = item.name.trim();

            if (!productMap[key]) {
                productMap[key] = {
                    id: `prod_${key.replace(/\s+/g, '_')}`, // Virtual Product ID
                    name: key,
                    platform: item.platform,
                    // Use purchasePrice as Price for now (User can edit this logic later if needed)
                    price: `$${Number(item.purchasePrice || 0).toFixed(2)}`,
                    rawPrice: Number(item.purchasePrice || 0),
                    description: `Instant Delivery. Verified ${item.platform} Account.`,
                    // Dynamic Image Placeholder
                    image: `https://ui-avatars.com/api/?name=${item.platform}&background=random&color=fff&size=128`,
                    stock: 0,
                    type: 'Auto-Delivery'
                };
            }
            productMap[key].stock++;
        });

        const products = Object.values(productMap);

        // Sort by Stock or Price
        products.sort((a: any, b: any) => b.stock - a.stock);

        return NextResponse.json(products);
    } catch (e: any) {
        console.error("Shop API Error:", e.message);
        return NextResponse.json([], { status: 500 });
    }
}

// POST not needed for public shop (only Admin adds)
export async function POST() {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
