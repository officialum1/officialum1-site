"use client";
import { useState, useEffect } from 'react';
import { modernAlert } from '@/components/ModernUIOverlay';

export default function PlayerUpOfferCreator() {
    const [loading, setLoading] = useState(false);
    const [posterTitle, setPosterTitle] = useState('');
    const [posterPrice, setPosterPrice] = useState('50');
    const [posterDescription, setPosterDescription] = useState('');
    const [posterCategoryUrl, setPosterCategoryUrl] = useState('');

    // Generator States
    const [postKarma, setPostKarma] = useState(1200);
    const [commentKarma, setCommentKarma] = useState(5);
    const [ageString, setAgeString] = useState('2 years');
    const [ownership, setOwnership] = useState('Original Owner');
    const [delivery, setDelivery] = useState('Instant Delivery');

    const [postMin, setPostMin] = useState(100);
    const [postMax, setPostMax] = useState(2400);
    const [commentMin, setCommentMin] = useState(0);
    const [commentMax, setCommentMax] = useState(10);
    const [ageMin, setAgeMin] = useState(1);
    const [ageMax, setAgeMax] = useState(48);

    useEffect(() => {
        const savedUrl = localStorage.getItem('playerup_poster_url');
        if (savedUrl) setPosterCategoryUrl(savedUrl);
        handleGenerateDetails(true);
    }, []);

    // REAL-TIME SYNC: Update description whenever title, price or stats change
    useEffect(() => {
        updateDescription(posterTitle, postKarma, commentKarma, ageString, posterPrice, ownership, delivery);
    }, [posterTitle, postKarma, commentKarma, ageString, posterPrice, ownership, delivery]);

    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const formatAge = (monthsOld: number) => {
        if (monthsOld < 12) return `${monthsOld} months`;
        const years = Math.floor(monthsOld / 12);
        const months = monthsOld % 12;
        if (months === 0) return `${years} year${years > 1 ? 's' : ''}`;
        return `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''}`;
    };

    const updateDescription = (t: string, pk: number, ck: number, age: string, price: string, own: string, del: string) => {
        const descriptionText = `[CENTER][B][COLOR=yellow][SIZE=7]✨ Welcome to Officialum1 Premium Store ✨[/SIZE][/COLOR][/B]
[COLOR=deepskyblue][SIZE=6]Your Trusted Source for High-Quality Reddit Accounts[/SIZE][/COLOR]

[B][COLOR=magenta][SIZE=5]${t} 🔥[/SIZE][/COLOR][/B]

[COLOR=green]✅ ${pk} Post Karma – Reliable and verified Reddit account![/COLOR]  
[COLOR=orange]✅ ${ck} Comment Karma – Light thread activity![/COLOR]  
[COLOR=green]✅ Account Age: ${age} – Aged for authenticity and safety![/COLOR]  
[COLOR=cyan]✅ Ownership: ${own} – 100% secure and traceable![/COLOR]
[COLOR=white]✅ Delivery: ${del} – Fast and reliable service![/COLOR]
[COLOR=gold]💰 Price: Only $${price}![/COLOR]

[B][COLOR=magenta][SIZE=5]💳 Secure Payment Methods[/SIZE][/COLOR][/B]  
[COLOR=gold]✅ Crypto (BTC, LTC, BNB, SOL – All Coins Accepted)[/COLOR]  
[COLOR=orange]✅ PayPal | Wise | Stripe | Skrill | Apple Pay | Neteller | AliPay | Bank Transfer[/COLOR]

[B][COLOR=red][SIZE=5]📞 Contact Us Anytime[/SIZE][/COLOR][/B]  
[COLOR=yellow]📨 Telegram:[/COLOR] [URL=https://t.me/Officialum1][COLOR=deepskyblue]📱 @Officialum1[/COLOR][/URL]  
[COLOR=yellow]📞 WhatsApp:[/COLOR] [URL=https://wa.me/923237102924][COLOR=deepskyblue]📱 +923237102924[/COLOR][/URL]  
[COLOR=white]💬 Discord:[/COLOR] [URL=https://discord.gg/Officialum1][COLOR=deepskyblue]💻 Officialum1#5250[/COLOR][/URL]  
[COLOR=white]📹 Skype:[/COLOR] [URL=skype:umar.mumtaz37?call][COLOR=deepskyblue]💻 umar.mumtaz37[/COLOR][/URL]  
[COLOR=yellow]📷 Instagram:[/COLOR] [URL=https://www.instagram.com/officialum1][COLOR=deepskyblue]📸 officialum1[/COLOR][/URL]  
[COLOR=yellow]🐦 Twitter:[/COLOR] [URL=https://twitter.com/officialum1][COLOR=deepskyblue]🐦 officialum1[/COLOR][/URL]  
[COLOR=yellow]📘 Facebook:[/COLOR] [URL=https://www.facebook.com/officialum1][COLOR=deepskyblue]📘 officialum1[/COLOR][/URL]  
[COLOR=yellow]💬 WeChat:[/COLOR] [URL=https://web.wechat.com/][COLOR=deepskyblue]💬 iofficialum1[/COLOR][/URL]  
[COLOR=yellow]💬 Snapchat:[/COLOR] [URL=https://www.snapchat.com/add/iofficialum][COLOR=deepskyblue]👻 iofficialum[/COLOR][/URL]  
[COLOR=yellow]📧 Email:[/COLOR] [URL=mailto:hello@officialum1.com][COLOR=deepskyblue]📧 hello@officialum1.com[/COLOR][/URL]

[COLOR=green]Thank you for choosing Officialum1! 🙏[/COLOR][/CENTER]`;
        setPosterDescription(descriptionText);
    };

    const handleGenerateDetails = (updateTitle = true) => {
        const pk = getRandomInt(postMin, postMax);
        const ck = getRandomInt(commentMin, commentMax);
        const monthsOld = getRandomInt(ageMin, ageMax);
        const age = formatAge(monthsOld);
        const p = Math.round(pk / 100) + 10;

        const titleText = `Reddit Account | ${pk} Post Karma | ${ck} Comment Karma | ${age} Old | Just $${p}!`;

        setPostKarma(pk);
        setCommentKarma(ck);
        setAgeString(age);
        if (updateTitle) setPosterTitle(titleText);
        setPosterPrice(p.toString());
    };

    const handleTurboPost = async () => {
        if (!posterTitle || !posterCategoryUrl) {
            modernAlert("Missing Info", "Please enter a title and the category URL.", "error");
            return;
        }

        setLoading(true);
        try {
            localStorage.setItem('playerup_poster_url', posterCategoryUrl);

            window.dispatchEvent(new CustomEvent('OFFICIALUM1_POST_THREAD', {
                detail: {
                    title: posterTitle,
                    price: posterPrice,
                    description: posterDescription,
                    categoryUrl: posterCategoryUrl,
                    postKarma,
                    commentKarma,
                    ageString,
                    ownership,
                    delivery
                }
            }));

            modernAlert("Posting Started", "The thread is being created in the background. 🛰️", "success");
            // Auto-generate next one to keep moving
            handleGenerateDetails(true);
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
                        ⚡ Reddit Account Creator
                        <span className="text-xs bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest">Reddit Specialist</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Smart randomization for Reddit listings with premium BBCode descriptions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* SETTINGS PANEL */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gray-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                            <span className="text-lg">⚙️</span> Generator Logic
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">Post Karma Range</label>
                                <div className="flex gap-2">
                                    <input type="number" value={postMin} onChange={e => setPostMin(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" placeholder="Min" />
                                    <input type="number" value={postMax} onChange={e => setPostMax(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" placeholder="Max" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">Comment Karma Range</label>
                                <div className="flex gap-2">
                                    <input type="number" value={commentMin} onChange={e => setCommentMin(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" placeholder="Min" />
                                    <input type="number" value={commentMax} onChange={e => setCommentMax(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" placeholder="Max" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">Account Age (Months)</label>
                                <div className="flex gap-2">
                                    <input type="number" value={ageMin} onChange={e => setAgeMin(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" placeholder="Min" />
                                    <input type="number" value={ageMax} onChange={e => setAgeMax(parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white" placeholder="Max" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">Ownership Status</label>
                                <select value={ownership} onChange={e => setOwnership(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
                                    <option>Original Owner (OO)</option>
                                    <option>Reseller (Safe)</option>
                                    <option>Aged Repost</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">Delivery Method</label>
                                <select value={delivery} onChange={e => setDelivery(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white">
                                    <option>Instant Delivery</option>
                                    <option>Manual Delivery (1-12h)</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={() => handleGenerateDetails(true)}
                            className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white py-3 rounded-2xl font-bold text-sm transition-all border border-white/10"
                        >
                            🎲 Re-Roll Details
                        </button>
                    </div>

                    <div className="bg-gray-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                        <label className="text-[10px] text-gray-500 uppercase font-black mb-2 block">PlayerUp Category URL</label>
                        <input
                            type="text"
                            placeholder="https://www.playerup.com/forums/.../create-thread"
                            value={posterCategoryUrl}
                            onChange={(e) => setPosterCategoryUrl(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-cyan-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* EDITOR PANEL */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900/50 border border-orange-500/20 p-8 rounded-[40px] shadow-2xl backdrop-blur-xl">
                        <div className="mb-8">
                            <label className="text-[10px] text-orange-400 uppercase font-black tracking-widest mb-3 block">Offer Title (Auto-Generated or Manual)</label>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-700 focus:border-orange-500 outline-none transition-all text-xl font-bold shadow-inner"
                                    value={posterTitle}
                                    onChange={(e) => setPosterTitle(e.target.value)}
                                    placeholder="Click Roll Details to generate..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleTurboPost()}
                                />
                                <div className="flex flex-col">
                                    <label className="text-[10px] text-gray-500 uppercase font-black mb-1">Price ($)</label>
                                    <input
                                        type="text"
                                        value={posterPrice}
                                        onChange={(e) => setPosterPrice(e.target.value)}
                                        className="w-20 bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-center text-lg font-bold text-orange-400"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3 block">Description (Premium BBCode Layout)</label>
                            <textarea
                                className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 text-xs text-gray-400 font-mono focus:border-orange-500 outline-none h-64 resize-none transition-all"
                                value={posterDescription}
                                onChange={(e) => setPosterDescription(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={handleTurboPost}
                            disabled={loading || !posterTitle}
                            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-5 rounded-3xl font-black text-lg uppercase tracking-widest transition-all shadow-2xl shadow-orange-600/30 active:scale-[0.98] disabled:opacity-30"
                        >
                            {loading ? '🛰️ SENDING TO PLAYERUP...' : '🚀 POST OFFER NOW'}
                        </button>

                        <div className="mt-6 flex justify-center">
                            <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">Automatically fills all fields 🛰️ No browser work needed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
