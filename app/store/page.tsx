"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PageHero } from '@/components/ui/PageHero';
import Link from 'next/link';
import {
  Zap,
  Shield,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Globe2,
  Lock,
  ExternalLink
} from 'lucide-react';

const linkPacks = [
  {
    id: "da60-power",
    category: "Link Building",
    title: "DA 60+ Ranking Powerhouse Pack",
    badge: "⭐ MOST POPULAR / BEST SELLER",
    price: "$1,499",
    billing: "one-time / campaign",
    deliverables: "10x DA 60+ / DR 65+ Editorial Posts",
    traffic: "5,000+ to 50,000+ monthly visits",
    turnaround: "5-10 business days",
    description: "10 elite high-authority guest posts on verified real websites with massive organic traffic. Built to outrank high-competition keywords.",
    features: [
      "10x High-Authority DA 60+ / DR 65+ Domains",
      "Real Google Traffic (5k-50k+ Visits/mo)",
      "100% DoFollow & Contextual In-Content",
      "10x 1,000+ Word Native Articles Included",
      "0% Spam / Zero PBNs Guaranteed",
      "365-Day Free Link Replacement Warranty",
      "Live White-Label Placement Report"
    ],
    ctaHref: "/services/guest-posting#order-form",
    featured: true
  },
  {
    id: "starter-auth",
    category: "Link Building",
    title: "Starter Authority Booster",
    badge: "For Local & Growing Sites",
    price: "$499",
    billing: "one-time / campaign",
    deliverables: "5x DA 40+ Contextual Posts",
    traffic: "1,000+ monthly visits",
    turnaround: "5-7 business days",
    description: "5 niche-relevant DoFollow guest posts on DA 40+ websites to build steady domain trust and baseline ranking signals.",
    features: [
      "5x High-DA 40+ Niche Placements",
      "Real Organic Search Traffic",
      "100% DoFollow Contextual Links",
      "5x 800+ Word Researched Articles",
      "365-Day Free Replacement Guarantee",
      "White-Label Placement Dashboard"
    ],
    ctaHref: "/services/guest-posting#order-form",
    featured: false
  },
  {
    id: "niche-edits",
    category: "Link Insertions",
    title: "Aged Niche Edits (Fast-Track)",
    badge: "Fastest Ranking Impact",
    price: "$599",
    billing: "one-time / campaign",
    deliverables: "5x Aged In-Content Link Insertions",
    traffic: "2,000+ monthly visits",
    turnaround: "48-72 hours",
    description: "Contextual links placed inside aged, indexed articles that are already ranking in Google for immediate authority pass-through.",
    features: [
      "5x Aged Articles Already Indexed by Google",
      "DA 45+ to DA 65+ Established Pages",
      "Instant Link Equity & Fast Authority",
      "Natural In-Content Sentence Insertion",
      "Rapid Turnaround in 48 to 72 Hours",
      "Permanent Placement Warranty"
    ],
    ctaHref: "/services/guest-posting#order-form",
    featured: false
  },
  {
    id: "enterprise-combo",
    category: "Full Authority Engine",
    title: "Enterprise All-In-One Surge",
    badge: "Agency Dominator",
    price: "$2,499",
    billing: "one-time / campaign",
    deliverables: "15 Posts + 5 Niche Edits + 1 AP Wire PR",
    traffic: "10,000+ monthly visits",
    turnaround: "7-14 business days",
    description: "Comprehensive authority takeover: 15 DA60+ editorial posts, 5 aged niche edits, and syndicated AP wire press release to 300+ media portals.",
    features: [
      "15x DA 60+ Tier-1 Editorial Posts",
      "5x Aged Niche Edit Link Insertions",
      "1x Syndicated Press Release (300+ Media Sites)",
      "Comprehensive Anchor Text Planning",
      "Dedicated Link Strategist Support",
      "365-Day Guaranteed Replacement"
    ],
    ctaHref: "/services/guest-posting#order-form",
    featured: false
  }
];

