import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { stripHtml } from "@/lib/seo";

type SeoCheck = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
};

function includesKeyword(value: string, keyword: string) {
  if (!keyword.trim()) return false;
  return value.toLowerCase().includes(keyword.trim().toLowerCase());
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const title = String(body.title || body.seoTitle || "").trim();
  const description = String(body.description || body.seoDescription || "").trim();
  const content = stripHtml(String(body.content || ""));
  const focusKeyword = String(body.focusKeyword || body.focus_keyword || "").trim();
  const canonicalUrl = String(body.canonicalUrl || body.canonical_url || "").trim();
  const robots = String(body.robots || "index,follow");
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const checks: SeoCheck[] = [
    {
      id: "title-length",
      label: "SEO title length",
      passed: title.length >= 35 && title.length <= 65,
      detail: `${title.length} characters. Aim for 35-65.`,
    },
    {
      id: "description-length",
      label: "Meta description length",
      passed: description.length >= 120 && description.length <= 160,
      detail: `${description.length} characters. Aim for 120-160.`,
    },
    {
      id: "focus-keyword",
      label: "Focus keyword set",
      passed: Boolean(focusKeyword),
      detail: focusKeyword || "Add one primary search phrase.",
    },
    {
      id: "keyword-in-title",
      label: "Keyword in SEO title",
      passed: includesKeyword(title, focusKeyword),
      detail: focusKeyword ? "Use the focus keyword naturally in title." : "No focus keyword set.",
    },
    {
      id: "keyword-in-description",
      label: "Keyword in description",
      passed: includesKeyword(description, focusKeyword),
      detail: focusKeyword ? "Use the focus keyword naturally in description." : "No focus keyword set.",
    },
    {
      id: "content-depth",
      label: "Content depth",
      passed: wordCount >= 700,
      detail: `${wordCount} words. Aim for 700+ on blog/service pages.`,
    },
    {
      id: "canonical",
      label: "Canonical URL",
      passed: !canonicalUrl || canonicalUrl.startsWith("https://officialum1.com"),
      detail: canonicalUrl || "Default canonical will be used.",
    },
    {
      id: "robots-indexable",
      label: "Indexable robots",
      passed: robots.includes("index") && !robots.includes("noindex"),
      detail: robots,
    },
  ];

  const score = Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);

  return NextResponse.json({
    score,
    status: score >= 80 ? "good" : score >= 55 ? "needs-work" : "poor",
    checks,
  });
}
