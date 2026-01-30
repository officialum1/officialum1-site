"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DepositModal({ isOpen, onClose, userId, onSuccess }: any) {
    const [amount, setAmount] = useState<string>('');
    const [method, setMethod] = useState<'crypto' | 'card' | null>(null);
    const [step, setStep] = useState(1); // 1=Amount, 2=Method, 3=Processing, 4=Success
    const [loading, setLoading] = useState(false);
    const [availableMethods, setAvailableMethods] = useState<any>({ stripe: true, crypto: true });

    useEffect(() => {
        if (isOpen) {
            fetch('/api/admin/settings')
                .then(res => res.json())
                .then(data => {
                    if (data.payment_gateways) {
                        try {
                            setAvailableMethods(JSON.parse(data.payment_gateways));
                        } catch { }
                    }
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const quickAmounts = [10, 25, 50, 100];

    const handleDeposit = async () => {
        if (!amount || !method) return;
        setLoading(true);
        setStep(3); // Processing UI

        try {
            const res = await fetch('/api/user/wallet/deposit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    amount: Number(amount),
                    method: method === 'card' ? 'stripe' : 'cryptomus'
                })
            });

            const data = await res.json();
            if (data.paymentUrl) {
                window.location.href = data.paymentUrl;
            } else if (data.success) {
                setStep(4);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setStep(1);
                    setAmount('');
                    setMethod(null);
                    setLoading(false);
                }, 2000);
            } else {
                alert(data.error || "Transaction Failed");
                setStep(2);
                setLoading(false);
            }
        } catch (err) {
            alert("Error connecting to gateway");
            setStep(2);
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                    background: '#0f1014', border: '1px solid #333',
                    borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '450px',
                    position: 'relative'
                }}
            >
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#666', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>

                {step === 1 && (
                    <>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Add Funds 💰</h2>
                        <p style={{ color: '#888', textAlign: 'center', marginBottom: '2rem' }}>Choose an amount to deposit</p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            {quickAmounts.map(amt => (
                                <button key={amt}
                                    onClick={() => setAmount(amt.toString())}
                                    className={`btn ${amount === amt.toString() ? 'btn-primary' : 'btn-outline'}`}
                                    style={{ borderColor: amount === amt.toString() ? 'transparent' : '#333' }}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>

                        <div style={{ position: 'relative', marginBottom: '2rem' }}>
                            <span style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}>$</span>
                            <input
                                type="number"
                                placeholder="Custom Amount"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="input-field"
                                style={{ paddingLeft: '35px', fontSize: '1.2rem' }}
                            />
                        </div>

                        <button
                            disabled={!amount || Number(amount) <= 0}
                            onClick={() => setStep(2)}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', opacity: (!amount || Number(amount) <= 0) ? 0.5 : 1 }}
                        >
                            Next: Select Method →
                        </button>
                    </>
                )}

                {step === 2 && (
                    <>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>Select Method 💳</h2>
                        <p style={{ color: '#888', textAlign: 'center', marginBottom: '2rem' }}>How would you like to pay?</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {availableMethods.stripe && (
                                <button
                                    onClick={() => setMethod('card')}
                                    className={`glass ${method === 'card' ? 'active' : ''}`}
                                    style={{
                                        padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                                        border: method === 'card' ? '1px solid #00ff88' : '1px solid #333', textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>💳</span>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Credit/Debit Card</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Instant • 2.9% Fee</div>
                                    </div>
                                </button>
                            )}

                            {availableMethods.crypto && (
                                <button
                                    onClick={() => setMethod('crypto')}
                                    className={`glass ${method === 'crypto' ? 'active' : ''}`}
                                    style={{
                                        padding: '1rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                                        border: method === 'crypto' ? '1px solid #ffd700' : '1px solid #333', textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>₿</span>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Cryptocurrency</div>
                                        <div style={{ fontSize: '0.8rem', color: '#888' }}>BTC, ETH, LTC • No Fee</div>
                                    </div>
                                </button>
                            )}

                            {!availableMethods.stripe && !availableMethods.crypto && (
                                <p style={{ color: '#ff4444', textAlign: 'center' }}>No Payment Methods Enabled.</p>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>← Back</button>
                            <button
                                onClick={handleDeposit}
                                className="btn btn-primary"
                                style={{ flex: 2, background: '#00ff88', color: 'black' }}
                                disabled={!method}
                            >
                                Pay ${amount}
                            </button>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <div className="loader" style={{ margin: '0 auto 1.5rem' }}></div>
                        <h3>Processing Payment...</h3>
                        <p style={{ color: '#888' }}>Please do not close this window.</p>
                    </div>
                )}

                {step === 4 && (
                    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{ fontSize: '4rem', marginBottom: '1rem' }}
                        >
                            ✅
                        </motion.div>
                        <h3 style={{ color: '#00ff88' }}>Deposit Successful!</h3>
                        <p style={{ color: '#ccc' }}>${amount} has been added to your wallet.</p>
                    </div>
                )}

            </motion.div>
        </div>
    );
}
