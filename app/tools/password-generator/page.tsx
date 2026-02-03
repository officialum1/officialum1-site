"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PasswordGenerator() {
    const [length, setLength] = useState(16);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generatePassword = () => {
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        let chars = lower;
        if (includeUppercase) chars += upper;
        if (includeNumbers) chars += numbers;
        if (includeSymbols) chars += symbols;

        let generated = '';
        for (let i = 0; i < length; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(generated);
        setCopied(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main style={{ minHeight: '100vh', background: '#030305', color: '#fff' }}>
            <Navbar />

            <div className="container" style={{ paddingTop: '150px', paddingBottom: '100px', maxWidth: '800px' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Strong Password Generator</h1>
                    <p style={{ color: '#888', fontSize: '1.2rem' }}>
                        Secure your accounts with unhackable passwords. <br />
                        Free tool by <span style={{ color: '#00ff88' }}>OfficialUM1</span>.
                    </p>
                </div>

                <div className="glass" style={{ padding: '3rem', borderRadius: '24px' }}>
                    {/* Display Area */}
                    <div style={{
                        background: 'rgba(0,0,0,0.3)',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2rem',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <span style={{ fontSize: '1.5rem', fontFamily: 'monospace', color: password ? '#fff' : '#666', wordBreak: 'break-all' }}>
                            {password || 'Click Generate'}
                        </span>
                        <button
                            onClick={copyToClipboard}
                            disabled={!password}
                            style={{
                                background: copied ? '#00ff88' : 'rgba(255,255,255,0.1)',
                                color: copied ? '#000' : '#fff',
                                border: 'none',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                cursor: password ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s'
                            }}
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div>
                            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: '600' }}>
                                Password Length: {length}
                            </label>
                            <input
                                type="range"
                                min="8"
                                max="64"
                                value={length}
                                onChange={e => setLength(Number(e.target.value))}
                                style={{ width: '100%', accentColor: '#6366f1' }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {[
                                { label: 'Uppercase (A-Z)', val: includeUppercase, set: setIncludeUppercase },
                                { label: 'Numbers (0-9)', val: includeNumbers, set: setIncludeNumbers },
                                { label: 'Symbols (!@#)', val: includeSymbols, set: setIncludeSymbols },
                            ].map((opt, i) => (
                                <label key={i} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    flex: 1,
                                    minWidth: '140px'
                                }}>
                                    <input
                                        type="checkbox"
                                        checked={opt.val}
                                        onChange={e => opt.set(e.target.checked)}
                                        style={{ width: '20px', height: '20px', accentColor: '#00ff88' }}
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={generatePassword}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1.2rem', fontSize: '1.2rem' }}
                    >
                        Generate Secure Password 🔒
                    </button>
                </div>

                {/* SEO Content */}
                <div style={{ marginTop: '4rem', color: '#ccc', lineHeight: '1.8' }}>
                    <h2 style={{ color: '#fff' }}>Why use a Strong Password Generator?</h2>
                    <p>
                        Using a unique, complex password for every account is the best defense against hackers.
                        Our tool generates random passwords locally on your device—nothing is ever sent to our servers.
                    </p>

                    <div style={{ marginTop: '2rem', padding: '2rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <h3 style={{ color: '#fff', marginBottom: '1rem' }}>Need a Secure Account?</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Start watching your favorite shows securely. We provide premium, warrantied accounts for top streaming services.
                        </p>
                        <a href="/shop" className="btn btn-outline">Browse Shop -&gt;</a>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
