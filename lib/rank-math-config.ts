import { SITE_URL } from "@/lib/seo";

export const RANK_MATH_SETTINGS_KEY = "rank_math_settings";

export type RankMathConfig = {
  general: {
    site_name: string;
    tagline: string;
    separator: string;
    homepage_title: string;
    homepage_description: string;
    homepage_keywords: string;
    default_robots: string;
  };
  knowledge_panel: {
    org_type: "Organization" | "ProfessionalService" | "LocalBusiness";
    org_name: string;
    legal_name: string;
    description: string;
    url: string;
    logo_url: string;
    founder_name: string;
    founder_title: string;
    founder_url: string;
    founder_image: string;
    founding_date: string;
    email: string;
    phone: string;
    price_range: string;
    street: string;
    city: string;
    region: string;
    postal_code: string;
    country: string;
    latitude: string;
    longitude: string;
    area_served: string;
    knows_about: string;
  };
  social: {
    twitter_handle: string;
    facebook_url: string;
    instagram_url: string;
    linkedin_url: string;
    youtube_url: string;
    pinterest_url: string;
    extra_same_as: string;
  };
  schema: {
    enable_organization: boolean;
    enable_website: boolean;
    enable_person: boolean;
    enable_breadcrumbs: boolean;
    enable_faq: boolean;
    enable_article: boolean;
    enable_product: boolean;
    enable_local_business: boolean;
  };
  titles: {
    post_title_template: string;
    page_title_template: string;
    product_title_template: string;
    category_title_template: string;
    post_description_template: string;
  };
  sitemap: {
    enable: boolean;
    include_products: boolean;
    include_posts: boolean;
    include_pages: boolean;
    homepage_priority: string;
  };
  webmaster: {
    google_verification: string;
    bing_verification: string;
    yandex_verification: string;
    pinterest_verification: string;
  };
  advanced: {
    noindex_paths: string;
    global_keywords: string;
    og_default_image: string;
  };
};

export const DEFAULT_RANK_MATH_CONFIG: RankMathConfig = {
  general: {
    site_name: "OfficialUM1",
    tagline: "Digital Marketing Agency in Sahiwal | SEO & Web Development",
    separator: "|",
    homepage_title: "Digital Marketing Agency in Sahiwal | SEO & Web Dev | OfficialUM1",
    homepage_description:
      "OfficialUM1 is the premier digital marketing agency in Sahiwal, Pakistan. We deliver high-ranking SEO, custom web development, guest posting, and social media growth.",
    homepage_keywords:
      "digital marketing agency sahiwal, digital marketing agency in sahiwal, SEO agency sahiwal, web development agency sahiwal, best digital marketing agency in sahiwal, OfficialUM1",
    default_robots: "index,follow",
  },
  knowledge_panel: {
    org_type: "ProfessionalService",
    org_name: "OfficialUM1",
    legal_name: "OfficialUM1 LLC",
    description:
      "OfficialUM1 is a premier US & Pakistan registered digital marketing agency and software engineering firm specializing in SEO, custom Next.js web development, WordPress speed optimization, and digital PR.",
    url: SITE_URL,
    logo_url: `${SITE_URL}/icon.jpg`,
    founder_name: "Muhammad Umar Mumtaz",
    founder_title: "Founder & CEO",
    founder_url: `${SITE_URL}/about`,
    founder_image: `${SITE_URL}/icon.jpg`,
    founding_date: "2021",
    email: "hello@officialum1.com",
    phone: "+923237102924",
    price_range: "$$",
    street: "Sahiwal",
    city: "Sahiwal",
    region: "Punjab",
    postal_code: "57000",
    country: "PK",
    latitude: "30.6682",
    longitude: "73.1064",
    area_served: "Sahiwal, Punjab, Pakistan, United States, United Kingdom, Worldwide",
    knows_about:
      "Digital Marketing, Search Engine Optimization, Technical SEO, Next.js Web Development, Headless Architecture, Guest Posting, Link Building, Core Web Vitals, Conversion Rate Optimization",
  },
  social: {
    twitter_handle: "@officialum1",
    facebook_url: "https://www.facebook.com/officialum1",
    instagram_url: "https://instagram.com/officialum1",
    linkedin_url: "https://linkedin.com/company/officialum1",
    youtube_url: "",
    pinterest_url: "",
    extra_same_as: "https://www.trustpilot.com/review/officialum1.com\nhttps://github.com/officialum1\nhttps://x.com/officialum1\nhttps://twitter.com/officialum1\nhttps://clutch.co/profile/officialum1\nhttps://www.reddit.com/r/officialum1/",
  },
  schema: {
    enable_organization: true,
    enable_website: true,
    enable_person: true,
    enable_breadcrumbs: true,
    enable_faq: true,
    enable_article: true,
    enable_product: true,
    enable_local_business: true,
  },
  titles: {
    post_title_template: "%title% %sep% %sitename%",
    page_title_template: "%title% %sep% %sitename%",
    product_title_template: "%title% %sep% Buy Instantly %sep% %sitename%",
    category_title_template: "%title% %sep% %sitename%",
    post_description_template: "%excerpt%",
  },
  sitemap: {
    enable: true,
    include_products: true,
    include_posts: true,
    include_pages: true,
    homepage_priority: "1.0",
  },
  webmaster: {
    google_verification: "",
    bing_verification: "",
    yandex_verification: "",
    pinterest_verification: "",
  },
  advanced: {
    noindex_paths: "/admin\n/api\n/login\n/register\n/checkout\n/dashboard",
    global_keywords: "OfficialUM1, SEO, digital marketing, web development",
    og_default_image: "/logo.jpg",
  },
};

