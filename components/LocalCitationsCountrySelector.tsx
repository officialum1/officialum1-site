"use client";

import { useState } from "react";
import { CheckCircle2, MapPin, Zap, ArrowRight, ShieldCheck, Globe } from "lucide-react";

export const countries = [
  {
    id: "usa",
    name: "USA Local Listings",
    flag: "🇺🇸",
    currency: "USD",
    topDirectories: ["Google Business Profile", "Bing Places", "Apple Maps", "Yelp US", "YellowPages", "BBB", "Foursquare", "Angi"],
    popular: true,
  },
  {
    id: "uk",
    name: "UK Local Listings",
    flag: "🇬🇧",
    currency: "USD",
    topDirectories: ["Google UK", "Scoot", "Yell.com", "FreeIndex", "Thomson Local", "192.com", "Cylex UK", "Touch Local"],
    popular: true,
  },
  {
    id: "canada",
    name: "Canada Local Listings",
    flag: "🇨🇦",
    currency: "USD",
    topDirectories: ["Google Canada", "YellowPages Canada", "411.ca", "ProfileCanada", "Cylex Canada", "Canpages", "Hotfrog CA"],
    popular: false,
  },
  {
    id: "australia",
    name: "Australia Local Listings",
    flag: "🇦🇺",
    currency: "USD",
    topDirectories: ["Google AU", "TrueLocal", "YellowPages AU", "LocalSearch", "AussieWeb", "StartLocal", "Hotfrog AU"],
    popular: false,
  },
  {
    id: "dubai",
    name: "Dubai & UAE Local Listings",
    flag: "🇦🇪",
    currency: "USD",
    topDirectories: ["Google UAE", "YellowPages UAE", "Dubai City Guide", "Connect.ae", "Etisalat Yellowpages", "ArabClicks"],
    popular: true,
  },
  {
    id: "singapore",
    name: "Singapore Local Listings",
    flag: "🇸🇬",
    currency: "USD",
    topDirectories: ["Google SG", "YellowPages Singapore", "SgCarMart", "SingPath Local", "Yalwa Singapore", "Tuugo SG"],
    popular: false,
  },
  {
    id: "philippines",
    name: "Philippines Local Listings",
    flag: "🇵🇭",
    currency: "USD",
    topDirectories: ["Google PH", "YellowPages Philippines", "BusinessList PH", "Tuugo PH", "Philippine Companies Directory"],
    popular: false,
  },
  {
    id: "indonesia",
    name: "Indonesia Local Listings",
    flag: "🇮🇩",
    currency: "USD",
    topDirectories: ["Google ID", "YellowPages Indonesia", "Indonetwork", "Daftar Perusahaan", "IndoTrading", "Cylex ID"],
    popular: false,
  },
];

export default function LocalCitationsCountrySelector() {
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);

  const citationPacks = [
    {
      name: "Starter Citation Pack",
      price: "$149",
      qty: `50 Hand-Built ${selectedCountry.name}`,
      turnaround: "3 to 5 Days",
      features: [
        `50x Manual Submissions in ${selectedCountry.name}`,
        "100% Strict NAP (Name, Address, Phone) Consistency",
        "Top Authority Regional & National Directories",
        "No Automated Bots / 100% Hand-Crafted Profiles",
        "Business Logo, Bio, Social Links & Hours Included",
        "Complete Spreadsheet with Live URLs & Login Access"
      ]
    },
    {
      name: "Google 3-Pack Dominator",
      price: "$299",
      qty: `100 Top ${selectedCountry.name} + Geo-Tagging`,
      turnaround: "5 to 7 Days",
      featured: true,
      badge: `⭐ BEST FOR ${selectedCountry.id.toUpperCase()} MAPS RANKINGS`,
      features: [
        `100x High-DA ${selectedCountry.name}`,
        "Includes Top Tier Niche & City-Specific Directories",
        "Geo-Tagged Images & Local Schema Data Mapping",
        "Duplicate Citation Audit & Cleanup",
        "Fast Google Search Indexing Support",
        "Full Master Login Report & 365-Day Accuracy Warranty"
      ]
    },
    {
      name: "Enterprise Multi-Location Pack",
      price: "$599",
      qty: `200 Citations + Tier-2 Local Backlinks`,
      turnaround: "7 to 10 Days",
      features: [
        `200x Premium Directory Submissions in ${selectedCountry.name}`,
        "5x Local Niche Edit Backlinks for Google Maps Push",
        "Apple Maps, Bing Places & GPS Mapping Ingestion",
        "Dedicated Senior Local SEO Account Director",
        "Full White-Label Report with Client Presentation Deck"
      ]
    }
  ];

  return (
    <div className="w-full">
      {/* Country Selection Tabs */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent-blue)]">
          Select Target Country
        </span>
        <h3 className="text-xl md:text-2xl font-black text-[var(--text-primary)] mt-1 mb-4">
          Geo-Targeted Business Directory Network
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
          {countries.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCountry(c)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCountry.id === c.id
                  ? "bg-[var(--accent-blue)] text-white shadow-md shadow-blue-500/20 scale-105"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-gray-400"
              }`}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Country Active Directories Ribbon */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 max-w-3xl mx-auto mb-12 text-center">
        <div className="text-xs font-bold text-[var(--accent-blue)] mb-2 flex items-center justify-center gap-1.5">
          <span>{selectedCountry.flag}</span>
          <span>Verified Top Directories in {selectedCountry.name}:</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {selectedCountry.topDirectories.map((dir, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-md bg-white border text-[11px] font-semibold text-gray-700 shadow-sm">
              {dir}
            </span>
          ))}
        </div>
      </div>

      {/* Packages Grid for this Country */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {citationPacks.map((pkg, i) => (
          <div
            key={i}
            className={`rounded-3xl border p-8 bg-white flex flex-col justify-between transition-all shadow-lg ${
              pkg.featured
                ? "border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20 shadow-2xl relative"
                : "border-[var(--border-subtle)] hover:border-gray-300"
            }`}
          >
            {pkg.badge && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-[var(--accent-blue)] text-white text-[10px] font-black px-3.5 py-1 rounded-full shadow-md whitespace-nowrap">
                  {pkg.badge}
                </span>
              </div>
            )}

            <div>
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{pkg.name}</h3>
              <div className="flex items-baseline gap-2 my-4">
                <span className="text-4xl font-black text-[var(--text-primary)]">{pkg.price}</span>
                <span className="text-xs font-semibold text-[var(--text-muted)]">/ {pkg.turnaround}</span>
              </div>
              <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-xs font-bold text-[var(--accent-blue)] mb-6">
                📍 {pkg.qty}
              </div>

              <div className="space-y-3 mb-8">
                {pkg.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs font-medium text-[var(--text-primary)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href="#order-form"
              className={`w-full py-4 rounded-2xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 ${
                pkg.featured
                  ? "bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/25 hover:opacity-95"
                  : "bg-gray-900 hover:bg-black text-white"
              }`}
            >
              <Zap size={14} /> Order {selectedCountry.flag} {pkg.name} <ArrowRight size={14} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
