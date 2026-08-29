"use client";

import { useEffect, useState } from "react";
import { modernAlert } from "@/components/ModernUIOverlay";
import {
  DEFAULT_RANK_MATH_CONFIG,
  rankMathSeoScore,
  type RankMathConfig,
} from "@/lib/rank-math-config";

type TabId =
  | "dashboard"
  | "general"
  | "knowledge"
  | "social"
  | "schema"
  | "titles"
  | "sitemap"
  | "webmaster"
  | "advanced";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "general", label: "General", icon: "⚙️" },
  { id: "knowledge", label: "Knowledge Panel", icon: "🏢" },
  { id: "social", label: "Social", icon: "🔗" },
  { id: "schema", label: "Schema", icon: "🧩" },
  { id: "titles", label: "Titles & Meta", icon: "📝" },
  { id: "sitemap", label: "Sitemap", icon: "🗺️" },
  { id: "webmaster", label: "Webmaster", icon: "✅" },
  { id: "advanced", label: "Advanced", icon: "🔧" },
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</label>
      {children}
      {hint ? <p className="text-[11px] text-gray-500 mt-1.5">{hint}</p> : null}
    </div>
  );
}

const inputClass =
  "w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500/50";

export default function RankMathTab() {
  const [config, setConfig] = useState<RankMathConfig>(DEFAULT_RANK_MATH_CONFIG);
  const [tab, setTab] = useState<TabId>("dashboard");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const score = rankMathSeoScore(config);

  useEffect(() => {
    fetch("/api/admin/rank-math")
      .then((r) => r.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
      })
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/rank-math", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (data.success) {
        modernAlert("Saved", "Rank Math SEO settings are live on the public site.", "success");
      } else {
        modernAlert("Error", data.error || "Save failed", "error");
      }
    } catch {
      modernAlert("Error", "Could not save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const setGeneral = (patch: Partial<RankMathConfig["general"]>) =>
    setConfig((c) => ({ ...c, general: { ...c.general, ...patch } }));
  const setKnowledge = (patch: Partial<RankMathConfig["knowledge_panel"]>) =>
    setConfig((c) => ({ ...c, knowledge_panel: { ...c.knowledge_panel, ...patch } }));
  const setSocial = (patch: Partial<RankMathConfig["social"]>) =>
    setConfig((c) => ({ ...c, social: { ...c.social, ...patch } }));
  const setSchema = (patch: Partial<RankMathConfig["schema"]>) =>
    setConfig((c) => ({ ...c, schema: { ...c.schema, ...patch } }));
  const setTitles = (patch: Partial<RankMathConfig["titles"]>) =>
    setConfig((c) => ({ ...c, titles: { ...c.titles, ...patch } }));
  const setSitemap = (patch: Partial<RankMathConfig["sitemap"]>) =>
    setConfig((c) => ({ ...c, sitemap: { ...c.sitemap, ...patch } }));
  const setWebmaster = (patch: Partial<RankMathConfig["webmaster"]>) =>
    setConfig((c) => ({ ...c, webmaster: { ...c.webmaster, ...patch } }));
  const setAdvanced = (patch: Partial<RankMathConfig["advanced"]>) =>
    setConfig((c) => ({ ...c, advanced: { ...c.advanced, ...patch } }));

  if (loading) {
    return <div className="p-10 text-gray-500 animate-pulse">Loading Rank Math SEO...</div>;
  }

  return (
    <div className="FadeIn p-4 max-w-6xl">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            Rank Math SEO
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              NEXT.JS ENGINE
            </span>
          </h2>
          <p className="text-gray-400 text-sm mt-1 max-w-2xl">
            Rank Math jaisi settings yahan save hoti hain aur public site par meta tags, schema, aur Google Knowledge Panel signals apply hote hain.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] uppercase tracking-widest text-gray-500">SEO Score</div>
            <div className={`text-3xl font-black ${score >= 80 ? "text-emerald-400" : score >= 55 ? "text-yellow-400" : "text-red-400"}`}>
              {score}%
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20"
          >
            {saving ? "Saving..." : "Save & Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id ? "bg-emerald-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl border border-white/10 p-6 md:p-8">
        {tab === "dashboard" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <h3 className="font-bold text-emerald-400 mb-2">Public site output</h3>
              <ul className="text-sm text-gray-300 space-y-2 list-disc pl-5">
                <li>Homepage title & description</li>
                <li>Organization + Person JSON-LD (Knowledge Panel)</li>
                <li>WebSite schema + search action</li>
                <li>Social sameAs links</li>
                <li>Google / Bing verification meta tags</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <h3 className="font-bold text-white mb-2">Quick checklist</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>{config.knowledge_panel.phone ? "✅" : "❌"} Business phone in schema</li>
                <li>{config.knowledge_panel.founder_name ? "✅" : "❌"} Founder Person entity</li>
                <li>{config.social.linkedin_url ? "✅" : "❌"} LinkedIn sameAs</li>
                <li>{config.webmaster.google_verification ? "✅" : "❌"} Google Search Console verified</li>
                <li>{config.webmaster.yandex_verification ? "✅" : "❌"} Yandex Webmaster verified</li>
                <li>{config.webmaster.bing_verification ? "✅" : "❌"} Bing Webmaster verified</li>
                <li>{config.schema.enable_organization ? "✅" : "❌"} Organization schema ON</li>
              </ul>
            </div>
            <p className="md:col-span-2 text-xs text-gray-500">
              API: <code className="text-emerald-400">GET /api/rank-math</code> (public read) · Admin save:{" "}
              <code className="text-emerald-400">POST /api/admin/rank-math</code>
            </p>
          </div>
        )}

        {tab === "general" && (
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Site name">
              <input className={inputClass} value={config.general.site_name} onChange={(e) => setGeneral({ site_name: e.target.value })} />
            </Field>
            <Field label="Title separator">
              <input className={inputClass} value={config.general.separator} onChange={(e) => setGeneral({ separator: e.target.value })} />
            </Field>
            <Field label="Homepage SEO title" hint="Recommended under 60 characters">
              <input className={inputClass} value={config.general.homepage_title} onChange={(e) => setGeneral({ homepage_title: e.target.value })} />
            </Field>
            <Field label="Default robots">
              <select className={inputClass} value={config.general.default_robots} onChange={(e) => setGeneral({ default_robots: e.target.value })}>
                <option value="index,follow">index, follow</option>
                <option value="noindex,follow">noindex, follow</option>
              </select>
            </Field>
            <Field label="Homepage meta description" hint="Recommended 120–155 characters">
              <textarea className={`${inputClass} min-h-[100px]`} value={config.general.homepage_description} onChange={(e) => setGeneral({ homepage_description: e.target.value })} />
            </Field>
            <Field label="Homepage keywords">
              <input className={inputClass} value={config.general.homepage_keywords} onChange={(e) => setGeneral({ homepage_keywords: e.target.value })} />
            </Field>
            <Field label="Tagline">
              <input className={inputClass} value={config.general.tagline} onChange={(e) => setGeneral({ tagline: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === "knowledge" && (
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Organization type">
              <select className={inputClass} value={config.knowledge_panel.org_type} onChange={(e) => setKnowledge({ org_type: e.target.value as RankMathConfig["knowledge_panel"]["org_type"] })}>
                <option value="ProfessionalService">ProfessionalService</option>
                <option value="Organization">Organization</option>
                <option value="LocalBusiness">LocalBusiness</option>
              </select>
            </Field>
            <Field label="Business name">
              <input className={inputClass} value={config.knowledge_panel.org_name} onChange={(e) => setKnowledge({ org_name: e.target.value })} />
            </Field>
            <Field label="Legal name">
              <input className={inputClass} value={config.knowledge_panel.legal_name} onChange={(e) => setKnowledge({ legal_name: e.target.value })} />
            </Field>
            <Field label="Website URL">
              <input className={inputClass} value={config.knowledge_panel.url} onChange={(e) => setKnowledge({ url: e.target.value })} />
            </Field>
            <Field label="Logo URL">
              <input className={inputClass} value={config.knowledge_panel.logo_url} onChange={(e) => setKnowledge({ logo_url: e.target.value })} />
            </Field>
            <Field label="Phone (Knowledge Panel)">
              <input className={inputClass} value={config.knowledge_panel.phone} onChange={(e) => setKnowledge({ phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className={inputClass} value={config.knowledge_panel.email} onChange={(e) => setKnowledge({ email: e.target.value })} />
            </Field>
            <Field label="Founding date">
              <input className={inputClass} value={config.knowledge_panel.founding_date} onChange={(e) => setKnowledge({ founding_date: e.target.value })} />
            </Field>
            <Field label="Founder name">
              <input className={inputClass} value={config.knowledge_panel.founder_name} onChange={(e) => setKnowledge({ founder_name: e.target.value })} />
            </Field>
            <Field label="Founder title">
              <input className={inputClass} value={config.knowledge_panel.founder_title} onChange={(e) => setKnowledge({ founder_title: e.target.value })} />
            </Field>
            <Field label="Founder page URL">
              <input className={inputClass} value={config.knowledge_panel.founder_url} onChange={(e) => setKnowledge({ founder_url: e.target.value })} />
            </Field>
            <Field label="Founder image URL">
              <input className={inputClass} value={config.knowledge_panel.founder_image} onChange={(e) => setKnowledge({ founder_image: e.target.value })} />
            </Field>
            <Field label="Street">
              <input className={inputClass} value={config.knowledge_panel.street} onChange={(e) => setKnowledge({ street: e.target.value })} />
            </Field>
            <Field label="City">
              <input className={inputClass} value={config.knowledge_panel.city} onChange={(e) => setKnowledge({ city: e.target.value })} />
            </Field>
            <Field label="Region / State">
              <input className={inputClass} value={config.knowledge_panel.region} onChange={(e) => setKnowledge({ region: e.target.value })} />
            </Field>
            <Field label="Postal code">
              <input className={inputClass} value={config.knowledge_panel.postal_code} onChange={(e) => setKnowledge({ postal_code: e.target.value })} />
            </Field>
            <Field label="Country code">
              <input className={inputClass} value={config.knowledge_panel.country} onChange={(e) => setKnowledge({ country: e.target.value })} />
            </Field>
            <Field label="Latitude">
              <input className={inputClass} value={config.knowledge_panel.latitude} onChange={(e) => setKnowledge({ latitude: e.target.value })} />
            </Field>
            <Field label="Longitude">
              <input className={inputClass} value={config.knowledge_panel.longitude} onChange={(e) => setKnowledge({ longitude: e.target.value })} />
            </Field>
            <Field label="Area served" hint="Comma separated">
              <input className={inputClass} value={config.knowledge_panel.area_served} onChange={(e) => setKnowledge({ area_served: e.target.value })} />
            </Field>
            <Field label="Knows about" hint="Comma separated topics">
              <textarea className={`${inputClass} min-h-[80px]`} value={config.knowledge_panel.knows_about} onChange={(e) => setKnowledge({ knows_about: e.target.value })} />
            </Field>
            <Field label="Business description" hint="Used in Organization schema">
              <textarea className={`${inputClass} min-h-[100px] md:col-span-2`} value={config.knowledge_panel.description} onChange={(e) => setKnowledge({ description: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === "social" && (
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Twitter handle">
              <input className={inputClass} value={config.social.twitter_handle} onChange={(e) => setSocial({ twitter_handle: e.target.value })} />
            </Field>
            <Field label="Facebook URL">
              <input className={inputClass} value={config.social.facebook_url} onChange={(e) => setSocial({ facebook_url: e.target.value })} />
            </Field>
            <Field label="Instagram URL">
              <input className={inputClass} value={config.social.instagram_url} onChange={(e) => setSocial({ instagram_url: e.target.value })} />
            </Field>
            <Field label="LinkedIn URL">
              <input className={inputClass} value={config.social.linkedin_url} onChange={(e) => setSocial({ linkedin_url: e.target.value })} />
            </Field>
            <Field label="YouTube URL">
              <input className={inputClass} value={config.social.youtube_url} onChange={(e) => setSocial({ youtube_url: e.target.value })} />
            </Field>
            <Field label="Extra sameAs URLs" hint="One per line">
              <textarea className={`${inputClass} min-h-[100px]`} value={config.social.extra_same_as} onChange={(e) => setSocial({ extra_same_as: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === "schema" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {(
              [
                ["enable_organization", "Organization / LocalBusiness"],
                ["enable_website", "WebSite + SearchAction"],
                ["enable_person", "Founder Person"],
                ["enable_breadcrumbs", "BreadcrumbList on pages"],
                ["enable_faq", "FAQPage schema"],
                ["enable_article", "Article / BlogPosting"],
                ["enable_product", "Product schema on shop"],
                ["enable_local_business", "Force LocalBusiness type"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
                <span className="text-sm text-gray-300">{label}</span>
                <input
                  type="checkbox"
                  checked={config.schema[key]}
                  onChange={(e) => setSchema({ [key]: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500"
                />
              </label>
            ))}
          </div>
        )}

        {tab === "titles" && (
          <div className="grid gap-5">
            <p className="text-sm text-gray-400">Variables: %title%, %sitename%, %sep%, %excerpt%, %category%</p>
            {(
              [
                ["post_title_template", "Post title template"],
                ["page_title_template", "Page title template"],
                ["product_title_template", "Product title template"],
                ["category_title_template", "Category title template"],
                ["post_description_template", "Post description template"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input className={inputClass} value={config.titles[key]} onChange={(e) => setTitles({ [key]: e.target.value })} />
              </Field>
            ))}
          </div>
        )}

        {tab === "sitemap" && (
          <div className="grid md:grid-cols-2 gap-5">
            {(
              [
                ["enable", "Enable XML sitemap"],
                ["include_products", "Include products"],
                ["include_posts", "Include blog posts"],
                ["include_pages", "Include static pages"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-sm">{label}</span>
                <input type="checkbox" checked={config.sitemap[key]} onChange={(e) => setSitemap({ [key]: e.target.checked })} className="w-5 h-5 accent-emerald-500" />
              </label>
            ))}
            <Field label="Homepage priority">
              <input className={inputClass} value={config.sitemap.homepage_priority} onChange={(e) => setSitemap({ homepage_priority: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === "webmaster" && (
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Google Search Console verification code">
              <input className={inputClass} value={config.webmaster.google_verification} onChange={(e) => setWebmaster({ google_verification: e.target.value })} />
            </Field>
            <Field label="Bing Webmaster verification">
              <input className={inputClass} value={config.webmaster.bing_verification} onChange={(e) => setWebmaster({ bing_verification: e.target.value })} />
            </Field>
            <Field label="Yandex verification">
              <input className={inputClass} value={config.webmaster.yandex_verification} onChange={(e) => setWebmaster({ yandex_verification: e.target.value })} placeholder="6ea75d08afccaed0" />
            </Field>
            <Field label="Pinterest verification">
              <input className={inputClass} value={config.webmaster.pinterest_verification} onChange={(e) => setWebmaster({ pinterest_verification: e.target.value })} />
            </Field>
          </div>
        )}

        {tab === "advanced" && (
          <div className="grid gap-5">
            <Field label="Global keywords">
              <input className={inputClass} value={config.advanced.global_keywords} onChange={(e) => setAdvanced({ global_keywords: e.target.value })} />
            </Field>
            <Field label="Default OG image path">
              <input className={inputClass} value={config.advanced.og_default_image} onChange={(e) => setAdvanced({ og_default_image: e.target.value })} />
            </Field>
            <Field label="Noindex paths" hint="One path per line, e.g. /admin">
              <textarea className={`${inputClass} min-h-[120px] font-mono text-xs`} value={config.advanced.noindex_paths} onChange={(e) => setAdvanced({ noindex_paths: e.target.value })} />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
}
