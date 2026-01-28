"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function GlobalSettings() {
    const [settings, setSettings] = useState<any>({});
    const [banner, setBanner] = useState({
        enabled: false,
        text: '',
        color: '#ff4d4d',
        link: ''
    });
    const [bonusAmount, setBonusAmount] = useState('0.05');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                setSettings(data);
                if (data.announcement_banner) {
                    try {
                        setBanner(JSON.parse(data.announcement_banner));
                    } catch { }
                }
                if (data.daily_bonus_amount) {
                    setBonusAmount(data.daily_bonus_amount);
                }
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        const payload = {
            ...settings,
            announcement_banner: JSON.stringify(banner),
            daily_bonus_amount: bonusAmount
        };

        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            alert('Settings Saved Successfully! 💾');
        } catch {
            alert('Failed to save settings');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '150px' }}>Loading Settings...</div>;

    return (
        <main>
            <Navbar />
            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '800px' }}>
                <a href="/admin/dashboard" style={{ color: '#888', marginBottom: '1rem', display: 'inline-block' }}>← Back to Dashboard</a>
                <h1 style={{ marginBottom: '2rem' }}>Global Settings ⚙️</h1>

                {/* Announcement Banner Section */}
                <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h3>📢 Global Announcement Banner</h3>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={banner.enabled}
                                onChange={e => setBanner({ ...banner, enabled: e.target.checked })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Banner Text</label>
                            <input
                                className="input-field"
                                value={banner.text}
                                onChange={e => setBanner({ ...banner, text: e.target.value })}
                                placeholder="e.g. ⚡ Flash Sale! 50% Off Everything!"
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Link URL (Optional)</label>
                                <input
                                    className="input-field"
                                    value={banner.link}
                                    onChange={e => setBanner({ ...banner, link: e.target.value })}
                                    placeholder="/shop"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Color</label>
                                <input
                                    type="color"
                                    value={banner.color}
                                    onChange={e => setBanner({ ...banner, color: e.target.value })}
                                    style={{ height: '48px', width: '60px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#111', borderRadius: '12px' }}>
                        <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Preview:</p>
                        {banner.enabled ? (
                            <div style={{
                                background: banner.color,
                                color: 'white',
                                padding: '10px',
                                textAlign: 'center',
                                borderRadius: '8px',
                                fontWeight: 'bold'
                            }}>
                                {banner.text || "Banner Text Here"}
                            </div>
                        ) : (
                            <div style={{ color: '#444', fontStyle: 'italic' }}>Banner is disabled</div>
                        )}
                    </div>
                </section>

                {/* Daily Bonus Section */}
                <section className="glass" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
                    <h3>💰 Daily Login Bonus</h3>
                    <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.9rem' }}>Amount users receive every 24 hours.</p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>$</span>
                        <input
                            type="number"
                            step="0.01"
                            className="input-field"
                            value={bonusAmount}
                            onChange={e => setBonusAmount(e.target.value)}
                            style={{ maxWidth: '150px' }}
                        />
                    </div>
                </section>

                <button onClick={handleSave} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.2rem' }}>
                    Save All Changes
                </button>

            </div>
            <Footer />
            <style jsx>{`
                .switch { position: relative; display: inline-block; width: 60px; height: 34px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 34px; }
                .slider:before { position: absolute; content: ""; height: 26px; width: 26px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
                input:checked + .slider { background-color: #00ff88; }
                input:focus + .slider { box-shadow: 0 0 1px #00ff88; }
                input:checked + .slider:before { transform: translateX(26px); }
            `}</style>
        </main>
    );
}