function mergeSection<T extends Record<string, unknown>>(defaults: T, incoming?: Partial<T>): T {
  return { ...defaults, ...(incoming || {}) } as T;
}

export function parseRankMathConfig(raw: unknown): RankMathConfig {
  if (!raw) return { ...DEFAULT_RANK_MATH_CONFIG };

  let parsed: Partial<RankMathConfig> = {};
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return { ...DEFAULT_RANK_MATH_CONFIG };
    }
  } else if (typeof raw === "object") {
    parsed = raw as Partial<RankMathConfig>;
  }

  return {
    general: mergeSection(DEFAULT_RANK_MATH_CONFIG.general, parsed.general),
    knowledge_panel: mergeSection(DEFAULT_RANK_MATH_CONFIG.knowledge_panel, parsed.knowledge_panel),
    social: mergeSection(DEFAULT_RANK_MATH_CONFIG.social, parsed.social),
    schema: mergeSection(DEFAULT_RANK_MATH_CONFIG.schema, parsed.schema),
    titles: mergeSection(DEFAULT_RANK_MATH_CONFIG.titles, parsed.titles),
    sitemap: mergeSection(DEFAULT_RANK_MATH_CONFIG.sitemap, parsed.sitemap),
    webmaster: mergeSection(DEFAULT_RANK_MATH_CONFIG.webmaster, parsed.webmaster),
    advanced: mergeSection(DEFAULT_RANK_MATH_CONFIG.advanced, parsed.advanced),
  };
}

export function applyTitleTemplate(
  template: string,
  vars: Record<string, string | undefined>,
  separator = "|"
): string {
  const sep = vars.sep || separator;
  return template
    .replace(/%title%/gi, vars.title || "")
    .replace(/%sitename%/gi, vars.sitename || "OfficialUM1")
    .replace(/%sep%/gi, sep)
    .replace(/%excerpt%/gi, vars.excerpt || "")
    .replace(/%category%/gi, vars.category || "")
    .replace(/\s+/g, " ")
    .trim();
}

export function rankMathSeoScore(config: RankMathConfig): number {
  let score = 0;
  const kp = config.knowledge_panel;
  if (kp.org_name) score += 8;
  if (kp.description.length > 80) score += 8;
  if (kp.phone) score += 8;
  if (kp.email) score += 6;
  if (kp.logo_url) score += 8;
  if (kp.founder_name) score += 8;
  if (kp.latitude && kp.longitude) score += 6;
  if (config.social.linkedin_url) score += 5;
  if (config.social.twitter_handle) score += 5;
  if (config.general.homepage_title.length <= 60) score += 8;
  if (config.general.homepage_description.length >= 120) score += 8;
  if (config.webmaster.google_verification) score += 6;
  if (config.schema.enable_organization) score += 8;
  if (config.schema.enable_person) score += 8;
  return Math.min(100, score);
}
