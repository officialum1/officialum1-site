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
    const orgTypes = ["Organization", "Corporation", "ProfessionalService"];
    const org: Record<string, unknown> = {
      "@type": orgTypes,
      "@id": ORG_ID,
      name: kp.org_name || "OfficialUM1",
      alternateName: ["OfficialUM1 LLC", "Official UM1", "Officialum1", "officialum1.com"],
      legalName: kp.legal_name || "OfficialUM1 LLC",
      description: kp.description,
      url: SITE_URL,
      foundingDate: kp.founding_date || "2021",
      foundingLocation: {
        "@type": "Place",
        name: "Sahiwal, Punjab, Pakistan",
      },
      email: kp.email || "hello@officialum1.com",
      telephone: kp.phone || "+923237102924",
      priceRange: kp.price_range || "$$",
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/icon.jpg`,
        contentUrl: `${SITE_URL}/icon.jpg`,
        caption: "OfficialUM1 Official Logo",
        width: 512,
        height: 512,
      },
      image: { "@id": `${SITE_URL}/#logo` },
      address: {
        "@type": "PostalAddress",
        streetAddress: kp.street || "Sahiwal",
        addressLocality: kp.city || "Sahiwal",
        addressRegion: kp.region || "Punjab",
        postalCode: kp.postal_code || "57000",
        addressCountry: kp.country || "PK",
      },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: kp.phone || "+923237102924",
          contactType: "customer service",
          email: kp.email || "hello@officialum1.com",
          areaServed: ["PK", "US", "GB", "AE", "CA", "Worldwide"],
          availableLanguage: ["English", "Urdu"],
        },
      ],
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
      name: kp.founder_name || "Muhammad Umar Mumtaz",
      jobTitle: kp.founder_title || "Founder & CEO",
      url: `${SITE_URL}/about`,
      image: `${SITE_URL}/icon.jpg`,
      sameAs: [
        "https://github.com/officialum1",
        "https://x.com/officialum1",
        "https://twitter.com/officialum1",
        "https://linkedin.com/company/officialum1",
      ],
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
