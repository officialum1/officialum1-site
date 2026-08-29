import { query } from "@/lib/db";

/** Same product list as GET /api/products — for SSR + JSON-LD on /shop */
export async function getShopProducts(): Promise<any[]> {
  try {
    const products = await query(`
            SELECT p.*, 
            c.name as categoryName, c.icon as categoryIcon, c.discount_percent as categoryDiscount, c.is_vip_only as isVipOnly,
            IFNULL(i_counts.stock_count, 0) as inventoryStock
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN (
                SELECT platform, name, COUNT(*) as stock_count 
                FROM inventory 
                WHERE status = 'In Stock' 
                GROUP BY platform, name
            ) i_counts ON (i_counts.platform = p.platform OR i_counts.name = p.name)
            ORDER BY p.id DESC
        `);
    return Array.isArray(products) ? products : [];
  } catch {
    return [];
  }
}
