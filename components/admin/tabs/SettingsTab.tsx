"use client";

interface SettingsTabProps {
    settings: any;
    setSettings: (settings: any) => void;
    handleSaveSettings: (e: any) => Promise<void>;
    handleUpdateAdminProfile: (e: any) => Promise<void>;
}

export default function SettingsTab({
    settings,
    setSettings,
    handleSaveSettings,
    handleUpdateAdminProfile
}: SettingsTabProps) {
    return (
        <div className="FadeIn">
            <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>

                <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Admin Security</h2>
                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Change Admin Credentials</h3>
                    <form onSubmit={handleUpdateAdminProfile} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) auto', alignItems: 'end' }}>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>New Email (Optional)</label>
                            <input type="email" name="email" placeholder="admin@example.com" className="input-field" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                            <input type="password" name="password" placeholder="New Password" className="input-field" style={{ width: '100%' }} />
                        </div>
                        <div>
                            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Update Profile</button>
                        </div>
                    </form>
                </div>

                <h2 style={{ color: '#00ff88', marginBottom: '0.5rem' }}>Core System Configuration</h2>
                <p style={{ color: '#666', marginBottom: '2.5rem' }}>Global platform settings and API integrations.</p>

                <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: '2rem' }}>
                    {/* Twitter */}
                    <div style={{ padding: '1.5rem', background: 'rgba(29, 161, 242, 0.1)', borderRadius: '12px' }}>
                        <h3 style={{ color: '#1DA1F2', marginBottom: '1rem' }}>Twitter / X</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>API Key</label><input type="password" value={settings.twitter_api_key || ''} onChange={e => setSettings({ ...settings, twitter_api_key: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>API Secret</label><input type="password" value={settings.twitter_api_secret || ''} onChange={e => setSettings({ ...settings, twitter_api_secret: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Token</label><input type="password" value={settings.twitter_access_token || ''} onChange={e => setSettings({ ...settings, twitter_access_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Secret</label><input type="password" value={settings.twitter_access_secret || ''} onChange={e => setSettings({ ...settings, twitter_access_secret: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                        </div>
                    </div>

                    {/* Facebook */}
                    <div style={{ padding: '1.5rem', background: 'rgba(24, 119, 242, 0.1)', borderRadius: '12px' }}>
                        <h3 style={{ color: '#1877F2', marginBottom: '1rem' }}>Facebook Page</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Page ID</label><input type="text" value={settings.facebook_page_id || ''} onChange={e => setSettings({ ...settings, facebook_page_id: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Page Access Token</label><input type="password" value={settings.facebook_page_token || ''} onChange={e => setSettings({ ...settings, facebook_page_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                        </div>
                    </div>

                    {/* LinkedIn */}
                    <div style={{ padding: '1.5rem', background: 'rgba(0, 119, 181, 0.1)', borderRadius: '12px' }}>
                        <h3 style={{ color: '#0077b5', marginBottom: '1rem' }}>LinkedIn</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Person URN</label><input type="text" value={settings.linkedin_person_urn || ''} onChange={e => setSettings({ ...settings, linkedin_person_urn: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Token</label><input type="password" value={settings.linkedin_access_token || ''} onChange={e => setSettings({ ...settings, linkedin_access_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                        </div>
                    </div>

                    {/* Telegram */}
                    <div style={{ padding: '1.5rem', background: 'rgba(0, 136, 204, 0.1)', borderRadius: '12px' }}>
                        <h3 style={{ color: '#0088cc', marginBottom: '1rem' }}>Telegram Channel</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Bot Token</label><input type="password" value={settings.telegram_bot_token || ''} onChange={e => setSettings({ ...settings, telegram_bot_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Chat ID (e.g. @channelname)</label><input type="text" value={settings.telegram_chat_id || ''} onChange={e => setSettings({ ...settings, telegram_chat_id: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                        </div>
                    </div>

                    {/* Discord */}
                    <div style={{ padding: '1.5rem', background: 'rgba(114, 137, 218, 0.1)', borderRadius: '12px' }}>
                        <h3 style={{ color: '#7289da', marginBottom: '1rem' }}>Discord Command Center</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Webhook URL (Sales Pings)</label><input type="password" value={settings.discord_webhook_url || ''} onChange={e => setSettings({ ...settings, discord_webhook_url: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Discord API Key (Remote Fulfillment)</label><input type="password" value={settings.discord_api_key || ''} onChange={e => setSettings({ ...settings, discord_api_key: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                        </div>
                    </div>

                    {/* G2G Master Switch */}
                    <div style={{ padding: '1.5rem', background: 'rgba(255, 170, 0, 0.1)', borderRadius: '12px' }}>
                        <h3 style={{ color: '#ffaa00', marginBottom: '1rem' }}>G2G Automation Master</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.g2g_auto_pilot === 'true'}
                                        onChange={e => setSettings({ ...settings, g2g_auto_pilot: e.target.checked ? 'true' : 'false' })}
                                        style={{ width: '20px', height: '20px' }}
                                    />
                                    <span style={{ color: '#fff' }}>Enable Auto-Pilot Fulfillment</span>
                                </label>
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                When enabled, "Paid" G2G orders for accounts will be fulfilled automatically using available stock.
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1rem', borderTop: '1px solid rgba(255,170,0,0.2)', paddingTop: '1.5rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffaa00' }}>G2G API Key</label>
                                    <input type="password" value={settings.g2g_api_key || ''} onChange={e => setSettings({ ...settings, g2g_api_key: e.target.value })} className="input-field" style={{ width: '100%' }} placeholder="From G2G Settings" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffaa00' }}>G2G Secret Key</label>
                                    <input type="password" value={settings.g2g_secret_key || ''} onChange={e => setSettings({ ...settings, g2g_secret_key: e.target.value })} className="input-field" style={{ width: '100%' }} placeholder="From G2G Settings" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffaa00' }}>G2G User ID</label>
                                    <input type="text" value={settings.g2g_user_id || ''} onChange={e => setSettings({ ...settings, g2g_user_id: e.target.value })} className="input-field" style={{ width: '100%' }} placeholder="e.g. 7788063" />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffaa00' }}>Order Webhook Secret</label>
                                    <input type="password" value={settings.g2g_order_webhook_secret || ''} onChange={e => setSettings({ ...settings, g2g_order_webhook_secret: e.target.value })} className="input-field" style={{ width: '100%' }} placeholder="Verify Signature" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#ffaa00' }}>Offer Webhook Secret</label>
                                    <input type="password" value={settings.g2g_offer_webhook_secret || ''} onChange={e => setSettings({ ...settings, g2g_offer_webhook_secret: e.target.value })} className="input-field" style={{ width: '100%' }} placeholder="Verify Signature" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Instagram */}
                    <div style={{ padding: '1.5rem', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '12px' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Instagram Business</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#eee' }}>IG User ID (Linked to FB Page)</label><input type="text" value={settings.instagram_user_id || ''} onChange={e => setSettings({ ...settings, instagram_user_id: e.target.value })} className="input-field" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff' }} /></div>
                        </div>
                    </div>

                    {/* Referral System */}
                    <div style={{ padding: '1.5rem', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.1)' }}>
                        <h3 style={{ color: '#ffd700', marginBottom: '1rem' }}>Referral & Affiliate System</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Global Commission Rate (%)</label>
                                <input
                                    type="number"
                                    placeholder="10"
                                    value={settings.referral_commission_rate || ''}
                                    onChange={e => setSettings({ ...settings, referral_commission_rate: e.target.value })}
                                    className="input-field"
                                    style={{ width: '100%' }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>Percentage each user gets from their referral's successful purchases.</p>
                            </div>
                        </div>
                    </div>

                    {/* External Services */}
                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                        <h3 style={{ marginBottom: '1rem', color: '#fff' }}>External Services</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Moz Access ID (SEO)</label><input value={settings.mozId || ''} onChange={e => setSettings({ ...settings, mozId: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Moz Secret Key</label><input type="password" value={settings.mozKey || ''} onChange={e => setSettings({ ...settings, mozKey: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>

                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Gemini API Key (AI Blog & Marketing)</label><input type="password" value={settings.geminiKey || ''} onChange={e => setSettings({ ...settings, geminiKey: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>OpenAI API Key (AI Backup)</label><input type="password" value={settings.openaiKey || ''} onChange={e => setSettings({ ...settings, openaiKey: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            <div>
                                <label style={{ color: '#aaa', fontSize: '0.8rem' }}>Default Marketing AI Model</label>
                                <select
                                    value={settings.marketing_ai_model || 'gemini'}
                                    onChange={e => setSettings({ ...settings, marketing_ai_model: e.target.value })}
                                    className="input-field"
                                    style={{ width: '100%' }}
                                >
                                    <option value="gemini">Google Gemini 1.5 Flash (Fast)</option>
                                    <option value="openai">OpenAI GPT-4o-mini (Professional)</option>
                                </select>
                            </div>

                            <h4 style={{ color: '#aaa', marginTop: '1rem' }}>SMTP Email Server</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Host</label><input value={settings.smtpHost || ''} onChange={e => setSettings({ ...settings, smtpHost: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>User</label><input value={settings.smtpUser || ''} onChange={e => setSettings({ ...settings, smtpUser: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Password</label><input type="password" value={settings.smtpPass || ''} onChange={e => setSettings({ ...settings, smtpPass: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>💾 Save Configuration</button>
                </form>

                {/* DANGER ZONE */}
                <div style={{ marginTop: '3rem', padding: '2rem', border: '1px solid #ff4444', borderRadius: '16px', background: 'rgba(255, 68, 68, 0.05)' }}>
                    <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>Danger Zone</h3>
                    <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>This action will wipe all inventory, sales history, and social posts. It cannot be undone.</p>
                    <button
                        type="button"
                        onClick={async () => {
                            if (confirm('⚠️ ARE YOU SURE? This will DELETE ALL DATA forever.')) {
                                if (confirm('Really? Click OK to confirm wiping your entire database.')) {
                                    await fetch('/api/admin/reset', { method: 'POST' });
                                    alert('System Reset Complete.');
                                    window.location.reload();
                                }
                            }
                        }}
                        className="btn"
                        style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '1rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        🗑️ RESET SYSTEM / CLEAR ALL DATA
                    </button>
                </div>
            </div>
        </div>
    );
}
