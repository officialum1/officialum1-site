import type { Metadata } from "next";
import ShopPageClient from "@/components/ShopPageClient";
import { getShopProducts } from "@/lib/shop-products";
import {
  SITE_URL,
  breadcrumbJsonLd,
  pageMetadata,
  shopItemListJsonLd,
  webPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

const title = "Shop — Premium Digital Assets | OfficialUM1";
const description =
  "Buy verified digital products and accounts with instant delivery. Browse OfficialUM1’s catalogue by platform, compare prices, and checkout securely.";

export const metadata: Metadata = pageMetadata({
  path: "/shop",
  title,
  description,
  keywords:
    "buy digital accounts, game accounts for sale, digital products Pakistan, OfficialUM1 shop, instant delivery",
});

export default async function ShopPage() {
  const products = await getShopProducts();

  const collectionPage = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/shop#collection`,
    url: `${SITE_URL}/shop`,
    name: title,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    mainEntity: { "@id": `${SITE_URL}/shop#itemlist` },
  };

  const itemList = { ...shopItemListJsonLd(products), "@id": `${SITE_URL}/shop#itemlist` };
  const crumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
  ]);

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      webPageJsonLd({
        path: "/shop",
        name: title,
        description,
        type: "WebPage",
      }),
      collectionPage,
      itemList,
      crumbs,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
      <ShopPageClient initialProducts={products} />
    </>
  );
}