export default function StorePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'links' | 'assets'>('all');

  return (
    <main style={{ background: "var(--bg-base)", minHeight: "100vh", color: "var(--text-primary)" }}>
      <Navbar />

      <div style={{ paddingTop: '80px' }}>
        <PageHero
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Store & Digital Assets' }]}
          label="Digital Inventory & Authority Store"
          title={<>Premium Digital Assets &amp; <span style={{ color: "var(--accent-blue)" }}>Authority Packs</span></>}
          description="Direct access to verified high-DA backlink inventory, aged niche placements, and enterprise digital marketing assets."
        />

        {/* Tab Filters */}
        <section className="border-b border-[var(--border-subtle)] bg-white py-6">
          <div className="container max-w-6xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-[var(--accent-blue)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Digital Inventory
              </button>
              <button
                onClick={() => setActiveTab('links')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'links'
                    ? 'bg-[var(--accent-blue)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔗 Authority Link Packs (DA 40-75+)
              </button>
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'assets'
                    ? 'bg-[var(--accent-blue)] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🌐 Pre-Ranked Site Rentals
              </button>
            </div>

            <div className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>US-Registered Entity &bull; 100% Verified Placements</span>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-16 md:py-24" style={{ background: "var(--bg-base)" }}>
          <div className="container max-w-6xl">
            {(activeTab === 'all' || activeTab === 'links') && (
              <div className="mb-16">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-blue)]">
                      Instant Authority Inventory
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-[var(--text-primary)] mt-1">
                      High-Authority Guest Post &amp; Link Packs
                    </h2>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Guaranteed 100% DoFollow contextual links on 65,000+ real websites with verified Google search traffic.
                    </p>
                  </div>
                  <Link
                    href="/services/guest-posting"
                    className="text-xs font-bold text-[var(--accent-blue)] hover:underline inline-flex items-center gap-1 shrink-0"
                  >
                    View Interactive Calculator <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {linkPacks.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`relative rounded-3xl border p-7 md:p-8 flex flex-col justify-between transition-all bg-white shadow-lg ${
                        pkg.featured
                          ? "border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20 shadow-xl"
                          : "border-[var(--border-subtle)] hover:border-gray-300"
                      }`}
                    >
                      {pkg.badge && (
                        <div className="absolute top-5 right-5">
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                            pkg.featured
                              ? "bg-amber-500/10 text-amber-800 border border-amber-500/20"
                              : "bg-blue-50 text-[var(--accent-blue)] border border-blue-100"
                          }`}>
                            {pkg.badge}
                          </span>
                        </div>
                      )}

                      <div>
                        <div className="text-xs font-bold text-[var(--accent-blue)] uppercase tracking-wider mb-1">
                          {pkg.category}
                        </div>
                        <h3 className="text-xl font-black text-[var(--text-primary)] pr-16">{pkg.title}</h3>
                        
                        <div className="flex items-baseline gap-2 my-4">
                          <span className="text-3xl md:text-4xl font-black text-[var(--text-primary)]">{pkg.price}</span>
                          <span className="text-xs font-semibold text-[var(--text-muted)]">/ {pkg.billing}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 mb-5 text-xs text-[var(--text-primary)] space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Deliverables: {pkg.deliverables}
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            Traffic: {pkg.traffic} &bull; Turnaround: {pkg.turnaround}
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-6">
                          {pkg.description}
                        </p>

                        <div className="space-y-2.5 mb-8 border-t border-gray-100 pt-5">
                          {pkg.features.map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs font-medium text-[var(--text-primary)]">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Link
                          href={pkg.ctaHref}
                          className={`w-full py-4 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                            pkg.featured
                              ? "bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/25 hover:opacity-95"
                              : "bg-gray-900 hover:bg-black text-white"
                          }`}
                        >
                          <Zap size={14} /> Order {pkg.title} <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'all' || activeTab === 'assets') && (
              <div className="rounded-3xl border border-[var(--border-subtle)] bg-white p-8 md:p-12 text-center max-w-4xl mx-auto shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--accent-blue)] flex items-center justify-center mx-auto mb-4">
                  <Globe2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)]">
                  Pre-Ranked Digital Assets &amp; Turnkey Websites
                </h3>
                <p className="text-xs text-[var(--text-muted)] max-w-lg mx-auto mt-2 leading-relaxed">
                  All active pre-ranked niche sites are currently under client lease agreements. If you are looking for turnkey pre-ranked local lead-generation assets or specific domain acquisitions, join our priority waitlist.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/contact?service=Rent+a+Site&subject=Priority+Asset+Waitlist"
                    className="px-6 py-3 rounded-full bg-[var(--accent-blue)] text-white font-bold text-xs hover:opacity-90 transition shadow-md shadow-blue-500/20"
                  >
                    Join Asset Waitlist
                  </Link>
                  <Link
                    href="/services/guest-posting"
                    className="px-6 py-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition"
                  >
                    Explore Authority Link Packs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
