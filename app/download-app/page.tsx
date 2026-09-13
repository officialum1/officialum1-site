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
    Share2
} from 'lucide-react';

export const metadata: Metadata = {
    title: 'Download OfficialUM1 Mobile App (Android APK v1.0) | OfficialUM1',
    description: 'Download the official OfficialUM1 Android app. Manage authority link building, DA60+ guest posting orders, instant digital deliveries, and real-time sales on mobile.',
    alternates: {
        canonical: 'https://officialum1.com/download-app',
    },
};

export default function DownloadAppPage() {
    return (
        <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] selection:bg-[#146c78]/30 selection:text-[#5eead4]">
            <Navbar />

            {/* Hero Section */}
            <main className="relative pt-32 pb-20 overflow-hidden">
                {/* Background Glows */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#146c78]/15 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#6366f1]/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Column: Headlines & Download CTA */}
                        <div className="lg:col-span-7 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#146c78]/15 border border-[#146c78]/30 text-[#2dd4bf] text-xs font-bold uppercase tracking-widest mb-6">
                                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                                Official Mobile Application • v1.0
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-6">
                                Everything OfficialUM1.{' '}
                                <span className="bg-gradient-to-r from-[#2dd4bf] via-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent">
                                    In Your Pocket.
                                </span>
                            </h1>

                            <p className="text-lg sm:text-xl text-[#94a3b8] leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                                Access our 65,000+ DA60+ guest posting network, instant cryptographic deliveries, turnkey digital inventory, and live client CRM directly from your Android phone.
                            </p>

                            {/* Download Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-8">
                                <a
                                    href="/downloads/officialum1-app.apk"
                                    download="OfficialUM1-v1.0.apk"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#146c78] to-[#0d9488] hover:from-[#0f766e] hover:to-[#115e59] text-white font-extrabold text-base transition-all shadow-[0_0_30px_rgba(20,108,120,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Download className="w-5 h-5" />
                                    Download Android APK (v1.0)
                                </a>

                                <Link
                                    href="/services/guest-posting"
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-[#0f172a]/80 hover:bg-[#1e293b] border border-[#334155] text-white font-semibold text-base transition-all"
                                >
                                    Explore Web Packages
                                    <ArrowRight className="w-4 h-4 text-[#2dd4bf]" />
                                </Link>
                            </div>

                            {/* Trust Badges */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#94a3b8]">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#2dd4bf]" />
                                    <span>100% Virus & Malware Free</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-4 h-4 text-[#38bdf8]" />
                                    <span>Android 8.0 to Android 15+</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-[#fbbf24]" />
                                    <span>Instant Direct Install</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Phone Mockup Card & QR */}
                        <div className="lg:col-span-5 flex flex-col items-center">
                            <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 border border-[#334155]/60 shadow-2xl backdrop-blur-xl">
                                
                                {/* Header Badge */}
                                <div className="flex items-center justify-between pb-5 border-b border-[#334155]/50 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#146c78] to-[#2dd4bf] flex items-center justify-center text-white font-black text-lg shadow-lg">
                                            UM
                                        </div>
                                        <div>
                                            <h2 className="text-sm font-bold text-white leading-none mb-1">OfficialUM1 Mobile</h2>
                                            <p className="text-[11px] text-[#2dd4bf] font-medium">Verified Android Package</p>
                                        </div>
                                    </div>
                                    <span className="px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-[10px] font-extrabold uppercase">
                                        Active Build
                                    </span>
                                </div>

                                {/* App Highlights */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0b1120]/70 border border-[#1e293b]">
                                        <div className="p-2 rounded-lg bg-[#146c78]/20 text-[#2dd4bf] mt-0.5">
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white">Live Link ROI Calculator</h3>
                                            <p className="text-[11px] text-[#94a3b8]">Configure DA60+ placements & custom anchors on mobile.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0b1120]/70 border border-[#1e293b]">
                                        <div className="p-2 rounded-lg bg-[#6366f1]/20 text-[#818cf8] mt-0.5">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white">Cryptographic Deliveries</h3>
                                            <p className="text-[11px] text-[#94a3b8]">Instant 1-tap reveal & clipboard credentials copy.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 p-3 rounded-xl bg-[#0b1120]/70 border border-[#1e293b]">
                                        <div className="p-2 rounded-lg bg-[#f59e0b]/20 text-[#fbbf24] mt-0.5">
                                            <BellRing className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-white">Real-Time Lead Alerts</h3>
                                            <p className="text-[11px] text-[#94a3b8]">Get notified the moment a high-ticket quote is requested.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Scan & Download box */}
                                <div className="p-4 rounded-2xl bg-[#07090e]/90 border border-[#146c78]/30 text-center">
                                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#2dd4bf] mb-2">
                                        <QrCode className="w-4 h-4" />
                                        <span>Direct Mobile Install</span>
                                    </div>
                                    <p className="text-[11px] text-[#64748b]">
                                        Scan with your phone camera or tap download button above.
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* 3-Step Installation Guide */}
            <section className="py-16 bg-[#0b0f19] border-t border-b border-[#1e293b]/60 relative">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                            How to Install in 3 Easy Steps
                        </h2>
                        <p className="text-sm text-[#94a3b8]">
                            Simple step-by-step setup on any Android smartphone or tablet.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 text-center relative">
                            <div className="w-10 h-10 rounded-full bg-[#146c78]/20 border border-[#146c78]/40 text-[#2dd4bf] font-black text-lg flex items-center justify-center mx-auto mb-4">
                                1
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">Download the APK</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                Click the download button to save <code className="text-[#2dd4bf]">OfficialUM1.apk</code> to your device.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 text-center relative">
                            <div className="w-10 h-10 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/40 text-[#38bdf8] font-black text-lg flex items-center justify-center mx-auto mb-4">
                                2
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">Allow Unknown Apps</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                Tap the downloaded file. When prompted by Android, tap <strong>Settings &gt; Allow from this source</strong>.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 text-center relative">
                            <div className="w-10 h-10 rounded-full bg-[#818cf8]/20 border border-[#818cf8]/40 text-[#818cf8] font-black text-lg flex items-center justify-center mx-auto mb-4">
                                3
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">Open & Experience</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                Tap Install. Launch OfficialUM1 and enjoy 100% full desktop capabilities on your phone!
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Full Features Breakdown Grid */}
            <section className="py-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#2dd4bf]">All-In-One Mobile Ecosystem</span>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mt-2 mb-4">
                            Complete Control Center in Your Hand
                        </h2>
                        <p className="text-sm text-[#94a3b8]">
                            Whether you are purchasing guest posts, checking live deliveries, or managing sales operations.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 hover:border-[#146c78]/50 transition-all">
                            <Layers className="w-8 h-8 text-[#2dd4bf] mb-4" />
                            <h3 className="text-base font-bold text-white mb-2">DA60+ Guest Posting Portal</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                Instant access to Starter ($499), Powerhouse ($1,499), and Enterprise ($2,499) publisher tiers.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 hover:border-[#146c78]/50 transition-all">
                            <Zap className="w-8 h-8 text-[#38bdf8] mb-4" />
                            <h3 className="text-base font-bold text-white mb-2">Contextual Niche Edits</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                Order aged in-content link insertions with 48-72h turnaround time directly from the app.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 hover:border-[#146c78]/50 transition-all">
                            <ShieldCheck className="w-8 h-8 text-[#818cf8] mb-4" />
                            <h3 className="text-base font-bold text-white mb-2">Press Releases & Citations</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                AP News/Yahoo syndication and 8-country local business citations in a few taps.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 hover:border-[#146c78]/50 transition-all">
                            <Lock className="w-8 h-8 text-[#fbbf24] mb-4" />
                            <h3 className="text-base font-bold text-white mb-2">Instant Cryptographic Deliveries</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                View unsealed credentials, download PDF receipts, and copy login strings with 1 tap.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 hover:border-[#146c78]/50 transition-all">
                            <Smartphone className="w-8 h-8 text-[#34d399] mb-4" />
                            <h3 className="text-base font-bold text-white mb-2">Fast Admin Sale Recorder</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                Record sales in 5 seconds and have the delivery URL automatically copied to your clipboard.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl bg-[#0f172a]/60 border border-[#334155]/40 hover:border-[#146c78]/50 transition-all">
                            <BellRing className="w-8 h-8 text-[#f43f5e] mb-4" />
                            <h3 className="text-base font-bold text-white mb-2">Live Financial Tracker</h3>
                            <p className="text-xs text-[#94a3b8] leading-relaxed">
                                Track gross sales, wholesale cost deductions, and net margins across Meezan, UBL, and Binance.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA Banner */}
            <section className="pb-24 pt-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-[#146c78]/40 via-[#0d9488]/30 to-[#6366f1]/20 border border-[#146c78]/50 text-center shadow-2xl backdrop-blur-xl">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                            Ready to Upgrade Your Experience?
                        </h2>
                        <p className="text-base text-[#cbd5e1] max-w-xl mx-auto mb-8">
                            Download the OfficialUM1 Android APK today and start managing your high-ticket link placements on the go.
                        </p>
                        <a
                            href="/downloads/officialum1-app.apk"
                            download="OfficialUM1-v1.0.apk"
                            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-[#2dd4bf] to-[#0d9488] text-[#07090e] font-black text-base shadow-[0_0_30px_rgba(45,212,191,0.4)] hover:scale-105 active:scale-95 transition-all"
                        >
                            <Download className="w-5 h-5" />
                            Download Android App Now
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
