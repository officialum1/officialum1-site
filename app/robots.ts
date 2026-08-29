import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/wishlist",
          "/dashboard/",
          "/login",
          "/register",
          "/forgot-password",
          "/verify-email",
          "/verify",
          "/my-orders",
          "/order-success",
          "/staff/",
          "/delivery/",
        ],
      },
    ],
    sitemap: "https://officialum1.com/sitemap.xml",
    host: "https://officialum1.com",
  };
}
