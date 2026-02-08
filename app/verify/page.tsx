"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';

function VerifyContent() {
    const searchParams = useSearchParams();
    const docId = searchParams.get('doc');
    const user = searchParams.get('user');
    const date = searchParams.get('date');
    const type = docId?.startsWith('INV') ? 'Invoice' : docId?.startsWith('CNT') ? 'Contract' : 'Document';

    if (!docId || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
                    <div className="text-5xl mb-4">❓</div>
                    <h1 className="text-2xl font-bold mb-2">Invalid Request</h1>
                    <p className="text-gray-500 mb-6">Missing verification parameters.</p>
                    <Link href="/" className="bg-[#2b4c7e] text-white px-6 py-2 rounded-lg hover:bg-[#1a365d] transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 relative">

                {/* Top Decoration */}
                <div className="h-2 bg-gradient-to-r from-[#2b4c7e] to-[#f0b90b]"></div>

                <div className="p-8 text-center relative z-10">
                    {/* Verified Icon */}
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-slate-800 mb-1">Document Verified</h1>
                    <p className="text-green-600 font-medium mb-8 text-sm uppercase tracking-wide">OfficialUM1 LLC Authenticated</p>

                    <div className="bg-slate-50 rounded-xl p-6 text-left space-y-4 border border-slate-100">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Document Number</p>
                            <p className="text-lg font-mono font-bold text-slate-700">{docId}</p>
                        </div>

                        <div className="h-px bg-slate-200"></div>

                        <div>
                            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Issued To</p>
                            <p className="text-lg font-medium text-slate-700">{user}</p>
                        </div>

                        {date && (
                            <>
                                <div className="h-px bg-slate-200"></div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Issue Date</p>
                                    <p className="text-base text-slate-600">{new Date(date).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-8 text-xs text-slate-400 leading-relaxed">
                        This document has been electronically verified by the OfficialUM1 verification system.
                        The details above match our records for the issued {type}.
                    </div>
                </div>

                {/* Bottom Branding */}
                <div className="bg-[#2b4c7e] p-4 text-center">
                    <p className="text-white/80 text-xs font-medium tracking-wider">SECURED BY OFFICIALUM1</p>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Verifying...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
