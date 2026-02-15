"use client";
import { useState, useEffect } from 'react';
import { modernAlert } from '@/components/ModernUIOverlay';

export default function PlayerUpOfferCreator() {
    const [loading, setLoading] = useState(false);
    const [posterTitle, setPosterTitle] = useState('');
    const [posterPrice, setPosterPrice] = useState('50');
    const [posterDescription, setPosterDescription] = useState('Best quality account. Fast delivery. Contact on Telegram @OfficialUM1');
    const [posterCategoryUrl, setPosterCategoryUrl] = useState('');

    useEffect(() => {
        const savedUrl = localStorage.getItem('playerup_poster_url');
        const savedPrice = localStorage.getItem('playerup_poster_price');
        const savedDesc = localStorage.getItem('playerup_poster_desc');
        if (savedUrl) setPosterCategoryUrl(savedUrl);
        if (savedPrice) setPosterPrice(savedPrice);
        if (savedDesc) setPosterDescription(savedDesc);
    }, []);

    const handleTurboPost = async () => {
        if (!posterTitle || !posterCategoryUrl) {
            modernAlert("Missing Info", "Please enter a title and the category URL.", "error");
            return;
        }

        setLoading(true);
        try {
            localStorage.setItem('playerup_poster_url', posterCategoryUrl);
            localStorage.setItem('playerup_poster_price', posterPrice);
            localStorage.setItem('playerup_poster_desc', posterDescription);

            window.dispatchEvent(new CustomEvent('OFFICIALUM1_POST_THREAD', {
                detail: {
                    title: posterTitle,
                    price: posterPrice,
                    description: posterDescription,
                    categoryUrl: posterCategoryUrl
                }
            }));

            modernAlert("Posting Started", "The thread is being created in the background. 🛰️", "success");
            setPosterTitle('');
        } catch (e) {
            console.error(e);
            modernAlert("Error", "Failed to start posting process.", "error");
        }
        setLoading(false);
    };

    return (
        <div className="FadeIn p-4">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        ⚡ PlayerUp Offer Creator
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full border border-cyan-500/20 uppercase tracking-widest">Generator</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Create multiple offers quickly without mixing with the command center.</p>
                </div>
            </div>

            <div className="bg-gray-900/50 border border-cyan-500/20 p-8 rounded-[32px] shadow-2xl backdrop-blur-xl">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h3 className="text-cyan-400 font-bold text-lg flex items-center gap-2">
                            <span className="text-2xl">🚀</span> Quick Offer Generator
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">Type title only &rarr; Hit Post &rarr; Done.</p>
                    </div>
                    <div className="flex gap-6">
                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest">Target Price ($)</label>
                            <input
                                type="text"
                                value={posterPrice}
                                onChange={(e) => setPosterPrice(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none w-24 transition-all"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-[10px] text-gray-400 uppercase font-black mb-2 tracking-widest">Category Posting URL</label>
                            <input
                                type="text"
                                placeholder="https://www.playerup.com/forums/.../create-thread"
                                value={posterCategoryUrl}
                                onChange={(e) => setPosterCategoryUrl(e.target.value)}
                                className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-500 outline-none w-80 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Offer Title</label>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Enter what you are selling... (e.g. Reddit 5k Karma Account)"
                                className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-600 focus:border-cyan-500 outline-none transition-all text-lg font-bold shadow-inner"
                                value={posterTitle}
                                onChange={(e) => setPosterTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTurboPost()}
                            />
                            <button
                                onClick={handleTurboPost}
                                disabled={loading || !posterTitle}
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black px-12 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-30"
                            >
                                {loading ? 'Posting...' : '🚀 POST OFFER'}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Description Template</label>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 text-sm text-gray-400 focus:border-cyan-500 outline-none h-40 resize-none transition-all"
                            value={posterDescription}
                            onChange={(e) => setPosterDescription(e.target.value)}
                            placeholder="Detailed description here..."
                        />
                    </div>
                </div>

                <div className="mt-8 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                    <p className="text-cyan-400/60 text-xs leading-relaxed">
                        💡 <b>Pro Tip:</b> You can create 5-10 offers in a row by just changing the title and hitting Enter.
                        The extension handles the form filling and posting automatically in the background.
                    </p>
                </div>
            </div>
        </div>
    );
}
