"use client";

import { useState, useRef, useEffect } from 'react';
import { modernAlert, modernPrompt } from '@/components/ModernUIOverlay';

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
        documentNumber: `LTR-${new Date().getFullYear()}${new Date().getMonth() + 1}${new Date().getDate()}-${Math.floor(1000 + Math.random() * 9000)}`,
        items: [{ description: '', quantity: 1, unitPrice: 0 }]
    });

    const generateDocNumber = (type: 'invoice' | 'contract' | 'letter') => {
        const prefix = type === 'invoice' ? 'INV' : type === 'contract' ? 'CNT' : 'LTR';
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const randomStr = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${dateStr}-${randomStr}`;
    };

    const handleDocTypeChange = (type: 'invoice' | 'contract' | 'letter') => {
        setDocType(type);
        setFormData(prev => ({
            ...prev,
            documentNumber: generateDocNumber(type),
            subject: '',
            content: '',
            items: [{ description: '', quantity: 1, unitPrice: 0 }]
        }));
    };

    const [viewMode, setViewMode] = useState<'create' | 'list'>('create');
    const [savedDocs, setSavedDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch docs on mount
    useEffect(() => { // Changed from useState to useEffect for side effects
        fetchDocuments();
    }, []); // Empty dependency array to run only once on mount

    async function fetchDocuments() {
        try {
            const res = await fetch('/api/admin/documents');
            const data = await res.json();
            if (data.documents) setSavedDocs(data.documents);
        } catch (e) {
            console.error(e);
        }
    }

    const saveDocument = async () => {
        try {
            await fetch('/api/admin/documents', {
                method: 'POST',
                body: JSON.stringify({
                    type: docType,
                    ...formData,
                    amount: calculateTotal()
                })
            });
            fetchDocuments(); // Refresh list
        } catch (e) {
            console.error('Failed to save', e);
        }
    };

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = async () => {
        // Save automatically when printing
        await saveDocument();

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
                        /* Styles copied from preview */
                        .header-bar { height: 15px; width: 100%; background: #2b4c7e; border-bottom: 5px solid #f0b90b; }
                        .logo-section { padding: 1rem 3rem; display: flex; align-items: center; gap: 15px; }
                        .invoice-table th { background: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 1rem; text-align: left; }
                        .invoice-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #334155; }
                        .invoice-card { background: #f8fafc; border-radius: 12px; padding: 1.5rem; }
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

    const handleEmail = async (doc: any) => {
        const email = await modernPrompt('Enter recipient email:', '');
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch('/api/admin/documents/email', {
                method: 'POST',
                body: JSON.stringify({ id: doc.id, recipientEmail: email })
            });
            if (res.ok) modernAlert('Email sent successfully!');
            else modernAlert('Failed to send email');
        } catch (e) {
            modernAlert('Error sending email');
        }
        setLoading(false);
    };

    const loadDocument = (doc: any) => {
        setDocType(doc.type);
        setFormData({
            recipientName: doc.recipient_name,
            recipientAddress: doc.recipient_address || '',
            date: new Date(doc.created_at).toISOString().split('T')[0],
            subject: doc.subject || '',
            content: doc.content || '',
            amount: doc.amount || '',
            currency: doc.currency || 'USD',
            documentNumber: doc.document_number,
            items: typeof doc.items === 'string' ? JSON.parse(doc.items) : (doc.items || [])
        });
        setViewMode('create');
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
                    <div style={{ background: '#333', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                        <button onClick={() => setViewMode('create')} className={`btn ${viewMode === 'create' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>New Document</button>
                        <button onClick={() => setViewMode('list')} className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`} style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>History</button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                    <h3 style={{ marginTop: 0 }}>Document History</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid #444' }}>
                                <th style={{ padding: '10px', color: '#888' }}>Date</th>
                                <th style={{ padding: '10px', color: '#888' }}>Number</th>
                                <th style={{ padding: '10px', color: '#888' }}>Type</th>
                                <th style={{ padding: '10px', color: '#888' }}>Recipient</th>
                                <th style={{ padding: '10px', color: '#888' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedDocs.map(doc => (
                                <tr key={doc.id} style={{ borderBottom: '1px solid #333' }}>
                                    <td style={{ padding: '15px 10px' }}>{new Date(doc.created_at).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>{doc.document_number}</td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <span style={{
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                            background: doc.type === 'invoice' ? 'rgba(240, 185, 11, 0.2)' : 'rgba(43, 76, 126, 0.2)',
                                            color: doc.type === 'invoice' ? '#f0b90b' : '#a0c4ff'
                                        }}>
                                            {doc.type.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 10px' }}>{doc.recipient_name}</td>
                                    <td style={{ padding: '15px 10px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => loadDocument(doc)} style={{ cursor: 'pointer', background: 'none', border: '1px solid #555', color: '#fff', padding: '4px 8px', borderRadius: '4px' }}>
                                                👁️ View
                                            </button>
                                            <button onClick={() => handleEmail(doc)} disabled={loading} style={{ cursor: 'pointer', background: 'none', border: '1px solid #555', color: '#00ff88', padding: '4px 8px', borderRadius: '4px' }}>
                                                📧 Email
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {/* Editor and Preview Columns Logic (Existing) */}
                    <div className="glass" style={{ padding: '2rem', borderRadius: '24px', maxHeight: '80vh', overflowY: 'auto' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '12px' }}>
                                {[
                                    { id: 'letter', label: '✉️ Letter' },
                                    { id: 'contract', label: '🤝 Contract' },
                                    { id: 'invoice', label: '🧾 Invoice' }
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => handleDocTypeChange(type.id as any)}
                                        className={`btn ${docType === type.id ? 'btn-primary' : 'btn-outline'}`}
                                        style={{ fontSize: '0.9rem', padding: '0.5rem 10px' }}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                            <button onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                🖨️ Print / Save
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label className="label">Recipient Name / Company</label>
                                <input className="input-field" value={formData.recipientName} onChange={e => setFormData({ ...formData, recipientName: e.target.value })} style={{ width: '100%' }} placeholder="e.g. John Doe" />
                            </div>

                            <div>
                                <label className="label">{docType === 'invoice' ? 'Invoice Number' : docType === 'contract' ? 'Contract Number' : 'Reference Number'}</label>
                                <input className="input-field" value={formData.documentNumber} onChange={e => setFormData({ ...formData, documentNumber: e.target.value })} style={{ width: '100%' }} />
                            </div>

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

                    {/* Preview Column */}
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

                                        <style>{`
                                            .invoice-table th { background: #f8fafc; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; padding: 1rem; }
                                            .invoice-table td { padding: 1rem; border-bottom: 1px solid #e2e8f0; color: #334155; }
                                            .invoice-table tr:last-child td { border-bottom: none; }
                                            .invoice-card { background: #f8fafc; border-radius: 12px; padding: 1.5rem; }
                                        `}</style>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                                            <div className="invoice-card">
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Bill To</div>
                                                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{formData.recipientName}</div>
                                                {formData.recipientAddress && <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{formData.recipientAddress}</div>}
                                            </div>
                                            <div className="invoice-card" style={{ textAlign: 'right', background: 'rgba(240, 185, 11, 0.1)', border: '1px solid rgba(240, 185, 11, 0.2)' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#855a00', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Invoice Details</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#2b4c7e' }}>#{formData.documentNumber}</div>
                                                <div style={{ color: '#855a00', fontSize: '0.9rem', marginTop: '0.25rem' }}>Issued: {new Date(formData.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        <table className="invoice-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'left' }}>Description</th>
                                                    <th style={{ textAlign: 'center', width: '80px' }}>Qty</th>
                                                    <th style={{ textAlign: 'right', width: '120px' }}>Price</th>
                                                    <th style={{ textAlign: 'right', width: '120px' }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {formData.items.map((item, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <div style={{ fontWeight: '500' }}>{item.description}</div>
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                        <td style={{ textAlign: 'right' }}>${Number(item.unitPrice).toFixed(2)}</td>
                                                        <td style={{ textAlign: 'right', fontWeight: '600' }}>${(Number(item.quantity) * Number(item.unitPrice)).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                                            <div style={{ width: '250px', background: '#2b4c7e', color: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 20px -5px rgba(43, 76, 126, 0.3)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', opacity: 0.9 }}>
                                                    <span>Subtotal</span>
                                                    <span>${calculateTotal().toFixed(2)}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', opacity: 0.9 }}>
                                                    <span>Tax (0%)</span>
                                                    <span>$0.00</span>
                                                </div>
                                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }}></div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 'bold' }}>
                                                    <span>Total</span>
                                                    <span>${calculateTotal().toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ fontFamily: "'Times New Roman', serif" }}>
                                        <h1 style={{
                                            color: '#0f172a',
                                            fontSize: '2rem',
                                            borderBottom: '3px solid #2b4c7e',
                                            display: 'inline-block',
                                            paddingBottom: '0.5rem',
                                            marginBottom: '3rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            fontFamily: "'Outfit', sans-serif"
                                        }}>
                                            {formData.subject || (docType === 'contract' ? 'CONTRACT AGREEMENT' : 'LETTER OF AUTHORIZATION')}
                                        </h1>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem', fontFamily: "'Outfit', sans-serif", borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
                                            <div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipient</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>{formData.recipientName}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{docType === 'contract' ? 'Contract #' : 'Ref #'}</div>
                                                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#0f172a' }}>{formData.documentNumber}</div>
                                            </div>
                                        </div>

                                        <div style={{
                                            whiteSpace: 'pre-wrap',
                                            lineHeight: '1.8',
                                            fontSize: '1.1rem',
                                            textAlign: 'justify',
                                            color: '#334155',
                                        }}>
                                            {formData.content || <span style={{ color: '#cbd5e1' }}>[Document content will appear here...]</span>}
                                        </div>
                                    </div>
                                )}

                                {/* Signature Section */}
                                <div style={{ marginTop: '5rem', position: 'relative', fontFamily: "'Outfit', sans-serif" }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>

                                        {/* Issuer Signature (Always present) */}
                                        <div style={{ position: 'relative', zIndex: 2 }}>
                                            <div style={{ fontSize: '2.5rem', fontFamily: 'cursive', color: '#1a365d', marginBottom: '10px', transform: 'rotate(-5deg)', display: 'inline-block' }}>umar</div>
                                            <div style={{ width: '250px', borderTop: '2px solid #333', paddingTop: '10px' }}>
                                                <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>Muhammad Umar Mumtaz</div>
                                                <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Managing Member, OfficialUM1 LLC</div>
                                                <div style={{ color: '#2b4c7e', fontSize: '0.7rem', marginTop: '5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    ✓ Digitally Signed & Verified
                                                </div>
                                            </div>
                                        </div>

                                        {/* Recipient Signature (Only for Contracts) */}
                                        {docType === 'contract' && (
                                            <div style={{ width: '250px' }}>
                                                <div style={{ height: '60px' }}></div> {/* Spacing for signature */}
                                                <div style={{ borderTop: '2px solid #333', paddingTop: '10px' }}>
                                                    <div style={{ fontWeight: '800', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0f172a' }}>{formData.recipientName}</div>
                                                    <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '500' }}>Client / Recipient</div>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: '5px', fontStyle: 'italic' }}>Sign & Date Above</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Realistic Stamp (Positioned over issuer) */}
                                    {/* Realistic Stamp (Positioned over issuer) */}
                                    {/* Realistic Stamp (Positioned over issuer) */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '100px',
                                        width: '160px',
                                        height: '160px',
                                        transform: 'rotate(-25deg)',
                                        opacity: 0.85,
                                        pointerEvents: 'none',
                                        zIndex: 1,
                                        mixBlendMode: 'multiply'
                                    }}>
                                        <svg viewBox="0 0 200 200" width="100%" height="100%" style={{ overflow: 'visible' }}>
                                            {/* Defs for text paths */}
                                            <defs>
                                                <path id="curveTop" d="M 20,100 A 80,80 0 0,1 180,100" />
                                                <path id="curveBottom" d="M 20,100 A 80,80 0 0,0 180,100" />
                                            </defs>

                                            {/* Outer Ring - Double Border */}
                                            <circle cx="100" cy="100" r="95" fill="none" stroke="#b71c1c" strokeWidth="4" />
                                            <circle cx="100" cy="100" r="88" fill="none" stroke="#b71c1c" strokeWidth="1" />

                                            {/* Curved Text Top */}
                                            <text width="200" style={{ fill: '#b71c1c', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Courier New, monospace', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                                <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
                                                    OfficialUM1 LLC
                                                </textPath>
                                            </text>

                                            {/* Center Logo - Inked Effect */}
                                            <image
                                                href="/logo.jpg"
                                                x="50"
                                                y="50"
                                                width="100"
                                                height="100"
                                                style={{
                                                    filter: 'grayscale(100%) sepia(100%) saturate(500%) hue-rotate(-50deg) contrast(150%) brightness(0.9)',
                                                    opacity: 0.9
                                                }}
                                            />

                                            {/* Curved Text Bottom */}
                                            <text width="200" style={{ fill: '#b71c1c', fontSize: '20px', fontWeight: 'bold', fontFamily: 'Courier New, monospace', textTransform: 'uppercase', letterSpacing: '4px' }}>
                                                <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
                                                    VERIFIED
                                                </textPath>
                                            </text>

                                            {/* Grunge Texture Overlay (Simple Noise using SVG filter could be done, but simple dots suffice for 'ink' spots) */}
                                            <circle cx="40" cy="60" r="2" fill="#b71c1c" opacity="0.4" />
                                            <circle cx="160" cy="140" r="1.5" fill="#b71c1c" opacity="0.3" />
                                            <circle cx="120" cy="30" r="2" fill="#b71c1c" opacity="0.5" />
                                            <circle cx="80" cy="170" r="1" fill="#b71c1c" opacity="0.4" />
                                        </svg>
                                    </div>
                                </div>

                            </div>

                            {/* Footer */}
                            <div style={{ marginTop: 'auto', borderTop: '2px solid #f0f0f0', padding: '1.5rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ background: 'white', border: '1px solid #ddd', padding: '4px', borderRadius: '8px' }}>
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                                `${window.location.origin}/verify?doc=${formData.documentNumber}&user=${encodeURIComponent(formData.recipientName)}&date=${formData.date}`
                                            )}`}
                                            alt="Verification QR"
                                            style={{ width: '70px', height: '70px' }}
                                        />
                                    </div>
                                    <div style={{ color: '#555', fontSize: '0.8rem', lineHeight: '1.6' }}>
                                        <div style={{ fontWeight: '700', color: '#2b4c7e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>OfficialUM1 LLC</div>
                                        <div>1001 S. Main St. Ste 600, Kalispell, MT 59901</div>
                                        <div style={{ color: '#888' }}>info@officialm1.com • www.officialum1.com</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', opacity: 0.6 }}>
                                    <img src="/logo.jpg" alt="Logo" style={{ width: '30px', filter: 'grayscale(100%)', opacity: 0.5 }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
