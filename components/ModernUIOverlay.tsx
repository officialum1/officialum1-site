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
export const modernAlert = (message: string) => {
    if (toastTrigger) toastTrigger(message, 'info');
    else console.log("Toast trigger not initialized", message);
};

export const modernConfirm = (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (modalResolver) {
            modalResolver({
                id: Math.random().toString(),
                type: 'confirm',
                message,
                onResolve: resolve
            });
        } else {
            resolve(window.confirm(message));
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
                                    <input
                                        autoFocus
                                        className="modal-input"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAction(inputValue)}
                                        placeholder="Type here..."
                                    />
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

            <style jsx>{`
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
                    background: radial-gradient(circle at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.98) 100%);
                    backdrop-filter: blur(25px);
                }

                .modern-modal-card {
                    background: #050508;
                    border: 1px solid rgba(0, 255, 136, 0.5);
                    border-radius: 32px;
                    padding: 48px;
                    width: 100%;
                    max-width: 550px;
                    position: relative;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.95), 
                                0 0 80px rgba(0,255,136,0.15);
                    overflow: hidden;
                }

                .modal-glow {
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 60%);
                    pointer-events: none;
                }

                .modal-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 30px;
                }

                .modal-type-icon {
                    width: 52px;
                    height: 52px;
                    background: rgba(0, 255, 136, 0.2);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    border: 1px solid rgba(0, 255, 136, 0.3);
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.1);
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 0.85rem;
                    font-weight: 900;
                    letter-spacing: 4px;
                    color: #00ff88;
                    text-transform: uppercase;
                    opacity: 1;
                }

                .modal-body p {
                    color: #ffffff;
                    font-size: 1.35rem;
                    line-height: 1.5;
                    margin: 0 0 32px 0;
                    font-weight: 800;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
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
                    border-color: #00ff88;
                    background: rgba(0, 255, 136, 0.08);
                    box-shadow: 0 0 20px rgba(0, 255, 136, 0.15);
                }

                .modal-footer {
                    display: flex;
                    gap: 14px;
                    justify-content: flex-end;
                    margin-top: 36px;
                }

                .modal-btn-primary {
                    background: #00ff88;
                    color: #000;
                    border: none;
                    padding: 14px 32px;
                    border-radius: 14px;
                    font-weight: 900;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    letter-spacing: 1px;
                    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.2);
                }

                .modal-btn-primary:hover {
                    background: #00e67a;
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(0, 255, 136, 0.4);
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
                    background: rgba(15, 15, 20, 0.9);
                    backdrop-filter: blur(15px);
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.4);
                    minWidth: 280px;
                    max-width: 400px;
                }

                .modern-toast.info { border-left: 4px solid #00ff88; }
                .modern-toast.success { border-left: 4px solid #00ff88; }
                .modern-toast.error { border-left: 4px solid #ff4444; }

                .toast-icon { font-size: 1.2rem; }
                .toast-message { 
                    color: #fff; 
                    font-size: 0.9rem; 
                    font-weight: 500; 
                    line-height: 1.4;
                }
            `}</style>
        </>
    );
}
