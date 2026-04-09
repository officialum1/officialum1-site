"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AccountBuilderPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [isVip, setIsVip] = useState(false);
    const router = useRouter();

    const [request, setRequest] = useState({
        platform: "",
        niche: "",
        requirements: "",
        budget: ""
    });

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            const u = JSON.parse(stored);
            setUser(u);
            // Check VIP status (Diamond, Gold, Silver)
            if (u.membership && u.membership !== 'none' && u.membership !== '') {
                setIsVip(true);
            }
        }
        setLoading(false);
    }, []);

    const handleChange = (e: any) => {
        setRequest({ ...request, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!request.platform || !request.niche || !request.requirements || !request.budget) {
            toast.error("Please fill all fields!");
            return;
        }

        try {
            const res = await fetch('/api/builder/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...request, userId: user.id })
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Request submitted! Our team will contact you shortly.");
                setStep(4); // Success step
            } else {
                toast.error(data.error || "Something went wrong.");
            }
        } catch (e) {
            toast.error("Failed to submit request.");
        }
    };

    if (loading) return <div className="loading-screen">Loading...</div>;

    if (!user) {
        return (
            <main className="min-h-screen bg-[#050505]">
                <Navbar />
                <div className="container py-32 text-center">
                    <h1 className="text-4xl font-bold mb-6">Access Restricted</h1>
                    <p className="text-gray-400 mb-8">Please login to access the Account Builder Wizard.</p>
                    <button onClick={() => router.push('/login')} className="btn btn-primary">Login Now</button>
                </div>
                <Footer />
            </main>
        );
    }

    if (!isVip) {
        return (
            <main className="min-h-screen bg-[#050505]">
                <Navbar />
                <div className="container py-32">
                    <div className="glass max-w-2xl mx-auto p-12 rounded-3xl text-center border border-yellow-500/30">
                        <div className="text-6xl mb-6">🛡️</div>
                        <h1 className="text-3xl font-bold mb-4">VIP Feature Detected</h1>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            The **Account Builder Wizard** is an exclusive tool reserved for our **VIP Diamond, Gold, and Silver** members.
                            This tool allows you to request custom-made accounts with specific stats, niches, and followers.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => router.push('/membership')} className="btn btn-primary w-full py-4 text-lg bg-yellow-500 text-black hover:bg-yellow-600 transition-all font-bold">
                                Upgrade to VIP Now 🚀
                            </button>
                            <button onClick={() => router.push('/shop')} className="text-gray-500 hover:text-white transition-colors">
                                Return to Shop
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="container py-32">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-4 text-gradient">🛠️ Account Builder Wizard</h1>
                        <p className="text-gray-400">Custom-tailored assets built to your exact specifications.</p>
                    </div>

                    <div className="glass p-8 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden">
                        {/* Progress Bar */}
                        <div className="h-1 bg-white/5 w-full mb-12 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold mb-8">Step 1: Choose Your Platform</h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        {['Instagram', 'Twitter', 'TikTok', 'YouTube', 'Discord', 'Steam', 'Facebook', 'Other'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setRequest({ ...request, platform: p })}
                                                className={`p-4 rounded-xl border transition-all ${request.platform === p ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => step < 3 && request.platform && setStep(2)}
                                        className="btn btn-primary w-full py-4 text-lg disabled:opacity-50"
                                        disabled={!request.platform}
                                    >
                                        Next Component
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold mb-8">Step 2: Niche & Target Audience</h2>
                                    <div className="space-y-6 mb-8">
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-2">Primary Niche (e.g. Fitness, Gaming, Crypto)</label>
                                            <input
                                                type="text"
                                                name="niche"
                                                value={request.niche}
                                                onChange={handleChange}
                                                placeholder="Enter desired niche..."
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-2">Specific Requirements (Min Stats, Verification, Age)</label>
                                            <textarea
                                                name="requirements"
                                                value={request.requirements}
                                                onChange={handleChange}
                                                placeholder="I need 10k real followers, 1-year age, and OG email..."
                                                className="input-field w-full h-32"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(1)} className="btn btn-outline flex-1 py-4">Back</button>
                                        <button
                                            onClick={() => step < 3 && request.niche && request.requirements && setStep(3)}
                                            className="btn btn-primary flex-[2] py-4 disabled:opacity-50"
                                            disabled={!request.niche || !request.requirements}
                                        >
                                            Next Component
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <h2 className="text-2xl font-bold mb-8">Step 3: Budget & Timeline</h2>
                                    <div className="space-y-6 mb-8">
                                        <div>
                                            <label className="block text-sm text-gray-500 mb-2">Estimated Budget ($ USD)</label>
                                            <input
                                                type="number"
                                                name="budget"
                                                value={request.budget}
                                                onChange={handleChange}
                                                placeholder="Enter your maximum budget..."
                                                className="input-field w-full"
                                            />
                                        </div>
                                        <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/20">
                                            <p className="text-sm text-blue-400">
                                                💡 **Notice:** Custom builds typically take 24-72 hours. Our team will verify your budget and requirements before starting.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(2)} className="btn btn-outline flex-1 py-4">Back</button>
                                        <button
                                            onClick={handleSubmit}
                                            className="btn btn-primary flex-[2] py-4 bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:scale-[1.02]"
                                        >
                                            Submit Construction Request
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="text-7xl mb-6">✅</div>
                                    <h2 className="text-3xl font-bold mb-4">Request Sent!</h2>
                                    <p className="text-gray-400 mb-10 max-w-md mx-auto">
                                        Your custom account specifications have been transmitted to our senior fulfillment team.
                                        Expect a response via email or dashboard notification within 24 hours.
                                    </p>
                                    <button onClick={() => router.push('/dashboard')} className="btn btn-primary px-8">View My Account</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Footer />

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                }
                .text-gradient {
                    background: linear-gradient(135deg, #fff 0%, #888 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .input-field {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    color: white;
                    outline: none;
                    transition: all 0.3s;
                }
                .input-field:focus {
                    border-color: #3b82f6;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
                }
            `}</style>
        </main>
    );
}
