import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { isAuthenticated } from "@/lib/auth";
import { ensureSeoColumns } from "@/lib/seo-db";

const GEMINI_BLOG_MODEL = "gemini-2.5-flash";
const OPENAI_BLOG_MODEL = "gpt-4o-mini";
const DEFAULT_BLOG_IMAGE =
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80";

const FALLBACK_TOPICS = [
  {
    title: "How Guest Posting Helps Build Real Search Authority",
    category: "SEO",
    template: `High-quality guest posting is still one of the strongest ways to build topical authority when it is done with relevance, editorial quality, and a clean link profile.

## Why Guest Posting Still Works
Search engines use links as trust signals, but not every link is equal. A contextual placement on a real website with real readers can support rankings, referral traffic, and brand trust.

## What Makes a Guest Post Safe
- A relevant niche website
- Human-written editorial content
- Natural anchor text
- Permanent placement where possible
- No spam networks or low-quality link farms

## How OfficialUM1 Helps
OfficialUM1 focuses on clean SEO execution: guest posting, backlink planning, technical SEO, and content strategy that supports long-term growth.

Ready to build authority with less guesswork? Explore our [guest posting services](/services/guest-posting).`,
  },
  {
    title: "Technical SEO Checklist for a Fast Business Website",
    category: "SEO",
    template: `A website can look polished and still struggle to rank if the technical foundation is weak. Technical SEO makes your site easier for search engines to crawl, understand, and trust.

## Core Areas to Review
- Page speed and Core Web Vitals
- Clean metadata and canonical tags
- Structured data where it matters
- Mobile layout and readable text
- Internal links and crawl paths

## Why It Matters
Good technical SEO improves both rankings and conversions. Visitors stay longer when pages load fast, content is readable, and calls to action are easy to find.

OfficialUM1 builds and audits websites with SEO, performance, and user experience working together from day one.`,
  },
  {
    title: "Why Founders Need a Conversion-Focused Website",
    category: "Web Development",
    template: `A business website is not only a digital brochure. It should explain the offer, build trust, and guide visitors toward an action.

## What Conversion-Focused Design Includes
- Clear headline and service positioning
- Fast mobile experience
- Visible proof and reviews
- Simple navigation
- Strong contact and quote paths

## The OfficialUM1 Approach
We build websites that combine clean UI, technical SEO, and fast performance so founders can turn traffic into leads.

If your website gets visits but not enough inquiries, it may need a better conversion path.`,
  },
];

const BLOG_JSON_SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "SEO-friendly article title under 75 characters.",
    },
    category: {
      type: "string",
      description: "One short category such as SEO, Link Building, Web Development, Digital Marketing, Local SEO.",
    },
    excerpt: {
      type: "string",
      description: "Short meta-style excerpt under 160 characters.",
    },
    content: {
      type: "string",
      description: "Full publish-ready Markdown article with headings, paragraphs, bullets, and a natural CTA.",
    },
    readTime: {
      type: "string",
      description: "Estimated reading time, for example 8 min.",
    },
    metaTitle: {
      type: "string",
      description: "SEO title under 60 characters.",
    },
    metaDescription: {
      type: "string",
      description: "SEO meta description under 155 characters.",
    },
  },
  required: ["title", "category", "excerpt", "content", "readTime", "metaTitle", "metaDescription"],
};

type GeneratedBlog = {
  title: string;
  category: string;
  excerpt: string;
  content: string;
  readTime: string;
  metaTitle?: string;
  metaDescription?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function cleanJsonText(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function parseGeneratedJson(text: string) {
  const cleaned = cleanJsonText(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI response was not valid JSON.");
    return JSON.parse(match[0]);
  }
}

function normalizeGeneratedBlog(generated: Partial<GeneratedBlog>, topic: string): GeneratedBlog {
  const title = generated.title?.trim() || topic.trim();
  const category = generated.category?.trim() || "SEO";
  const excerpt = generated.excerpt?.trim() || `A practical OfficialUM1 guide about ${topic}.`;
  const content = generated.content?.trim();
  const readTime = generated.readTime?.trim() || "8 min";

  if (!content || content.length < 500) {
    throw new Error("AI generated content was too short. Try a clearer topic.");
  }

  return {
    title,
    category,
    excerpt: excerpt.slice(0, 180),
    content,
    readTime,
    metaTitle: generated.metaTitle?.trim(),
    metaDescription: generated.metaDescription?.trim(),
  };
}

function buildBlogPrompt(topic: string, isGuestPost: boolean) {
  return `Write a publish-ready SEO ${isGuestPost ? "guest post" : "blog post"} for OfficialUM1 about: "${topic}".

Business context:
- OfficialUM1 offers SEO services, guest posting, backlink building, web development, digital marketing, social media growth, and business automation.
- Audience: founders, agencies, ecommerce owners, local businesses, and service businesses that want more organic visibility.

Content requirements:
- Write in clear professional English.
- Length target: 900 to 1300 words.
- Use Markdown only. Use ## and ### headings.
- Include practical advice, not generic filler.
- Naturally mention OfficialUM1 where relevant.
- Add one useful CTA near the end pointing users to /services or /contact.
- Avoid fake guarantees, fake statistics, keyword stuffing, and spammy language.
- Do not mention that an AI wrote the content.
${isGuestPost ? '- Guest post mode: include exactly one natural backlink to "https://officialum1.com" with a relevant anchor. Do not add more than one external backlink.' : ""}

Return only a JSON object with these keys:
title, category, excerpt, content, readTime, metaTitle, metaDescription.`;
}

async function loadAiSettings() {
  const settingsRes: any = await query(
    "SELECT * FROM settings WHERE setting_key IN ('openaiKey', 'geminiKey', 'marketing_ai_model')",
  );
  const settings: Record<string, string> = {};
  settingsRes.forEach((s: any) => {
    settings[s.setting_key] = s.setting_value;
  });

  return {
    openaiKey: settings.openaiKey || process.env.OPENAI_API_KEY,
    geminiKey: settings.geminiKey || process.env.GEMINI_API_KEY,
    preferredModel: settings.marketing_ai_model || "gemini",
  };
}

async function generateWithGemini(geminiKey: string, prompt: string) {
  const aiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_BLOG_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.72,
        topP: 0.9,
        responseFormat: {
          text: {
            mimeType: "application/json",
            schema: BLOG_JSON_SCHEMA,
          },
        },
      },
    }),
  });

  if (!aiRes.ok) {
    const errorData = await aiRes.json().catch(() => ({}));
    throw new Error(`Gemini Error: ${errorData.error?.message || aiRes.statusText}`);
  }

  const aiData = await aiRes.json();
  const text = aiData.candidates?.[0]?.content?.parts?.map((part: any) => part.text || "").join("") || "";
  if (!text) throw new Error("Gemini returned an empty response.");

  return parseGeneratedJson(text);
}

