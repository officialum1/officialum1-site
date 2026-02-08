"use client";

import { useState, useRef } from 'react';
import { modernAlert } from '@/components/ModernUIOverlay';

export default function DocumentsTab() {
    const [docType, setDocType] = useState<'invoice' | 'contract' | 'letter'>('letter');
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientAddress: '',
        date: new Date().toISOString().split('T')[0],
        subject: '',
        content: '',
        amount: '',
        currency: 'USD',
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        items: [{ description: '', quantity: 1, unitPrice: 0 }]
    });

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const content = printRef.current;
        if (!content) return;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            modernAlert('Please allow popups to print');
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <base href="${window.location.origin}/" />
                    <title>${docType.toUpperCase()} - ${formData.recipientName}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
                        body { margin: 0; padding: 0; font-family: 'Outfit', sans-serif; -webkit-print-color-adjust: exact; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                        .page-container {
                            width: 210mm;
                            min-height: 297mm;
                            margin: 0 auto;
                            background: white;
                            position: relative;
                            overflow: hidden;
                        }
                        .header-bar {
                            height: 15px;
                            width: 100%;
                            background: #2b4c7e;
                            border-bottom: 5px solid #f0b90b;
                        }
                        .logo-section {
                            padding: 1rem 3rem;
                            display: flex;
                            align-items: center;
                            gap: 15px;
                        }
                        .logo-img {
                            width: 60px;
                            height: 60px;
                            object-fit: contain;
                        }
                        .company-name {
                            font-size: 1.2rem;
                            font-weight: 700;
                            color: #333;
                        }
                        .watermark {
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 400px;
                            opacity: 0.1;
                            z-index: 0;
                            pointer-events: none;
                        }
                        .content {
                            padding: 2rem 3rem;
                            position: relative;
                            z-index: 1;
                            min-height: 600px;
                        }
                        .footer {
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            width: 100%;
                            height: 80px;
                            background: #2b4c7e;
                            color: white;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 0 3rem;
                            font-size: 0.8rem;
                        }
                        .qr-code {
                            background: white;
                            padding: 5px;
                            border-radius: 4px;
                            width: 60px;
                            height: 60px;
                        }
                        .signature-section {
                            margin-top: 3rem;
                        }
                        .sign-img {
                            height: 50px;
                            margin-bottom: 5px;
                        }
                        .sign-line {
                            width: 200px;
                            border-top: 1px solid #333;
                            margin-top: 10px;
                        }
                        .sign-name {
                            font-weight: bold;
                            margin-top: 5px;
                        }
                        .sign-title {
                            font-size: 0.9rem;
                            color: #555;
                        }
                        h1 { color: #2b4c7e; text-transform: uppercase; letter-spacing: 2px; border-bottom: 2px solid #f0b90b; display: inline-block; padding-bottom: 5px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 2rem; }
                        th { background: #f4f4f4; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
                        td { padding: 10px; border-bottom: 1px solid #eee; }
                        .total-row td { border-top: 2px solid #333; font-weight: bold; font-size: 1.1rem; }
                    </style>
                </head>
                <body>
                    <div class="page-container">
                        ${content.innerHTML}
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 500);
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }]
        });
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const removeItem = (index: number) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const calculateTotal = () => {
        return formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
    };

    return (
        <div className="FadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        📄 Document Center
                        <span style={{ fontSize: '0.8rem', background: '#00ff8822', color: '#00ff88', padding: '2px 8px', borderRadius: '4px' }}>BETA</span>
                    </h2>
                    <p style={{ color: '#888', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Issue official invoices, contracts, and authorized letters.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        🖨️ Print / Save PDF
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Editor Column */}
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px', maxHeight: '80vh', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                        {[
                            { id: 'letter', label: '✉️ Letter' },
                            { id: 'contract', label: '🤝 Contract' },
                            { id: 'invoice', label: '🧾 Invoice' }
                        ].map(type => (
                            <button
                                key={type.id}
                                onClick={() => setDocType(type.id as any)}
                                className={`btn ${docType === type.id ? 'btn-primary' : 'btn-outline'}`}
                                style={{ flex: 1, fontSize: '0.9rem', justifyContent: 'center' }}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label className="label">Recipient Name / Company</label>
                            <input className="input-field" value={formData.recipientName} onChange={e => setFormData({ ...formData, recipientName: e.target.value })} style={{ width: '100%' }} placeholder="e.g. John Doe" />
                        </div>

                        {docType === 'invoice' && (
                            <div>
                                <label className="label">Invoice Number</label>
                                <input className="input-field" value={formData.invoiceNumber} onChange={e => setFormData({ ...formData, invoiceNumber: e.target.value })} style={{ width: '100%' }} />
                            </div>
                        )}

                        <div>
                            <label className="label">Date</label>
                            <input type="date" className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} style={{ width: '100%' }} />
                        </div>

                        {docType !== 'invoice' && (
                            <div>
                                <label className="label">Subject / Title</label>
                                <input className="input-field" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} style={{ width: '100%' }} placeholder="e.g. Letter of Authorization" />
                            </div>
                        )}

                        {docType !== 'invoice' ? (
                            <div>
                                <label className="label">Content / Body</label>
                                <textarea
                                    className="input-field"
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    style={{ width: '100%', height: '300px', lineHeight: '1.6' }}
                                    placeholder="Type your content here..."
                                />
                            </div>
                        ) : (
                            <div>
                                <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    Line Items
                                    <button onClick={addItem} style={{ background: 'none', border: 'none', color: '#00ff88', cursor: 'pointer' }}>+ Add Item</button>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {formData.items.map((item, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem' }}>
                                            <input className="input-field" placeholder="Description" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                                            <input type="number" className="input-field" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, 'quantity', Number(e.target.value))} />
                                            <input type="number" className="input-field" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', Number(e.target.value))} />
                                            <button onClick={() => removeItem(i)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                        </div>
                                    ))}
                                    <div style={{ textAlign: 'right', marginTop: '1rem', color: '#00ff88', fontWeight: 'bold' }}>
                                        Total: ${calculateTotal().toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Column (Hidden in Print, used to generate HTML) */}
                <div style={{ background: '#555', padding: '2rem', borderRadius: '24px', overflowY: 'auto', maxHeight: '80vh', display: 'flex', justifyContent: 'center' }}>
                    <div
                        ref={printRef}
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            background: 'white',
                            color: 'black',
                            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header Bar */}
                        <div style={{ height: '20px', width: '100%', background: '#2b4c7e', borderBottom: '5px solid #f0b90b' }}></div>

                        {/* Top Logo Section */}
                        <div style={{ padding: '3rem 3rem 1rem 3rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <img src="/logo.jpg" alt="Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                            <div>
                                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#333', letterSpacing: '-0.5px' }}>officialum1 LLC</div>
                            </div>
                        </div>

                        {/* Watermark */}
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.08, pointerEvents: 'none', zIndex: 0 }}>
                            <img src="/logo.jpg" alt="Watermark" style={{ width: '400px', filter: 'grayscale(100%)' }} />
                        </div>

                        {/* Content */}
                        <div style={{ padding: '2rem 3rem', flex: 1, position: 'relative', zIndex: 1 }}>

                            <div style={{ textAlign: 'right', marginBottom: '2rem', color: '#666', fontSize: '0.9rem' }}>
                                Date: <b>{new Date(formData.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</b>
                            </div>

                            {docType === 'invoice' ? (
                                <div>
                                    <h1 style={{ color: '#2b4c7e', borderBottom: '2px solid #f0b90b', display: 'inline-block', paddingBottom: '5px', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>INVOICE</h1>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '3rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Bill To:</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formData.recipientName}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#888', textTransform: 'uppercase' }}>Invoice #:</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formData.invoiceNumber}</div>
                                        </div>
                                    </div>

                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: '#f8f9fa' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', color: '#555' }}>Description</th>
                                                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #ddd', color: '#555', width: '80px' }}>Qty</th>
                                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd', color: '#555', width: '120px' }}>Unit Price</th>
                                                <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #ddd', color: '#555', width: '120px' }}>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {formData.items.map((item, i) => (
                                                <tr key={i}>
                                                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.description}</td>
                                                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #eee' }}>{item.quantity}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>${Number(item.unitPrice).toFixed(2)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td colSpan={3} style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '2px solid #333' }}>Total Due:</td>
                                                <td style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.1rem', borderTop: '2px solid #333', color: '#2b4c7e' }}>${calculateTotal().toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div>
                                    <h1 style={{ color: '#2b4c7e', borderBottom: '2px solid #f0b90b', display: 'inline-block', paddingBottom: '5px', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                        {formData.subject || (docType === 'contract' ? 'CONTRACT AGREEMENT' : 'LETTER OF AUTHORIZATION')}
                                    </h1>

                                    <div style={{ marginBottom: '2rem' }}>
                                        To: <b>{formData.recipientName}</b>
                                    </div>

                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', fontSize: '1rem', textAlign: 'justify' }}>
                                        {formData.content || '[Content will appear here...]'}
                                    </div>
                                </div>
                            )}

                            {/* Signature Section */}
                            <div style={{ marginTop: '5rem', position: 'relative' }}>
                                <div style={{ fontSize: '2.5rem', fontFamily: 'cursive', color: '#1a365d', marginBottom: '10px', transform: 'rotate(-5deg)', display: 'inline-block' }}>umar</div>
                                <div style={{ width: '280px', borderTop: '2px solid #333', paddingTop: '10px' }}>
                                    <div style={{ fontWeight: '800', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Muhammad Umar Mumtaz</div>
                                    <div style={{ color: '#555', fontSize: '0.85rem' }}>Managing Member, OfficialUM1 LLC</div>
                                    <div style={{ color: '#888', fontSize: '0.7rem', marginTop: '5px', fontStyle: 'italic' }}>Digitally Signed & Verified</div>
                                </div>

                                {/* Realistic Stamp */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '220px',
                                    border: '4px double #d32f2f',
                                    color: '#d32f2f',
                                    width: '130px',
                                    height: '130px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '900',
                                    fontSize: '0.8rem',
                                    transform: 'rotate(-15deg)',
                                    opacity: 0.7,
                                    pointerEvents: 'none',
                                    letterSpacing: '1px',
                                    textAlign: 'center',
                                    padding: '5px',
                                    boxShadow: 'inset 0 0 10px rgba(211, 47, 47, 0.2)',
                                    background: 'rgba(211, 47, 47, 0.02)',
                                    textTransform: 'uppercase',
                                    lineHeight: '1.4'
                                }}>
                                    <div style={{ border: '1px solid #d32f2f', width: '90%', height: '90%', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        OFFICIAL<br />SEAL<br /><span style={{ fontSize: '0.6rem' }}>VERIFIED</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: 'auto', height: '80px', background: '#2b4c7e', color: 'white', display: 'flex', padding: 0 }}>
                            <div style={{ flex: 3, display: 'flex', alignItems: 'center', gap: '20px', paddingLeft: '3rem' }}>
                                <div style={{ background: 'white', padding: '4px', borderRadius: '4px', height: '58px', width: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Verified Document by OfficialUM1 LLC\nIssued to: ${formData.recipientName}\nDate: ${formData.date}\nID: ${Date.now()}`)}`} alt="QR" style={{ width: '50px', height: '50px' }} />
                                </div>
                                <div style={{ fontSize: '0.75rem', lineHeight: '1.5', letterSpacing: '0.5px' }}>
                                    <b>1001 S. MAIN ST. STE 600 KALISPELL, MT 59901</b><br />
                                    Email: info@officialm1.com &nbsp;|&nbsp; Web: www.officialum1.com
                                </div>
                            </div>
                            <div style={{ flex: 1, background: '#1a365d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '1px' }}>
                                PAGE 1 OF 1
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .label {
                    display: block;
                    font-size: 0.85rem;
                    color: #aaa;
                    margin-bottom: 0.5rem;
                }
                .input-field {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    padding: 0.8rem;
                    border-radius: 8px;
                    outline: none;
                }
                .input-field:focus {
                    border-color: #00ff88;
                }
            `}</style>
        </div>
    );
}
