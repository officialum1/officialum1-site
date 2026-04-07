import { Router, type IRouter } from "express";
import { db, servicesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/services", async (_req, res): Promise<void> => {
  const services = await db.select().from(servicesTable);
  const typedServices = services as typeof servicesTable.$inferSelect[];
  res.json(typedServices.map((s: typeof servicesTable.$inferSelect) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    icon: s.icon,
    price: s.price != null ? Number(s.price) : null,
    priceLabel: s.priceLabel,
    features: (s.features as string[]) ?? [],
    popular: s.popular,
  })));
});

export default router;
