"use client";

import { useState, useEffect } from 'react';
import Footer from '@/components/Footer';
import { AdminShell } from '@/components/admin/AdminShell';

export default function PaymentSettings() {
    const [settings, setSettings] = useState({
        stripePublishableKey: '',
        stripeSecretKey: '',
        cryptomusMerchantId: '',
        cryptomusPaymentKey: '',
        binanceApiKey: '',
        binanceSecretKey: '',
        manualPaymentInstructions: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (e) {
            console.error("Failed to load settings", e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) alert('Payment and API Settings Saved!');
            else alert('Failed to save settings');
        } catch (e) {
            alert('Error saving settings');
        }
    };

    if (loading) return <div style={{ color: '#fff', padding: '100px', textAlign: 'center' }}>Loading...</div>;

    return (
        <AdminShell title="Payments" subtitle="Configure payment gateways and API keys.">
            <div style={{ maxWidth: '800px' }}>

                <form onSubmit={handleSave} className="space-y-8">

                    {/* Stripe */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded bg-[#635BFF] flex items-center justify-center font-bold text-white">S</div>
                            <h2 className="text-xl font-semibold">Stripe (Credit Cards)</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Publishable Key</label>
                                <input
                                    name="stripePublishableKey"
                                    value={settings.stripePublishableKey}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="pk_test_..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Secret Key</label>
                                <input
                                    name="stripeSecretKey"
                                    value={settings.stripeSecretKey}
                                    onChange={handleChange}
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="sk_test_..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cryptomus */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded bg-[#FFA500] flex items-center justify-center font-bold text-black">C</div>
                            <h2 className="text-xl font-semibold">Cryptomus (Crypto)</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Merchant ID</label>
                                <input
                                    name="cryptomusMerchantId"
                                    value={settings.cryptomusMerchantId}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Payment API Key</label>
                                <input
                                    name="cryptomusPaymentKey"
                                    value={settings.cryptomusPaymentKey}
                                    onChange={handleChange}
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-orange-500 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Binance Pay */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded bg-[#FCD535] flex items-center justify-center font-bold text-black">B</div>
                            <h2 className="text-xl font-semibold">Binance Pay</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">API Key</label>
                                <input
                                    name="binanceApiKey"
                                    value={settings.binanceApiKey}
                                    onChange={handleChange}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Secret Key</label>
                                <input
                                    name="binanceSecretKey"
                                    value={settings.binanceSecretKey}
                                    onChange={handleChange}
                                    type="password"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Manual / Bank Transfer */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded bg-gray-600 flex items-center justify-center font-bold text-white">M</div>
                            <h2 className="text-xl font-semibold">Manual / Bank Transfer Instructions</h2>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Payment Instructions (Shown at Checkout)</label>
                            <textarea
                                name="manualPaymentInstructions"
                                value={settings.manualPaymentInstructions}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-gray-500 transition-colors h-32"
                                placeholder="Bank Name: Example Bank&#10;Account No: 12345678&#10;Send screenshot to support..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-[#00ff88] to-[#00cc6a] text-black font-bold py-3 px-8 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[#00ff88]/20"
                        >
                            Save Changes
                        </button>
                    </div>

                </form>
            </div>
            <Footer />
        </AdminShell>
    );
}
