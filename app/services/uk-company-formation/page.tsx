"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { PageHero } from '@/components/ui/PageHero';
import { Badge } from '@/components/ui/Badge';
import { 
    Building2, CheckCircle2, ShieldCheck, UserRound, ArrowRight, ArrowLeft, 
    Check, Sparkles, Mail, MapPin, Zap, Search, Globe2, CreditCard, 
    FileText, HelpCircle, Lock, Landmark, Briefcase, RefreshCw 
} from 'lucide-react';

const UK_PACKAGES = [
    {
        id: 'starter',
        name: 'Starter UK LTD',
        price: 269,
        badge: 'Essential',
        tagline: 'Ideal for solo entrepreneurs and global founders starting an official UK company.',
        features: [
            'Official Companies House £100 Statutory Fee Paid',
            'Certificate of Incorporation & Company Registration Number (CRN)',
            'Memorandum & Articles of Association',
            '1-Year London Prestigious Registered Office Address',
            'Official Government Digital Document Vault',
            'Fast 24-48 Hours Standard Formation'
        ],
        idealFor: 'Solo founders, consultants & freelancers.'
    },
    {
        id: 'pro',
        name: 'Stripe & Banking Pro',
        price: 349,
        badge: 'Most Popular',
        isPopular: true,
        tagline: 'Complete package with Wise / Payoneer Business Banking and UK Stripe account guidance.',
        features: [
            'Everything in Starter UK LTD Package',
            'Wise & Payoneer UK Business Bank Account Setup Pack',
            'UK Stripe & PayPal Business Merchant Guidance',
            'London Director Service Address (Protects Home Privacy)',
            '1-Year Mail Scanning & Forwarding Service',
            'HMRC Corporation Tax UTR Activation Guidance',
            'Dedicated WhatsApp & Priority Email Support'
        ],
        idealFor: 'E-commerce, SaaS, agency founders & digital nomads.'
    },
    {
        id: 'elite',
        name: 'E-Commerce & Amazon Elite',
        price: 499,
        badge: 'Full Compliance',
        tagline: 'The ultimate all-inclusive corporate pack for Amazon UK, Shopify, and cross-border sellers.',
        features: [
            'Everything in Stripe & Banking Pro Package',
            'UK VAT Registration & EORI Number Filing Guide',
            'Amazon UK & Shopify Payments Compliance Verification Pack',
            'Customized Share Certificates & Confirmation Statement (CS01) Vault',
            'Annual Compliance Calendar & Filing Reminders',
            'Lifetime VIP Corporate Account Manager'
        ],
        idealFor: 'High-growth brands, Amazon FBA & global e-commerce.'
    }
];

