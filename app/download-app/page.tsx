import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
    Download, 
    Smartphone, 
    ShieldCheck, 
    Zap, 
    BellRing, 
    Lock, 
    ArrowRight, 
    CheckCircle2, 
    QrCode, 
    Sparkles,
    Layers,
    Sliders,
    Globe,
    FileText
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Download OfficialUM1 Mobile App (Android APK v1.0) | OfficialUM1 LLC',
    description: 'Download the official OfficialUM1 Android mobile app. Manage DA60+ authority guest posting, instant cryptographic deliveries, digital inventory, and live client CRM on your phone.',
    alternates: {
        canonical: 'https://officialum1.com/download-app',
    },
};

const appKeyStats = [
    { label: "Verified Publishers", val: "65,000+" },
    { label: "Instant Delivery", val: "48-72h" },
    { label: "Warranty Coverage", val: "365 Days" },
    { label: "App Size (Compact)", val: "51.9 MB" },
];

const appProofPoints = [
    "100% Native & In-App Browser Integration",
    "Instant Link ROI & DA60+ Package Calculator",
    "One-Tap Cryptographic Delivery Reveal",
    "Real-Time CRM & Lead Notification Alerts",
];

export default function DownloadAppPage() {
    return (
        <div className="min-h-screen bg-white text-[var(--text-primary)] selection:bg-[rgba(20,108,120,0.15)] selection:text-[var(--accent-blue)]">
            <Navbar />

            {/* Hero Section - Matching Homepage Light Aesthetic */}
            <section
                className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
                style={{
                    background: "linear-gradient(180deg, #f8faf7 0%, #eef4f2 100%)",
                }}
            >
                {/* Subtle Geometric Background Grid */}
                <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(20,108,120,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,108,120,0.05) 1px, transparent 1px)",
                        backgroundSize: "34px 34px",
                        maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                    }}
                />

                <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column: Headlines & CTA */}
                        <div className="lg:col-span-7 text-center lg:text-left">
                            <div
                                className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider mb-6"
                                style={{
                                    borderColor: "rgba(20,108,120,0.22)",
                                    background: "rgba(255,255,255,0.92)",
                                    color: "var(--accent-blue)",
                                    boxShadow: "0 2px 10px rgba(20,108,120,0.06)",
                                }}
                            >
                                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                <span>OfficialUM1 LLC • Android Mobile Application v1.0</span>
                            </div>

                            <h1
                                className="mb-6 text-[34px] sm:text-[48px] md:text-[62px] lg:text-[70px] font-black leading-[1.08] tracking-tight"
                                style={{
                                    fontFamily: "var(--font-space-grotesk), system-ui, sans-serif",
                                    color: "var(--text-primary)",
                                }}
                            >
                                Everything OfficialUM1.{' '}
                                <span className="block sm:inline" style={{ color: "var(--accent-blue)" }}>
                                    In Your Pocket.
                                </span>
                            </h1>

                            <p
                                className="mb-8 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg md:text-xl leading-relaxed"
                                style={{ color: "var(--text-muted)" }}
                            >
                                Manage DA60+ authority link packages, instant cryptographic deliveries, real-time client CRM, and high-ticket sales directly from your smartphone — without opening an external browser.
                            </p>

                            {/* App Key Feature Badges Grid */}
                            <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto lg:mx-0">
                                {appProofPoints.map((point) => (
                                    <div
                                        key={point}
                                        className="flex items-center gap-2.5 rounded-xl border bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold shadow-sm transition-transform duration-150 hover:-translate-y-0.5"
                                        style={{
                                            borderColor: "var(--border-subtle)",
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        <CheckCircle2 className="h-4 w-4 flex-none" style={{ color: "var(--accent-blue)" }} />
                                        <span>{point}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Download CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                                <a
                                    href="/downloads/officialum1-app.apk"
                                    download="OfficialUM1-v1.0.apk"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-extrabold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]"
                                    style={{
                                        background: "var(--gradient)",
                                        boxShadow: "var(--glow-blue)",
                                    }}
                                >
                                    <Download className="w-5 h-5" />
                                    Download Android APK (v1.0)
                                </a>

                                <Link
                                    href="/services/guest-posting"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl border bg-white text-base font-bold transition-transform duration-200 hover:-translate-y-0.5 shadow-sm"
                                    style={{
                                        borderColor: "var(--border-subtle)",
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    Explore Guest Posting
                                    <ArrowRight className="w-4 h-4 text-[var(--accent-blue)]" />
                                </Link>
                            </div>

                            {/* Verification Footnote */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-semibold text-gray-500">
                                <span className="flex items-center gap-1.5 text-emerald-700">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    100% Clean &amp; Virus-Free APK
                                </span>
                                <span>•</span>
                                <span>Universal Package: 51.9 MB</span>
                                <span>•</span>
                                <span>Android 8.0 to Android 15+</span>
                            </div>
                        </div>

                        {/* Right Column: App Mockup & QR Code */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div
                                className="w-full max-w-sm rounded-[28px] border bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl"
                                style={{
                                    borderColor: "var(--border-subtle)",
                                    boxShadow: "0 20px 50px rgba(24,32,38,0.08)",
                                }}
                            >
                                {/* Mockup Top Bar */}
                                <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md"
                                            style={{ background: "var(--gradient)" }}
                                        >
                                            UM
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-extrabold text-[var(--text-primary)] leading-tight">OfficialUM1 Mobile</h2>
                                            <p className="text-[11px] font-semibold text-[var(--accent-blue)]">Official Android Client</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase">
                                        Stable v1.0
                                    </span>
                                </div>

                                {/* App Modules In App */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-teal-50 text-[var(--accent-blue)]">
                                            <Sliders className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-[var(--text-primary)]">Live Link ROI Calculator</h3>
                                            <p className="text-[11px] text-[var(--text-muted)]">Configure DA60+ packages in 1 tap</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-[var(--text-primary)]">Cryptographic Deliveries</h3>
                                            <p className="text-[11px] text-[var(--text-muted)]">Instant 1-tap credentials reveal</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50/80 border border-gray-100">
                                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                            <BellRing className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-[var(--text-primary)]">Real-Time CRM &amp; Sales</h3>
                                            <p className="text-[11px] text-[var(--text-muted)]">Push notifications on lead quote requests</p>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Code & Direct Scan Box */}
                                <div
                                    className="p-4 rounded-2xl border text-center"
                                    style={{
                                        background: "rgba(20,108,120,0.03)",
                                        borderColor: "rgba(20,108,120,0.18)",
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-[var(--accent-blue)] mb-1.5">
                                        <QrCode className="w-4 h-4" />
                                        <span>Direct Mobile Install</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 font-medium">
                                        Tap download above or open <code className="text-[var(--accent-blue)] font-bold">officialum1.com/app</code> on your phone.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div
                    className="absolute inset-x-0 bottom-0 h-16 pointer-events-none"
                    style={{ background: "linear-gradient(to bottom, transparent, #ffffff)" }}
                />
            </section>

            {/* Metrics Bar */}
            <section className="py-10 border-b border-[var(--border-subtle)] bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        {appKeyStats.map((stat, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
                                <div className="text-2xl sm:text-3xl font-black text-[var(--accent-blue)] mb-1">
                                    {stat.val}
                                </div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3-Step Installation Guide */}
            <section className="py-20 bg-gray-50/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-blue)]">
                            Quick Installation Guide
                        </span>
                        <h2
                            className="text-3xl sm:text-4xl font-black mt-2 mb-3"
                            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                        >
                            How to Install in 3 Easy Steps
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                            Simple 60-second installation on any Android smartphone or tablet.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="p-8 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-sm text-center">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white mx-auto mb-5 shadow-md"
                                style={{ background: "var(--gradient)" }}
                            >
                                1
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Download the APK</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Click the download button to save <strong className="text-[var(--accent-blue)]">OfficialUM1-v1.0.apk</strong> directly onto your Android device.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-sm text-center">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white mx-auto mb-5 shadow-md"
                                style={{ background: "linear-gradient(135deg, #0d9488, #146c78)" }}
                            >
                                2
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Allow Unknown Apps</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Tap the downloaded APK file. When prompted by Android, select <strong>Settings &gt; Allow from this source</strong>.
                            </p>
                        </div>

                        <div className="p-8 rounded-2xl bg-white border border-[var(--border-subtle)] shadow-sm text-center">
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl text-white mx-auto mb-5 shadow-md"
                                style={{ background: "linear-gradient(135deg, #146c78, #6366f1)" }}
                            >
                                3
                            </div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Open &amp; Enjoy</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Tap <strong>Install</strong>. Launch OfficialUM1 and enjoy 100% full desktop capabilities right on your phone!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Complete Features Grid */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-blue)]">
                            All-in-One Capabilities
                        </span>
                        <h2
                            className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mt-2 mb-4"
                            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                        >
                            Complete Control Center in Your Hand
                        </h2>
                        <p className="text-sm text-[var(--text-muted)]">
                            Whether you are purchasing guest posts, checking live deliveries, or managing sales operations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-teal-200 transition-all">
                            <Layers className="w-8 h-8 text-[var(--accent-blue)] mb-4" />
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">DA60+ Guest Posting Portal</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Instant access to Starter ($499), Powerhouse ($1,499), and Enterprise ($2,499) publisher packages.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-teal-200 transition-all">
                            <Zap className="w-8 h-8 text-indigo-600 mb-4" />
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Contextual Niche Edits</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Order aged in-content link insertions with 48-72h turnaround time directly inside the app.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-teal-200 transition-all">
                            <Globe className="w-8 h-8 text-teal-600 mb-4" />
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Press Releases &amp; Citations</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                AP News/Yahoo syndication and 8-country local business citations in a few taps.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-teal-200 transition-all">
                            <Lock className="w-8 h-8 text-amber-600 mb-4" />
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Instant Cryptographic Deliveries</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                View unsealed credentials, download PDF receipts, and copy login strings with 1 tap.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-teal-200 transition-all">
                            <Smartphone className="w-8 h-8 text-emerald-600 mb-4" />
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Fast Admin Sale Recorder</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Record sales in 5 seconds and have the delivery URL automatically copied to your clipboard.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-teal-200 transition-all">
                            <BellRing className="w-8 h-8 text-rose-600 mb-4" />
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">Live Financial Tracker</h3>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                Track gross sales, wholesale cost deductions, and net margins across Meezan, UBL, and Binance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="pb-24 pt-8 bg-gray-50/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <div
                        className="rounded-3xl p-8 sm:p-12 text-center shadow-xl border"
                        style={{
                            background: "linear-gradient(135deg, rgba(20,108,120,0.08) 0%, rgba(99,102,241,0.08) 100%)",
                            borderColor: "rgba(20,108,120,0.22)",
                        }}
                    >
                        <h2
                            className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mb-4"
                            style={{ fontFamily: "var(--font-space-grotesk), sans-serif" }}
                        >
                            Ready to Upgrade Your Mobile Experience?
                        </h2>
                        <p className="text-base text-[var(--text-muted)] max-w-xl mx-auto mb-8">
                            Download the OfficialUM1 Android APK today and start managing your high-ticket link placements and sales on the go.
                        </p>
                        <a
                            href="/downloads/officialum1-app.apk"
                            download="OfficialUM1-v1.0.apk"
                            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-extrabold text-base text-white shadow-lg transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-95"
                            style={{
                                background: "var(--gradient)",
                                boxShadow: "var(--glow-blue)",
                            }}
                        >
                            <Download className="w-5 h-5" />
                            Download Android APK Now
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
