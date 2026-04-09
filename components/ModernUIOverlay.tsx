"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ModalType = 'alert' | 'confirm' | 'prompt';

interface ModalState {
    id: string;
    type: ModalType;
    message: string;
    placeholder?: string;
    defaultValue?: string;
    onResolve: (value: any) => void;
}

interface ToastState {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
}

let modalResolver: ((state: ModalState) => void) | null = null;
let toastTrigger: ((message: string, type: any) => void) | null = null;

/**
 * Global triggers for the modern UI
 * Use these instead of window.alert, window.confirm, window.prompt
 */
export const modernAlert = (message: string, description?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const fullMessage = description ? `${message}: ${description}` : message;
    if (toastTrigger) toastTrigger(fullMessage, type);
    else console.log(`[${type}]`, fullMessage);
};

export const modernConfirm = (message: string, description?: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const fullMessage = description ? `${message}\n\n${description}` : message;
        if (modalResolver) {
            modalResolver({
                id: Math.random().toString(),
                type: 'confirm',
                message: fullMessage,
                onResolve: resolve
            });
        } else {
            resolve(window.confirm(fullMessage));
        }
    });
};

export const modernPrompt = (message: string, defaultValue = ''): Promise<string | null> => {
    return new Promise((resolve) => {
        if (modalResolver) {
            modalResolver({
                id: Math.random().toString(),
                type: 'prompt',
                message,
                defaultValue,
                onResolve: resolve
            });
        } else {
            resolve(window.prompt(message, defaultValue));
        }
    });
};