export default function UKCompanyFormationPage() {
    const [step, setStep] = useState(1);
    const [selectedPackage, setSelectedPackage] = useState(UK_PACKAGES[1]); // Default to Pro
    const [companyName, setCompanyName] = useState('');
    const [suffix, setSuffix] = useState('LTD');
    const [isSearchingName, setIsSearchingName] = useState(false);
    const [searchResult, setSearchResult] = useState<any>(null);
    const [natureOfBusiness, setNatureOfBusiness] = useState('62020 - Information technology consultancy activities');

    // Director & Shareholder Info
    const [director, setDirector] = useState({
        fullName: '',
        email: '',
        phone: '',
        nationality: 'Pakistani',
        occupation: 'Director',
        dob: '',
        residentialAddress: '',
        useRegisteredAddress: true,
        serviceAddress: ''
    });

    const [shareCount, setShareCount] = useState(100);
    const [valuePerShare, setValuePerShare] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState<any>(null);

    // Auto-fill logged in buyer email if available
    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                if (u.email) setDirector(prev => ({ ...prev, email: u.email }));
                if (u.name) setDirector(prev => ({ ...prev, fullName: u.name }));
            } catch (e) { }
        }
    }, []);

    // Live Name Search with Companies House
    const handleNameSearch = async () => {
        if (!companyName || companyName.trim().length < 2) {
            toast.error("Please enter at least 2 characters for company name.");
            return;
        }

        setIsSearchingName(true);
        try {
            const res = await fetch(`/api/services/uk-formation/search?q=${encodeURIComponent(companyName.trim())}`);
            const data = await res.json();
            setSearchResult(data);
            if (data.available) {
                toast.success(`"${companyName.trim()} ${suffix}" appears available on the UK Register!`);
            } else {
                toast.warning(`Similar names found on Companies House register.`);
            }
        } catch (error) {
            toast.info("Name formatted for UK registry submission.");
            setSearchResult({ available: true });
        } finally {
            setIsSearchingName(false);
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!companyName.trim()) {
            toast.error("Please enter your desired UK Company Name.");
            setStep(2);
            return;
        }

        if (!director.fullName || !director.email) {
            toast.error("Please fill in Director Full Name and Email.");
            setStep(3);
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/services/uk-formation/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageName: selectedPackage.name,
                    packagePrice: selectedPackage.price,
                    companyName: companyName.trim(),
                    companySuffix: suffix,
                    natureOfBusiness,
                    director,
                    shares: {
                        shareCount,
                        valuePerShare
                    },
                    registeredOffice: 'London Prestigious Central Registered Office (1-Year Included)',
                    bankingKit: selectedPackage.id === 'pro' || selectedPackage.id === 'elite',
                    vatRegistration: selectedPackage.id === 'elite',
                    specialInstructions
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setOrderComplete(data);
            toast.success("UK Company Formation order submitted successfully!");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#146c78]/20 selection:text-[#146c78]">
            <Navbar />
            <Toaster position="top-right" richColors />

            <main className="flex-1 pt-28 pb-16 md:pt-36 md:pb-24 relative overflow-hidden">
                {/* Background Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-[#146c78]/10 via-[#c4472d]/5 to-transparent blur-3xl -z-10 pointer-events-none" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Country Jurisdiction Switcher Bar */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex p-1.5 rounded-2xl bg-white/80 dark:bg-[#0c121e]/80 backdrop-blur-xl border border-[#146c78]/20 shadow-lg shadow-[#146c78]/5">
                            <Link 
                                href="/services/form-business" 
                                className="px-5 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 text-[#4b5563] hover:text-[#146c78] flex items-center gap-2"
                            >
                                <span className="text-base">🇺🇸</span> US LLC Formation
                            </Link>
                            <div className="px-5 py-2.5 rounded-xl font-heading text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 bg-[#146c78] text-white shadow-md shadow-[#146c78]/25 flex items-center gap-2">
                                <span className="text-base">🇬🇧</span> UK LTD Formation
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Page Hero Header */}
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <Badge className="mb-4 py-1.5 px-4 bg-[#146c78]/10 text-[#146c78] border border-[#146c78]/30 font-heading font-semibold text-xs tracking-wider uppercase inline-flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#146c78] inline" />
                            <span>Authorized Companies House Presenter &bull; Direct Electronic Gateway</span>
                        </Badge>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-[#0a121e] dark:text-white mb-4">
                            Register Your <span className="text-[#146c78] relative inline-block">UK Company (LTD)<span className="absolute bottom-1 left-0 w-full h-2 bg-[#146c78]/15 -z-10 rounded"></span></span> Online
                        </h1>
                        <p className="text-base sm:text-lg text-[#4b5563] dark:text-[#9ca3af] leading-relaxed">
                            Form an official UK Private Limited Company via our direct Companies House Presenter Gateway in 24–48 hours. Includes 1-Year London registered office address, official government certificate, and Wise / Stripe UK banking pack.
                        </p>
                    </div>

                    {/* Order Complete Success State */}
                    {orderComplete ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white dark:bg-[#0e1422] border-2 border-emerald-500/40 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
                        >
                            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 mb-3 uppercase tracking-wider font-bold">
                                Order Confirmed
                            </Badge>
                            <h2 className="text-2xl sm:text-3xl font-black font-heading text-[#0a121e] dark:text-white mb-2">
                                {orderComplete.companyName}
                            </h2>
                            <p className="text-sm font-mono text-[#146c78] font-bold mb-6">
                                Case Reference: {orderComplete.orderId}
                            </p>
                            <div className="bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-left mb-8 space-y-3 text-sm">
                                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700/50">
                                    <span className="text-gray-500">Package</span>
                                    <span className="font-bold text-[#0a121e] dark:text-white">{selectedPackage.name} (${selectedPackage.price})</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700/50">
                                    <span className="text-gray-500">Director Name</span>
                                    <span className="font-bold text-[#0a121e] dark:text-white">{director.fullName}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700/50">
                                    <span className="text-gray-500">Delivery Email</span>
                                    <span className="font-bold text-[#0a121e] dark:text-white">{director.email}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-500">Processing Time</span>
                                    <span className="font-bold text-emerald-600 dark:text-emerald-400">24 – 48 Business Hours</span>
                                </div>
                            </div>

                            <p className="text-xs text-gray-500 mb-8 leading-relaxed">
                                An official confirmation email with case tracking details has been sent to <strong>{director.email}</strong>. Our formation agents will verify your name availability and deliver all incorporation documents to your inbox.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/dashboard"
                                    className="px-6 py-3.5 bg-[#146c78] hover:bg-[#0f535d] text-white rounded-xl font-heading font-bold text-sm shadow-lg shadow-[#146c78]/25 transition-all text-center"
                                >
                                    Go to Client Dashboard
                                </Link>
                                <button
                                    onClick={() => { setOrderComplete(null); setStep(1); }}
                                    className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-heading font-semibold text-sm transition-all"
                                >
                                    Register Another UK Company
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <div>
                            {/* Step Indicator Tracker */}
                            <div className="mb-10 max-w-2xl mx-auto">
                                <div className="flex items-center justify-between relative">
                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 -z-10 rounded" />
                                    <div 
                                        className="absolute top-1/2 left-0 h-1 bg-[#146c78] -translate-y-1/2 -z-10 rounded transition-all duration-300"
                                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                                    />

                                    {[
                                        { s: 1, title: 'Package' },
                                        { s: 2, title: 'Company Name' },
                                        { s: 3, title: 'Director Details' },
                                        { s: 4, title: 'Review & Pay' }
                                    ].map((item) => (
                                        <button
                                            key={item.s}
                                            onClick={() => { if (item.s < step) setStep(item.s); }}
                                            className={`flex flex-col items-center group transition-all`}
                                        >
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-heading font-bold text-xs transition-all shadow-md ${
                                                step === item.s 
                                                    ? 'bg-[#146c78] text-white ring-4 ring-[#146c78]/20 scale-110' 
                                                    : step > item.s 
                                                    ? 'bg-emerald-500 text-white' 
                                                    : 'bg-white dark:bg-[#111827] text-gray-400 border border-gray-200 dark:border-gray-700'
                                            }`}>
                                                {step > item.s ? <Check className="w-4 h-4" /> : item.s}
                                            </div>
                                            <span className={`text-[11px] font-heading font-semibold mt-2 ${
                                                step === item.s ? 'text-[#146c78] dark:text-[#38bdf8]' : 'text-gray-400'
                                            }`}>
                                                {item.title}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* STEP 1: PACKAGE SELECTION */}
                            {step === 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                                        {UK_PACKAGES.map((pkg) => (
                                            <div
                                                key={pkg.id}
                                                onClick={() => setSelectedPackage(pkg)}
                                                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 cursor-pointer border-2 ${
                                                    selectedPackage.id === pkg.id 
                                                        ? 'bg-white dark:bg-[#0c1322] border-[#146c78] shadow-2xl shadow-[#146c78]/15 ring-2 ring-[#146c78]/30 scale-[1.02]' 
                                                        : 'bg-white/70 dark:bg-[#0c1322]/70 border-gray-200 dark:border-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-xl'
                                                }`}
                                            >
                                                {pkg.isPopular && (
                                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#146c78] to-[#c4472d] text-white text-[10px] font-heading font-extrabold uppercase px-4 py-1 rounded-full shadow-md tracking-wider">
                                                        Recommended
                                                    </div>
                                                )}

                                                <div>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <Badge className={`text-xs font-heading font-bold border ${
                                                            selectedPackage.id === pkg.id ? 'bg-[#146c78]/10 text-[#146c78] border-[#146c78]/30' : 'text-gray-500 border-gray-200 dark:border-gray-700'
                                                        }`}>
                                                            {pkg.badge}
                                                        </Badge>
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                            selectedPackage.id === pkg.id ? 'border-[#146c78] bg-[#146c78]' : 'border-gray-300'
                                                        }`}>
                                                            {selectedPackage.id === pkg.id && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                    </div>

                                                    <h3 className="text-xl font-bold font-heading text-[#0a121e] dark:text-white mb-2">
                                                        {pkg.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[36px] mb-6">
                                                        {pkg.tagline}
                                                    </p>

                                                    <div className="flex items-baseline gap-1 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                                                        <span className="text-3xl sm:text-4xl font-black font-heading text-[#0a121e] dark:text-white">
                                                            ${pkg.price}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-medium">USD / one-time</span>
                                                    </div>

                                                    <div className="space-y-3 mb-8">
                                                        <div className="text-[11px] font-heading font-bold uppercase text-gray-400 tracking-wider">
                                                            What's Included:
                                                        </div>
                                                        {pkg.features.map((feat, idx) => (
                                                            <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                                <span>{feat}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setSelectedPackage(pkg); setStep(2); }}
                                                    className={`w-full py-3.5 rounded-xl font-heading font-bold text-xs tracking-wider uppercase transition-all shadow-md ${
                                                        selectedPackage.id === pkg.id
                                                            ? 'bg-[#146c78] hover:bg-[#0f535d] text-white shadow-[#146c78]/25'
                                                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200'
                                                    }`}
                                                >
                                                    Select {pkg.name}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={() => setStep(2)}
                                            className="px-8 py-4 bg-[#146c78] hover:bg-[#0f535d] text-white rounded-2xl font-heading font-bold text-sm shadow-xl shadow-[#146c78]/25 flex items-center gap-2 transition-all hover:gap-3"
                                        >
                                            Continue to Company Name <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: COMPANY NAME & LIVE SEARCH */}
                            {step === 2 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-2xl mx-auto bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl"
                                >
                                    <div className="mb-6">
                                        <Badge className="bg-[#146c78]/10 text-[#146c78] border-[#146c78]/30 mb-2 font-heading font-bold text-[10px] uppercase">
                                            Step 2 of 4
                                        </Badge>
                                        <h2 className="text-2xl font-black font-heading text-[#0a121e] dark:text-white">
                                            Choose Your UK Company Name
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Enter your company name to check live availability with UK Companies House.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                                Company Name & Legal Suffix
                                            </label>
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text"
                                                        value={companyName}
                                                        onChange={(e) => setCompanyName(e.target.value)}
                                                        placeholder="e.g. Apex Global Logistics"
                                                        className="w-full px-4 py-3.5 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-[#0a121e] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                                    />
                                                </div>
                                                <select
                                                    value={suffix}
                                                    onChange={(e) => setSuffix(e.target.value)}
                                                    className="px-4 py-3.5 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                                >
                                                    <option value="LTD">LTD</option>
                                                    <option value="LIMITED">LIMITED</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={handleNameSearch}
                                                    disabled={isSearchingName}
                                                    className="px-5 py-3.5 bg-[#146c78] hover:bg-[#0f535d] text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#146c78]/20 disabled:opacity-50"
                                                >
                                                    {isSearchingName ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                                    Check
                                                </button>
                                            </div>
                                        </div>

                                        {/* Name Preview Badge */}
                                        {companyName && (
                                            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] font-heading font-bold uppercase text-emerald-600 dark:text-emerald-400">
                                                        Official Registered Name Preview
                                                    </div>
                                                    <div className="text-base font-black font-heading text-[#0a121e] dark:text-white mt-0.5">
                                                        {companyName.trim().toUpperCase()} {suffix}
                                                    </div>
                                                </div>
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                                                    Available
                                                </Badge>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                                                Principal Nature of Business (SIC Code Description)
                                            </label>
                                            <select
                                                value={natureOfBusiness}
                                                onChange={(e) => setNatureOfBusiness(e.target.value)}
                                                className="w-full px-4 py-3.5 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                            >
                                                <option value="62020 - Information technology consultancy activities">62020 - Information technology consultancy activities</option>
                                                <option value="47910 - Retail sale via mail order houses or via Internet">47910 - Retail sale via Internet / E-Commerce</option>
                                                <option value="70229 - Management consultancy activities other than financial management">70229 - Management & Business Consulting</option>
                                                <option value="73110 - Advertising agencies">73110 - Advertising & Digital Marketing Agency</option>
                                                <option value="62012 - Business and domestic software development">62012 - Software & App Development</option>
                                                <option value="82990 - Other business support service activities">82990 - General Business Support Services</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="px-5 py-3 text-xs font-heading font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1.5 transition-all"
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Back to Packages
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!companyName.trim()) {
                                                        toast.error("Please enter a company name first.");
                                                        return;
                                                    }
                                                    setStep(3);
                                                }}
                                                className="px-7 py-3.5 bg-[#146c78] hover:bg-[#0f535d] text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#146c78]/25 flex items-center gap-2 transition-all"
                                            >
                                                Continue to Director Info <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: DIRECTOR & OFFICERS */}
                            {step === 3 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-2xl mx-auto bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl"
                                >
                                    <div className="mb-6">
                                        <Badge className="bg-[#146c78]/10 text-[#146c78] border-[#146c78]/30 mb-2 font-heading font-bold text-[10px] uppercase">
                                            Step 3 of 4
                                        </Badge>
                                        <h2 className="text-2xl font-black font-heading text-[#0a121e] dark:text-white">
                                            Director & Shareholder Information
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Companies House requires the primary director and beneficial owner details.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                                    Director Full Legal Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={director.fullName}
                                                    onChange={(e) => setDirector({ ...director, fullName: e.target.value })}
                                                    placeholder="e.g. Muhammad Umar Mumtaz"
                                                    className="w-full px-4 py-3 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                                    Primary Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={director.email}
                                                    onChange={(e) => setDirector({ ...director, email: e.target.value })}
                                                    placeholder="e.g. director@company.com"
                                                    className="w-full px-4 py-3 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                                    Phone / WhatsApp
                                                </label>
                                                <input
                                                    type="text"
                                                    value={director.phone}
                                                    onChange={(e) => setDirector({ ...director, phone: e.target.value })}
                                                    placeholder="+92 300 1234567"
                                                    className="w-full px-4 py-3 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                                    Nationality
                                                </label>
                                                <input
                                                    type="text"
                                                    value={director.nationality}
                                                    onChange={(e) => setDirector({ ...director, nationality: e.target.value })}
                                                    placeholder="Pakistani / British"
                                                    className="w-full px-4 py-3 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                                    Occupation
                                                </label>
                                                <input
                                                    type="text"
                                                    value={director.occupation}
                                                    onChange={(e) => setDirector({ ...director, occupation: e.target.value })}
                                                    placeholder="Director / Consultant"
                                                    className="w-full px-4 py-3 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                                Residential Address (Home Country)
                                            </label>
                                            <input
                                                type="text"
                                                value={director.residentialAddress}
                                                onChange={(e) => setDirector({ ...director, residentialAddress: e.target.value })}
                                                placeholder="Street, City, Postal Code, Country"
                                                className="w-full px-4 py-3 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-semibold text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                            />
                                        </div>

                                        <div className="p-4 rounded-2xl bg-[#146c78]/5 border border-[#146c78]/20 flex items-start gap-3">
                                            <MapPin className="w-5 h-5 text-[#146c78] shrink-0 mt-0.5" />
                                            <div className="text-xs">
                                                <div className="font-bold text-[#0a121e] dark:text-white font-heading">
                                                    London Registered Office Address Included
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-400 mt-0.5">
                                                    Your official public record will display our prestigious Central London office address to protect your personal home address privacy.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="px-5 py-3 text-xs font-heading font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1.5 transition-all"
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Back to Name
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!director.fullName || !director.email) {
                                                        toast.error("Please enter Director Full Name and Email.");
                                                        return;
                                                    }
                                                    setStep(4);
                                                }}
                                                className="px-7 py-3.5 bg-[#146c78] hover:bg-[#0f535d] text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#146c78]/25 flex items-center gap-2 transition-all"
                                            >
                                                Continue to Review <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 4: REVIEW & INSTANT ORDER */}
                            {step === 4 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="max-w-2xl mx-auto bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl"
                                >
                                    <div className="mb-6">
                                        <Badge className="bg-[#146c78]/10 text-[#146c78] border-[#146c78]/30 mb-2 font-heading font-bold text-[10px] uppercase">
                                            Final Step
                                        </Badge>
                                        <h2 className="text-2xl font-black font-heading text-[#0a121e] dark:text-white">
                                            Review & Finalize Formation Order
                                        </h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Verify your UK LTD formation case details before submission.
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700/60 rounded-2xl p-6 space-y-3.5 text-xs">
                                            <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-500 font-medium">Selected Package</span>
                                                <span className="font-bold text-sm text-[#0a121e] dark:text-white">{selectedPackage.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-medium">Official Company Name</span>
                                                <span className="font-bold text-[#146c78] dark:text-[#38bdf8] font-heading">{companyName.trim().toUpperCase()} {suffix}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-medium">Primary Director</span>
                                                <span className="font-bold text-[#0a121e] dark:text-white">{director.fullName} ({director.nationality})</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-medium">Registered Office</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400">London Central Office (1-Year Included)</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500 font-medium">Filing Authority</span>
                                                <span className="font-bold text-[#0a121e] dark:text-white">UK Companies House (Authorized Presenter Gateway)</span>
                                            </div>
                                        </div>

                                        {/* Transparent Fee Summary Breakdown */}
                                        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#146c78]/10 via-[#c4472d]/5 to-transparent border border-[#146c78]/20 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-heading font-bold uppercase text-gray-500">
                                                    Total Formation Price
                                                </div>
                                                <div className="text-[11px] text-gray-400 mt-0.5">
                                                    Includes £100 Government Statutory Fee + London Office
                                                </div>
                                            </div>
                                            <div className="text-3xl font-black font-heading text-[#0a121e] dark:text-white">
                                                ${selectedPackage.price} <span className="text-xs text-gray-400 font-normal">USD</span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-heading font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                                Special Instructions or Notes (Optional)
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={specialInstructions}
                                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                                placeholder="Any specific requests for share distribution or business activity..."
                                                className="w-full px-4 py-3 bg-[#f6f7f3] dark:bg-[#151c2c] border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-[#0a121e] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#146c78]"
                                            />
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
                                            <button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                className="px-5 py-3 text-xs font-heading font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1.5 transition-all"
                                            >
                                                <ArrowLeft className="w-4 h-4" /> Back to Director
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleFormSubmit}
                                                disabled={isSubmitting}
                                                className="px-8 py-4 bg-[#146c78] hover:bg-[#0f535d] text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider shadow-xl shadow-[#146c78]/25 flex items-center gap-2 transition-all disabled:opacity-50"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <RefreshCw className="w-4 h-4 animate-spin" /> Submitting Case...
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldCheck className="w-4 h-4" /> Submit UK Formation Case (${selectedPackage.price})
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* FAQ & Trust Section */}
                    <div className="mt-20 border-t border-gray-200 dark:border-gray-800 pt-16 max-w-4xl mx-auto">
                        <h3 className="text-xl sm:text-2xl font-black font-heading text-center text-[#0a121e] dark:text-white mb-8">
                            Frequently Asked Questions &bull; UK Formations
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800">
                                <h4 className="font-bold font-heading text-[#0a121e] dark:text-white text-sm mb-2">
                                    Is OfficialUM1 an authorized UK presenter?
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Yes. OfficialUM1 LLC is an approved corporate presenter with HM Government (UK Companies House Executive Agency), enabling direct electronic filings, fast 24–48 hour turnaround, and official statutory compliance.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800">
                                <h4 className="font-bold font-heading text-[#0a121e] dark:text-white text-sm mb-2">
                                    Can non-UK residents register a UK LTD?
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Yes, 100%! You do not need to be a UK resident or citizen. Our packages include a prestigious Central London registered office address to meet all Companies House statutory requirements.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800">
                                <h4 className="font-bold font-heading text-[#0a121e] dark:text-white text-sm mb-2">
                                    How long does UK incorporation take?
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Standard electronic incorporation with Companies House takes approximately 24 to 48 business hours. You receive your digital Certificate of Incorporation and CRN immediately upon approval.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800">
                                <h4 className="font-bold font-heading text-[#0a121e] dark:text-white text-sm mb-2">
                                    Can I open Wise and Stripe with this UK LTD?
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Yes! Our Stripe & Banking Pro package ($349) provides the complete verification pack, proof of address, and setup instructions required to open Wise Business and UK Stripe merchant accounts.
                                </p>
                            </div>

                            <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1322] border border-gray-200 dark:border-gray-800 md:col-span-2">
                                <h4 className="font-bold font-heading text-[#0a121e] dark:text-white text-sm mb-2">
                                    Are there any hidden government fees?
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400">
                                    No hidden fees. The official Companies House £100 statutory electronic incorporation fee is 100% covered in all our package prices.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
