import type { RankMathConfig } from "@/lib/rank-math-config";
import { ORG_ID, SITE_URL, WEBSITE_ID } from "@/lib/seo";

const FOUNDER_ID = `${SITE_URL}/#founder`;

function splitList(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function sameAsLinks(config: RankMathConfig): string[] {
  const links = [
    config.social.facebook_url,
    config.social.instagram_url,
    config.social.linkedin_url,
    config.social.youtube_url,
    config.social.pinterest_url,
    ...splitList(config.social.extra_same_as),
  ].filter(Boolean);
  return Array.from(new Set(links));
}

export function buildRankMathOrganizationGraph(config: RankMathConfig) {
  const kp = config.knowledge_panel;
  const graph: Record<string, unknown>[] = [];

  if (config.schema.enable_organization || config.schema.enable_local_business) {
    const orgType = config.schema.enable_local_business ? "LocalBusiness" : kp.org_type;
    const org: Record<string, unknown> = {
      "@type": orgType,
      "@id": ORG_ID,
      name: kp.org_name,
      legalName: kp.legal_name,
      description: kp.description,
      url: kp.url,
      foundingDate: kp.founding_date,
      email: kp.email,
      telephone: kp.phone,
      priceRange: kp.price_range,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: kp.logo_url,
        contentUrl: kp.logo_url,
      },
      image: { "@id": `${SITE_URL}/#logo` },
      address: {
        "@type": "PostalAddress",
        streetAddress: kp.street,
        addressLocality: kp.city,
        addressRegion: kp.region,
        postalCode: kp.postal_code,
        addressCountry: kp.country,
      },
      areaServed: splitList(kp.area_served),
      knowsAbout: splitList(kp.knows_about),
      sameAs: sameAsLinks(config),
    };

    if (kp.latitude && kp.longitude) {
      org.geo = {
        "@type": "GeoCoordinates",
        latitude: kp.latitude,
        longitude: kp.longitude,
      };
    }

    if (config.schema.enable_person) {
      org.founder = { "@id": FOUNDER_ID };
    }

    graph.push(org);
  }

  if (config.schema.enable_person) {
    graph.push({
      "@type": "Person",
      "@id": FOUNDER_ID,
      name: kp.founder_name,
      jobTitle: kp.founder_title,
      url: kp.founder_url,
      image: kp.founder_image,
      worksFor: { "@id": ORG_ID },
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export function buildRankMathWebsiteSchema(config: RankMathConfig) {
  if (!config.schema.enable_website) return null;

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: config.general.site_name,
    description: config.general.tagline,
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/shop?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