async function generateWithOpenAI(openaiKey: string, prompt: string) {
  const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_BLOG_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are OfficialUM1's SEO content strategist. Return only valid JSON. No markdown fences around the JSON object.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.72,
    }),
  });

  if (!aiRes.ok) {
    const errorData = await aiRes.json().catch(() => ({}));
    throw new Error(`OpenAI Error: ${errorData.error?.message || aiRes.statusText}`);
  }

  const aiData = await aiRes.json();
  const text = aiData.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("OpenAI returned an empty response.");

  return parseGeneratedJson(text);
}

async function insertBlogPost(blog: GeneratedBlog, author = "AI Content Writer") {
  await ensureSeoColumns();

  const slug = slugify(blog.title);
  const exists: any = await query("SELECT id FROM blogs WHERE slug = ?", [slug]);

  if (exists.length > 0) {
    return { inserted: false, error: "A blog with this title already exists." };
  }

  const result: any = await query(
    `INSERT INTO blogs (
      title, slug, category, image, excerpt, content, read_time, author,
      meta_title, meta_description, focus_keyword, seo_keywords, robots, schema_type
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      blog.title,
      slug,
      blog.category,
      DEFAULT_BLOG_IMAGE,
      blog.excerpt,
      blog.content,
      blog.readTime,
      author,
      blog.metaTitle || blog.title,
      blog.metaDescription || blog.excerpt,
      blog.category,
      blog.category,
      "index,follow",
      "BlogPosting",
    ],
  );

  return { inserted: true, id: result.insertId, slug };
}

export async function GET() {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const topic = FALLBACK_TOPICS[Math.floor(Math.random() * FALLBACK_TOPICS.length)];
    const blog = normalizeGeneratedBlog(
      {
        title: topic.title,
        category: topic.category,
        excerpt: topic.template.replace(/\s+/g, " ").slice(0, 155),
        content: topic.template,
        readTime: "5 min",
      },
      topic.title,
    );

    const inserted = await insertBlogPost(blog, "AI Template");
    if (!inserted.inserted) return NextResponse.json({ success: false, error: inserted.error });

    return NextResponse.json({ success: true, title: blog.title, id: inserted.id, slug: inserted.slug, provider: "template" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { topic, isGuestPost } = body;

    if (!topic?.trim()) return NextResponse.json({ error: "Topic is required" }, { status: 400 });

    const { openaiKey, geminiKey, preferredModel } = await loadAiSettings();

    if (!openaiKey && !geminiKey) {
      return NextResponse.json(
        { error: "No AI API key configured. Add Gemini API key in Admin Settings." },
        { status: 400 },
      );
    }

    const prompt = buildBlogPrompt(topic.trim(), Boolean(isGuestPost));
    let generated: Partial<GeneratedBlog> | null = null;
    let provider = "";
    let lastError = "";

    if (preferredModel === "gemini" && geminiKey) {
      try {
        generated = await generateWithGemini(geminiKey, prompt);
        provider = GEMINI_BLOG_MODEL;
      } catch (e: any) {
        lastError = e.message;
      }
    }

    if (!generated && openaiKey) {
      try {
        generated = await generateWithOpenAI(openaiKey, prompt);
        provider = OPENAI_BLOG_MODEL;
      } catch (e: any) {
        lastError = e.message;
      }
    }

    if (!generated && geminiKey) {
      try {
        generated = await generateWithGemini(geminiKey, prompt);
        provider = GEMINI_BLOG_MODEL;
      } catch (e: any) {
        lastError = e.message;
      }
    }

    if (!generated) {
      return NextResponse.json({ error: `AI generation failed. ${lastError}` }, { status: 500 });
    }

    const blog = normalizeGeneratedBlog(generated, topic);
    const inserted = await insertBlogPost(blog);

    if (!inserted.inserted) {
      return NextResponse.json({ success: false, error: inserted.error });
    }

    return NextResponse.json({
      success: true,
      title: blog.title,
      id: inserted.id,
      slug: inserted.slug,
      provider,
      readTime: blog.readTime,
      metaTitle: blog.metaTitle,
      metaDescription: blog.metaDescription,
    });
  } catch (e: any) {
    console.error("AI Blog Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