export default function ModernUIOverlay() {
    const [modal, setModal] = useState<ModalState | null>(null);
    const [toasts, setToasts] = useState<ToastState[]>([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        modalResolver = (state) => {
            setModal(state);
            setInputValue(state.defaultValue || '');
        };
        toastTrigger = (message, type = 'info') => {
            const id = Math.random().toString();
            setToasts(prev => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 5000);
        };

        return () => {
            modalResolver = null;
            toastTrigger = null;
        };
    }, []);

    const handleAction = (value: any) => {
        if (modal) {
            modal.onResolve(value);
            setModal(null);
            setInputValue('');
        }
    };

    return (
        <>
            {/* TOAST NOTIFICATIONS */}
            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10001, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            className={`modern-toast ${toast.type}`}
                        >
                            <div className="toast-icon">
                                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : '🔔'}
                            </div>
                            <div className="toast-message">{toast.message}</div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* MODAL SYSTEM */}
            <AnimatePresence>
                {modal && (
                    <div className="modal-backend">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => modal.type !== 'prompt' && handleAction(false)}
                            className="modal-overlay"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.9, y: 20, filter: 'blur(10px)' }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="modern-modal-card"
                        >
                            <div className="modal-glow" />
                            <div className="modal-header">
                                <div className="modal-type-icon">
                                    {modal.type === 'confirm' ? '🛡️' : modal.type === 'prompt' ? '📝' : '⚡'}
                                </div>
                                <h3>SYSTEM REQUEST</h3>
                            </div>

                            <div className="modal-body">
                                <p>{modal.message}</p>
                                {modal.type === 'prompt' && (
                                    <>
                                        <textarea
                                            autoFocus
                                            className="modal-input"
                                            style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'monospace' }}
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleAction(inputValue);
                                                }
                                            }}
                                            placeholder="Paste manual credential data here (or leave blank to auto-pull stock)..."
                                        />
                                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '10px', textAlign: 'left', lineHeight: '1.4' }}>
                                            <strong>Pro Tip:</strong> For beautiful formatting on the delivery page, paste your data separated by colons in this exact order: <br />
                                            <span style={{ color: '#00ff88', fontFamily: 'monospace' }}>username:password:email:email_password:additional_info</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-footer">
                                {modal.type !== 'alert' && (
                                    <button onClick={() => handleAction(null)} className="modal-btn-secondary">
                                        CANCEL
                                    </button>
                                )}
                                <button
                                    onClick={() => handleAction(modal.type === 'prompt' ? inputValue : true)}
                                    className="modal-btn-primary"
                                >
                                    {modal.type === 'confirm' ? 'CONFIRM' : 'OK'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .modal-backend {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                }

                .modal-overlay {
                    position: absolute;
                    inset: 0;
                    background: #000000;
                    background-image: 
                        radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.05) 0%, transparent 80%),
                        url("https://www.transparenttextures.com/patterns/carbon-fibre.png");
                    backdrop-filter: blur(80px);
                    opacity: 1;
                }

                .modern-modal-card {
                    background: #0a0b1e;
                    border: 1px solid rgba(255, 68, 68, 0.4);
                    border-radius: 40px;
                    padding: 60px;
                    width: 95%;
                    max-width: 600px;
                    position: relative;
                    box-shadow: 0 0 100px rgba(0,0,0,1), 
                                0 0 40px rgba(255, 68, 68, 0.1),
                                inset 0 0 20px rgba(255, 68, 68, 0.05);
                    overflow: hidden;
                    z-index: 10001;
                    transition: all 0.3s ease;
                }

                @media (max-width: 768px) {
                    .modern-modal-card {
                        padding: 30px 20px;
                        border-radius: 24px;
                    }
                    .modal-body p {
                        font-size: 1.1rem;
                        margin-bottom: 30px;
                    }
                    .modal-type-icon {
                        width: 50px;
                        height: 50px;
                        font-size: 1.4rem;
                    }
                }

                .modal-glow {
                    position: absolute;
                    top: -20%;
                    right: -20%;
                    width: 300px;
                    height: 300px;
                    background: radial-gradient(circle, rgba(255, 68, 68, 0.15) 0%, transparent 70%);
                    pointer-events: none;
                }

                .modal-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 24px;
                    margin-bottom: 40px;
                }

                .modal-type-icon {
                    width: 64px;
                    height: 64px;
                    background: linear-gradient(135deg, rgba(255, 68, 68, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.8rem;
                    border: 1px solid rgba(255, 68, 68, 0.4);
                    box-shadow: 0 10px 30px rgba(255, 68, 68, 0.2);
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 0.9rem;
                    font-weight: 900;
                    letter-spacing: 6px;
                    color: #ff4444;
                    text-transform: uppercase;
                    opacity: 1;
                }

                .modal-body p {
                    color: #ffffff;
                    font-size: 1.5rem;
                    line-height: 1.6;
                    margin: 0 0 40px 0;
                    font-weight: 800;
                    text-align: center;
                    text-shadow: 0 4px 15px rgba(0,0,0,0.8);
                }

                .modal-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 14px;
                    padding: 16px 20px;
                    color: #fff;
                    font-size: 1.1rem;
                    outline: none;
                    transition: all 0.2s;
                    margin-bottom: 10px;
                }

                .modal-input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }

                .modal-input:focus {
                    border-color: #ff4444;
                    background: rgba(255, 68, 68, 0.05);
                    box-shadow: 0 0 20px rgba(255, 68, 68, 0.15);
                }

                .modal-footer {
                    display: flex;
                    gap: 14px;
                    justify-content: flex-end;
                    margin-top: 36px;
                }

                .modal-btn-primary {
                    background: #ff4444;
                    color: #fff;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 14px;
                    font-weight: 900;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 1px;
                    box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
                }

                .modal-btn-primary:hover {
                    background: #ff2222;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 68, 68, 0.5);
                }

                .modal-btn-secondary {
                    background: rgba(255, 255, 255, 0.03);
                    color: #aaa;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 14px 32px;
                    border-radius: 14px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .modal-btn-secondary:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.3);
                }

                /* TOAST STYLES */
                .modern-toast {
                    background: rgba(20, 20, 30, 0.95);
                    backdrop-filter: blur(25px);
                    -webkit-backdrop-filter: blur(25px);
                    border-radius: 20px;
                    padding: 18px 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0, 255, 136, 0.05);
                    min-width: 320px;
                    max-width: 500px;
                    position: relative;
                    overflow: hidden;
                }

                .modern-toast::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent);
                    transform: translateX(-100%);
                    animation: toast-shimmer 3s infinite;
                }

                @keyframes toast-shimmer {
                    100% { transform: translateX(100%); }
                }

                .modern-toast.info { border-left: 6px solid #00c3ff; }
                .modern-toast.success { border-left: 6px solid #00ff88; }
                .modern-toast.error { border-left: 6px solid #ff4444; }

                .toast-icon { 
                    font-size: 1.5rem; 
                    filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));
                }
                .toast-message { 
                    color: #ffffff; 
                    font-size: 1rem; 
                    font-weight: 700; 
                    line-height: 1.4;
                    letter-spacing: 0.01em;
                }
            `}</style>
        </>
    );
}
