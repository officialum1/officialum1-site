"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { PageHero } from '@/components/ui/PageHero';
import { Badge } from '@/components/ui/Badge';
import { Building2, CheckCircle2, FileText, ShieldCheck, UserRound } from 'lucide-react';

const US_STATES = [
    { code: 'AL', name: 'Alabama', fee: 236 }, { code: 'AK', name: 'Alaska', fee: 250 }, { code: 'AZ', name: 'Arizona', fee: 50 },
    { code: 'AR', name: 'Arkansas', fee: 45 }, { code: 'CA', name: 'California', fee: 70 }, { code: 'CO', name: 'Colorado', fee: 50 },
    { code: 'CT', name: 'Connecticut', fee: 120 }, { code: 'DE', name: 'Delaware', fee: 90 }, { code: 'FL', name: 'Florida', fee: 125 },
    { code: 'GA', name: 'Georgia', fee: 100 }, { code: 'HI', name: 'Hawaii', fee: 50 }, { code: 'ID', name: 'Idaho', fee: 100 },
    { code: 'IL', name: 'Illinois', fee: 150 }, { code: 'IN', name: 'Indiana', fee: 95 }, { code: 'IA', name: 'Iowa', fee: 50 },
    { code: 'KS', name: 'Kansas', fee: 160 }, { code: 'KY', name: 'Kentucky', fee: 40 }, { code: 'LA', name: 'Louisiana', fee: 100 },
    { code: 'ME', name: 'Maine', fee: 175 }, { code: 'MD', name: 'Maryland', fee: 100 }, { code: 'MA', name: 'Massachusetts', fee: 500 },
    { code: 'MI', name: 'Michigan', fee: 50 }, { code: 'MN', name: 'Minnesota', fee: 155 }, { code: 'MS', name: 'Mississippi', fee: 50 },
    { code: 'MO', name: 'Missouri', fee: 50 }, { code: 'MT', name: 'Montana', fee: 35 }, { code: 'NE', name: 'Nebraska', fee: 105 },
    { code: 'NV', name: 'Nevada', fee: 425 }, { code: 'NH', name: 'New Hampshire', fee: 100 }, { code: 'NJ', name: 'New Jersey', fee: 125 },
    { code: 'NM', name: 'New Mexico', fee: 50 }, { code: 'NY', name: 'New York', fee: 200 }, { code: 'NC', name: 'North Carolina', fee: 125 },
    { code: 'ND', name: 'North Dakota', fee: 135 }, { code: 'OH', name: 'Ohio', fee: 99 }, { code: 'OK', name: 'Oklahoma', fee: 100 },
    { code: 'OR', name: 'Oregon', fee: 100 }, { code: 'PA', name: 'Pennsylvania', fee: 125 }, { code: 'RI', name: 'Rhode Island', fee: 150 },
    { code: 'SC', name: 'South Carolina', fee: 110 }, { code: 'SD', name: 'South Dakota', fee: 150 }, { code: 'TN', name: 'Tennessee', fee: 300 },
    { code: 'TX', name: 'Texas', fee: 300 }, { code: 'UT', name: 'Utah', fee: 54 }, { code: 'VT', name: 'Vermont', fee: 125 },
    { code: 'VA', name: 'Virginia', fee: 100 }, { code: 'WA', name: 'Washington', fee: 200 }, { code: 'WV', name: 'West Virginia', fee: 100 },
    { code: 'WI', name: 'Wisconsin', fee: 130 }, { code: 'WY', name: 'Wyoming', fee: 100 }
];

export default function FormBusinessPage() {
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '',
        state: 'Wyoming',
        email: '',
        entityType: 'Limited Liability Company',
        customFields: {}
    });
    const [schema, setSchema] = useState<any>(null);
    const [companyId, setCompanyId] = useState<string>('');
    const [offerings, setOfferings] = useState<any[]>([]);
    const [selectedOffering, setSelectedOffering] = useState<any>(null);
    const [filingMethods, setFilingMethods] = useState<any[]>([]);
    const [selectedMethod, setSelectedMethod] = useState<any>(null);
    const [mainService, setMainService] = useState<'formation' | 'ra' | 'ein' | 'compliance'>('formation');
    const [addOns, setAddOns] = useState({ ein: false, agreement: false, compliance: false, virtualOffice: false });
    const [subStep, setSubStep] = useState(1); // For Step 2 multi-part form

    useEffect(() => {
        const stored = localStorage.getItem('buyer_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                if (u.email) setFormData((prev: any) => ({ ...prev, email: u.email }));
            } catch (e) { }
        }
    }, []);

    const handleInitialSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Ghost Company First (Corporate Tools requirement for context)
            const res = await fetch('/api/admin/corptools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    state: formData.state,
                    entityType: formData.entityType
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            const cId = data.result[0].id;
            setCompanyId(cId);

            // 2. Fetch Offerings using the brand new company ID
            const offeringsRes = await fetch(`/api/admin/corptools?type=offerings&state=${encodeURIComponent(formData.state)}&company_id=${cId}`);
            const offeringsData = await offeringsRes.json();
            if (offeringsData.error) throw new Error(offeringsData.error);

            let filteredOfferings = offeringsData.result || [];

            // Filter relevant packages to remove clutter
            if (mainService === 'formation') {
                filteredOfferings = filteredOfferings.filter((o: any) => o.name && ['form a company', 'register a company'].includes(o.name.toLowerCase()));
            } else if (mainService === 'ra') {
                filteredOfferings = filteredOfferings.filter((o: any) => o.name && o.name.toLowerCase().includes('change registered agent'));
            } else if (mainService === 'ein') {
                filteredOfferings = filteredOfferings.filter((o: any) => o.name && o.name.toLowerCase().includes('ein'));
            } else if (mainService === 'compliance') {
                filteredOfferings = filteredOfferings.filter((o: any) => o.name && o.name.toLowerCase().includes('annual report'));
            }

            // Fallback to all offerings safely if none found
            if (!filteredOfferings || filteredOfferings.length === 0) {
                filteredOfferings = offeringsData.result || [];
            }

            setOfferings(filteredOfferings);

            // Skip package selection screen entirely if 'Form a Company' is found or only 1 package was found
            const primaryOption = filteredOfferings.find((o: any) => o.name && o.name.toLowerCase() === 'form a company');
            if (primaryOption) {
                await handleSelectOffering(primaryOption, cId);
            } else if (filteredOfferings.length === 1) {
                await handleSelectOffering(filteredOfferings[0], cId);
            } else {
                setStep(1.5);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to initialize formation.");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOffering = async (offering: any, overrideId?: string) => {
        setSelectedOffering(offering);
        setLoading(true);
        try {
            const cId = overrideId || companyId;
            const methodsRes = await fetch(`/api/admin/corptools?type=methods&company_id=${cId}&filing_product_id=${offering.id}&state=${encodeURIComponent(formData.state)}`);
            const methodsData = await methodsRes.json();
            const methods = methodsData.result || [];

            // Filter duplicate names, prefer 'online'
            const uniqueMethods: any[] = [];
            methods.forEach((m: any) => {
                const existingIndex = uniqueMethods.findIndex(u => u.name.toLowerCase() === m.name.toLowerCase());
                if (existingIndex > -1) {
                    if (m.type === 'online' && uniqueMethods[existingIndex].type !== 'online') {
                        uniqueMethods[existingIndex] = m;
                    }
                } else {
                    uniqueMethods.push(m);
                }
            });

            setFilingMethods(uniqueMethods);
            const initialMethod = uniqueMethods[0] || null;
            setSelectedMethod(initialMethod);

            const schemaRes = await fetch(`/api/admin/corptools?type=schema&company_id=${cId}&product_option_id=${offering.id}&filing_method_id=${initialMethod?.id || ''}`);
            const schemaData = await schemaRes.json();
            setSchema(schemaData.result);
            setStep(2);
            setSubStep(1);
        } catch (error: any) {
            toast.error(error.message || "Failed to initialize details.");
        } finally {
            setLoading(false);
        }
    };

    const renderField = (field: any, prefix = '') => {
        if (field.type === 'hidden') return null;

        const fieldId = field.id || field.name;
        const fieldKey = prefix ? `${prefix}.${fieldId}` : fieldId;
        const labelText = field.title || field.label || field.name || 'Detail';

        const displayLabel = labelText
            .replace(/_/g, ' ')
            .replace(/\./g, ' ')
            .replace(/\b\w/g, (l: string) => l.toUpperCase());

        // Check for specific field types by name/title as well as type
        const isManagementType = displayLabel.toLowerCase().includes('management type') || field.name === 'management_type';
        const isBooleany = field.type === 'boolean' || displayLabel.toLowerCase().includes('is a company') || displayLabel.toLowerCase().includes('is company');
        const isSelecty = field.type === 'select' || field.type === 'radio' || isManagementType || isBooleany;

        // Hide Registered Agent section as we provide it
        if (displayLabel.toLowerCase().includes('registered agent')) {
            return (
                <div key={fieldKey} style={{
                    border: '1px solid rgba(0, 195, 255, 0.3)',
                    padding: '1.5rem',
                    borderRadius: '24px',
                    marginTop: '2rem',
                    background: 'rgba(0, 195, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '4rem', opacity: 0.05, transform: 'rotate(15deg)' }}>🛡️</div>
                    <div style={{ width: '48px', height: '48px', background: 'rgba(0, 195, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🛡️</div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '1rem', color: '#00c3ff', margin: 0, fontWeight: 'bold' }}>OfficialUM1 Registered Agent Service</h4>
                            <span style={{ background: '#00c3ff', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.6rem', fontWeight: 'bold' }}>VERIFIED</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#888', margin: '4px 0 0', lineHeight: '1.4' }}>
                            We are using our <strong>Northwest Registered Agent</strong> professional address. <br />
                            No additional details or filings are required from your side.
                        </p>
                    </div>
                </div>
            );
        }

        // Conditionally render manager vs member based on selected Management Type
        const mgmtType = formData.customFields['management_type'] || formData.customFields['managementType'];
        if (fieldId === 'official.manager' || field.name === 'official.manager') {
            if (mgmtType !== 'manager-managed') return null;
        }
        if (fieldId === 'official.member' || field.name === 'official.member') {
            if (mgmtType !== 'member-managed') return null;
        }

        if (field.type === 'object' && field.fields) {
            const isMailing = displayLabel.toLowerCase().includes('mailing address');
            return (
                <div key={fieldKey} style={{
                    border: '1px solid rgba(0, 255, 136, 0.15)',
                    padding: '1.5rem',
                    borderRadius: '20px',
                    marginTop: '1.5rem',
                    background: 'rgba(0, 255, 136, 0.02)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '18px', background: '#00ff88', borderRadius: '2px' }}></div>
                            <h4 style={{ fontSize: '1rem', color: '#00ff88', margin: 0, fontWeight: 'bold' }}>{displayLabel}</h4>
                        </div>
                        {isMailing && (
                            <button
                                type="button"
                                onClick={() => {
                                    const principal = Object.entries(formData.customFields).filter(([k]) => k.includes('principal_address'));
                                    const newFields = { ...formData.customFields };
                                    principal.forEach(([k, v]) => {
                                        newFields[k.replace('principal_address', 'mailing_address')] = v;
                                    });
                                    setFormData({ ...formData, customFields: newFields });
                                    toast.success("Address copied!");
                                }}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', cursor: 'pointer' }}
                            >
                                Copy from Principal
                            </button>
                        )}
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {field.fields.map((f: any) => renderField(f, fieldKey))}
                    </div>
                </div>
            );
        }

        return (
            <div key={fieldKey} style={{ marginBottom: '0.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#999', marginBottom: '0.6rem', fontWeight: '500' }}>
                    {displayLabel} {field.required && <span style={{ color: '#ff4444' }}>*</span>}
                </label>

                {isBooleany ? (
                    <select
                        required={field.required}
                        className="input-field"
                        style={{ width: '100%', padding: '0.9rem' }}
                        value={formData.customFields[fieldKey] || ''}
                        onChange={e => setFormData({
                            ...formData,
                            customFields: { ...formData.customFields, [fieldKey]: e.target.value }
                        })}
                    >
                        <option value="">Select Yes/No</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select>
                ) : isSelecty ? (
                    <select
                        required={field.required}
                        className="input-field"
                        style={{ width: '100%', padding: '0.9rem' }}
                        value={formData.customFields[fieldKey] || ''}
                        onChange={e => setFormData({
                            ...formData,
                            customFields: { ...formData.customFields, [fieldKey]: e.target.value }
                        })}
                    >
                        <option value="">Select {displayLabel}</option>
                        {field.options && Object.entries(field.options).length > 0 ? Object.entries(field.options).map(([val, desc]: any) => (
                            <option key={val} value={val}>{String(desc)}</option>
                        )) : (
                            isManagementType ? (
                                <>
                                    <option value="member-managed">Member-Managed</option>
                                    <option value="manager-managed">Manager-Managed</option>
                                </>
                            ) : null
                        )}
                    </select>
                ) : (
                    <input
                        required={field.required}
                        type={field.type === 'email' ? 'email' : 'text'}
                        className="input-field"
                        placeholder={`Enter ${displayLabel.toLowerCase()}...`}
                        style={{ width: '100%', padding: '0.9rem' }}
                        value={formData.customFields[fieldKey] || ''}
                        onChange={e => setFormData({
                            ...formData,
                            customFields: { ...formData.customFields, [fieldKey]: e.target.value }
                        })}
                    />
                )}
                {field.help_text && <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.5rem', lineHeight: '1.5' }}>{field.help_text}</p>}
                {field.description && <p style={{ fontSize: '0.75rem', color: '#555', marginTop: '0.4rem', lineHeight: '1.4' }}>{field.description}</p>}
            </div>
        );
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let addOnTotal = 0;
            if (addOns.ein) addOnTotal += 50;
            if (addOns.agreement) addOnTotal += 40;
            if (addOns.compliance) addOnTotal += 100;
            if (addOns.virtualOffice) addOnTotal += 29;

            const totalBudget = 20 + 125 + (selectedMethod?.cost || 0) + addOnTotal; // $20 Service + $125 RA + State Fee + Addons
            // Save as Lead
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    clientName: formData.name,
                    platform: `US ${mainService === 'formation' ? 'Formation' : 'Service'} (${formData.state})`,
                    budget: totalBudget,
                    buyerEmail: formData.email,
                    notes: `Type: ${mainService} | Contact: ${formData.email} | Package: ${selectedOffering?.label || selectedOffering?.name} | Speed: ${selectedMethod?.name} | Entity: ${formData.entityType} | CT_ID: ${companyId} | Addons: EIN(${addOns.ein}) OA(${addOns.agreement}) Compliance(${addOns.compliance}) Mail(${addOns.virtualOffice}) | Breakdown: State($${selectedMethod?.cost}) RA($125) Service($20) | Params: ${JSON.stringify(formData.customFields)}`
                })
            });
            setStep(3);
            toast.success("Lead captured! Our agent will contact you shortly.");
        } catch (error) {
            toast.error("Failed to save lead.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ minHeight: '100vh' }}>
            <Navbar />
            <Toaster position="top-right" richColors />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'US Business Hub' }]}
                    label="Services"
                    title="US Business Hub"
                    description="All-in-one platform for US business formation and compliance."
                />
            </div>

            <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '96px', maxWidth: '900px' }}>

                {/* Progress Bar */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '3rem' }}>
                    {[1, 1.5, 2, 3].map(i => (
                        <div key={i} style={{
                            flex: 1,
                            height: '4px',
                            background: step >= i ? 'rgba(79,70,229,0.85)' : 'rgba(2,6,23,0.10)',
                            borderRadius: '2px',
                            transition: 'all 0.5s ease'
                        }} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="card"
                            style={{ padding: 'clamp(1.5rem, 5vw, 3.0rem)', borderRadius: '24px', textAlign: 'center' }}
                        >
                            <h1 style={{ fontSize: 'clamp(2rem, 8vw, 2.6rem)', marginBottom: '0.75rem', fontWeight: '900', color: 'var(--fg)' }}>Choose a service</h1>
                            <p style={{ color: 'var(--muted)', marginBottom: '2rem', fontSize: 'clamp(0.95rem, 2.7vw, 1.1rem)' }}>
                                Start a new company, update an existing one, or stay compliant—step by step.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', textAlign: 'left' }}>
                                {[
                                    { id: 'formation', icon: <Building2 size={22} />, title: 'Start New Business', desc: 'LLC or Corporation formation in any US state.' },
                                    { id: 'ra', icon: <UserRound size={22} />, title: 'Registered Agent', desc: 'Secure, reliable agent for your existing company.' },
                                    { id: 'ein', icon: <FileText size={22} />, title: 'Get EIN / Tax ID', desc: 'Fast Tax ID processing for domestic/international users.' },
                                    { id: 'compliance', icon: <ShieldCheck size={22} />, title: 'Annual Reports', desc: 'Stay in good standing with state-level compliance.' }
                                ].map((sv) => (
                                    <div
                                        key={sv.id}
                                        onClick={() => { setMainService(sv.id as any); setStep(1); }}
                                        className="service-type-card"
                                        style={{
                                            padding: '2rem',
                                            borderRadius: '24px',
                                            border: mainService === sv.id ? '2px solid rgba(79,70,229,0.65)' : '1px solid var(--border)',
                                            background: mainService === sv.id ? 'rgba(79,70,229,0.06)' : 'rgba(255,255,255,0.60)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        <div style={{ width: 44, height: 44, borderRadius: 16, border: '1px solid var(--border)', display: 'grid', placeItems: 'center', background: 'rgba(79,70,229,0.06)', color: 'var(--indigo)', marginBottom: '1rem' }}>
                                            {sv.icon}
                                        </div>
                                        <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', color: 'var(--fg)', fontWeight: 900 }}>{sv.title}</h3>
                                        <p style={{ fontSize: '0.92rem', color: 'var(--muted)', lineHeight: '1.5' }}>{sv.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="card"
                            style={{ padding: 'clamp(1.5rem, 5vw, 3.0rem)', borderRadius: '24px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h2 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', margin: 0, color: 'var(--fg)', fontWeight: 900 }}>Basic Information</h2>
                                <Badge>{mainService.replace('_', ' ')}</Badge>
                            </div>

                            <form onSubmit={handleInitialSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                                        {mainService === 'formation' ? 'Desired Business Name' : 'Existing Business Name'}
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="input-field"
                                        placeholder="e.g. Acme Ventures LLC"
                                        style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="responsive-grid">
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Jurisdiction (State)</label>
                                        <select
                                            className="input-field"
                                            style={{ width: '100%', padding: '1rem' }}
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        >
                                            {US_STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                                        </select>
                                        <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: '#00ff88', fontWeight: 'bold' }}>
                                            Est. State Fee: ${US_STATES.find(s => s.name === formData.state)?.fee || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>Entity Type</label>
                                        <select
                                            className="input-field"
                                            style={{ width: '100%', padding: '1rem' }}
                                            value={formData.entityType}
                                            onChange={e => setFormData({ ...formData, entityType: e.target.value })}
                                        >
                                            <option value="Limited Liability Company">LLC</option>
                                            <option value="Corporation">Corporation</option>
                                            <option value="Nonprofit Corporation">Nonprofit</option>
                                            <option value="Limited Partnership">LP</option>
                                            <option value="Limited Liability Partnership">LLP</option>
                                            <option value="Professional Limited Liability Company">PLLC</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}
                                >
                                    {loading ? 'Processing...' : (mainService === 'formation' ? 'Review Formation Packages →' : 'See Service Pricing →')}
                                </button>

                                <button type="button" onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem', marginTop: '1rem' }}>
                                    ← Back to Hub
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 1.5 && (
                        <motion.div
                            key="step1.5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass"
                            style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', borderRadius: '24px', border: '1px solid rgba(0,255,136,0.1)' }}
                        >
                            <h2 className="text-gradient" style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', marginBottom: '1rem' }}>Choose Your Package</h2>
                            <p style={{ color: '#aaa', marginBottom: '2.5rem', fontSize: '0.9rem' }}>Available formation packages for {formData.state}. Select the one that fits your needs.</p>

                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {offerings.map((offering: any) => (
                                    <div
                                        key={offering.id}
                                        onClick={() => handleSelectOffering(offering)}
                                        className="package-card"
                                        style={{
                                            padding: '1.5rem',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(255,255,255,0.02)',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ flex: '1 1 200px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>{offering.label || offering.name}</h3>
                                            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: '#666' }}>{offering.description || 'Full formation service included.'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00ff88' }}>${offering.price}</div>
                                            {offering.retail_price && <div style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: '#444' }}>${offering.retail_price}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {loading && (
                                <div style={{ marginTop: '2rem', textAlign: 'center', color: '#00ff88' }}>
                                    Initializing {formData.name}... This takes a few seconds.
                                </div>
                            )}

                            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem', marginTop: '2rem' }}>
                                ← Change State/Name
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="glass"
                            style={{ padding: '3rem', borderRadius: '24px', border: '1px solid rgba(0,255,136,0.1)' }}
                        >
                            <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Filing Information</h2>
                            <p style={{ color: '#aaa', marginBottom: '2rem' }}>Full name and details for {formData.state} {formData.entityType} ({selectedOffering?.label || selectedOffering?.name}).</p>

                            {/* Price Breakdown Card */}
                            <div style={{
                                background: 'rgba(255,255,255,0.03)',
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                marginBottom: '2.5rem'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#aaa' }}>OfficialUM1 Service Fee</span>
                                    <span style={{ color: '#00ff88', fontWeight: 'bold' }}>$20.00</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#aaa' }}>Registered Agent Service (Included)</span>
                                    <span style={{ color: '#fff' }}>$125.00</span>
                                </div>
                                <div style={{ background: 'rgba(0,255,136,0.1)', padding: '10px 15px', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid rgba(0,255,136,0.2)' }}>
                                    <p style={{ fontSize: '0.75rem', color: '#00ff88', margin: 0, fontWeight: '500' }}>
                                        🔄 Automatic Renewal: $125/year (Agent Fee).
                                    </p>
                                    <p style={{ fontSize: '0.65rem', color: '#aaa', marginTop: '4px' }}>
                                        Registered Agent at Northwest address included.
                                    </p>
                                </div>
                                {(selectedMethod?.cost >= 0) && filingMethods.length > 0 && (
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                            <span style={{ color: '#aaa' }}>State Fee ({formData.state})</span>
                                            <span style={{ color: '#fff' }}>${Math.min(...filingMethods.map((m: any) => m.cost))}</span>
                                        </div>
                                        {selectedMethod.cost - Math.min(...filingMethods.map((m: any) => m.cost)) > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
                                                <span style={{ color: '#aaa' }}>Speed Upgrade ({selectedMethod.name})</span>
                                                <span style={{ color: '#fff' }}>${selectedMethod.cost - Math.min(...filingMethods.map((m: any) => m.cost))}</span>
                                            </div>
                                        )}
                                        {selectedMethod.cost - Math.min(...filingMethods.map((m: any) => m.cost)) === 0 && (
                                            <div style={{ marginBottom: '1.2rem' }} />
                                        )}
                                    </>
                                )}

                                {/* Modern Add-ons */}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem', marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '1rem', color: '#888' }}>Recommended Add-ons</h4>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <div
                                            onClick={() => setAddOns({ ...addOns, ein: !addOns.ein })}
                                            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', background: addOns.ein ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid ' + (addOns.ein ? '#00ff88' : 'rgba(255,255,255,0.05)'), cursor: 'pointer' }}
                                        >
                                            <span style={{ fontSize: '0.85rem' }}>{addOns.ein ? '✅' : '➕'} EIN Tax ID Service</span>
                                            <span style={{ fontWeight: 'bold' }}>+$50.00</span>
                                        </div>
                                        <div
                                            onClick={() => setAddOns({ ...addOns, agreement: !addOns.agreement })}
                                            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', background: addOns.agreement ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid ' + (addOns.agreement ? '#00ff88' : 'rgba(255,255,255,0.05)'), cursor: 'pointer' }}
                                        >
                                            <span style={{ fontSize: '0.85rem' }}>{addOns.agreement ? '✅' : '➕'} Custom Operating Agreement</span>
                                            <span style={{ fontWeight: 'bold' }}>+$40.00</span>
                                        </div>
                                        <div
                                            onClick={() => setAddOns({ ...addOns, compliance: !addOns.compliance })}
                                            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', background: addOns.compliance ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid ' + (addOns.compliance ? '#00ff88' : 'rgba(255,255,255,0.05)'), cursor: 'pointer' }}
                                        >
                                            <span style={{ fontSize: '0.85rem' }}>{addOns.compliance ? '✅' : '➕'} Full Compliance Service</span>
                                            <span style={{ fontWeight: 'bold' }}>+$100.00</span>
                                        </div>
                                        <div
                                            onClick={() => setAddOns({ ...addOns, virtualOffice: !addOns.virtualOffice })}
                                            style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 15px', borderRadius: '12px', background: addOns.virtualOffice ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.02)', border: '1px solid ' + (addOns.virtualOffice ? '#00ff88' : 'rgba(255,255,255,0.05)'), cursor: 'pointer' }}
                                        >
                                            <span style={{ fontSize: '0.85rem' }}>{addOns.virtualOffice ? '✅' : '➕'} Virtual Office / Mail Scanning</span>
                                            <span style={{ fontWeight: 'bold' }}>+$29.00</span>
                                        </div>
                                    </div>
                                </div>


                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontWeight: 'bold' }}>Total Case Value</span>
                                    <span style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '1.5rem' }}>
                                        ${20 + 125 + (selectedMethod?.cost || 0) + (addOns.ein ? 50 : 0) + (addOns.agreement ? 40 : 0) + (addOns.compliance ? 100 : 0) + (addOns.virtualOffice ? 29 : 0)}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); subStep === 1 ? setSubStep(2) : handleFinalSubmit(e); }} style={{ display: 'grid', gap: '1.5rem' }}>
                                {subStep === 1 ? (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {/* Speed Selection Cards - Only show if there are multiple options */}
                                        {filingMethods.length > 1 && (
                                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(0,255,136,0.1)', marginBottom: '2rem' }}>
                                                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <span style={{ background: '#00ff88', color: '#000', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>1</span>
                                                    Choose Filing Speed
                                                </h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                    {filingMethods.map((m: any) => {
                                                        const baseCost = Math.min(...filingMethods.map(fm => fm.cost));
                                                        const upgradeCost = m.cost - baseCost;

                                                        return (
                                                            <div
                                                                key={m.id}
                                                                onClick={async () => {
                                                                    setSelectedMethod(m);
                                                                    const schemaRes = await fetch(`/api/admin/corptools?type=schema&company_id=${companyId}&product_option_id=${selectedOffering.id}&filing_method_id=${m.id}`);
                                                                    const schemaData = await schemaRes.json();
                                                                    setSchema(schemaData.result);
                                                                }}
                                                                style={{
                                                                    padding: '1.5rem',
                                                                    borderRadius: '16px',
                                                                    border: selectedMethod?.id === m.id ? '2px solid #00ff88' : '1px solid rgba(255,255,255,0.05)',
                                                                    background: selectedMethod?.id === m.id ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.02)',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'center',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{m.name}</div>
                                                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '0.2rem' }}>
                                                                    {upgradeCost === 0 ? 'FREE' : `+$${upgradeCost}`}
                                                                </div>
                                                                <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>Speed Upgrade</div>
                                                                <div style={{ fontSize: '0.85rem', color: '#00ff88', fontWeight: 'bold' }}>
                                                                    {m.name.toLowerCase().includes('standard') ? '6 Business Days' : `${m.docs_in?.days || 0} Business Days`}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px', marginBottom: '2rem' }}>
                                            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ background: '#00c3ff', color: '#000', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold' }}>
                                                    {filingMethods.length > 1 ? '2' : '1'}
                                                </span>
                                                Contact Email
                                            </h3>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', color: '#999', marginBottom: '0.8rem', fontWeight: '500' }}>Your Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    className="input-field"
                                                    placeholder="admin@example.com"
                                                    style={{ width: '100%', padding: '1.1rem' }}
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSubStep(2)}
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem' }}
                                        >
                                            Continue to Company Details →
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <span style={{ width: '32px', height: '32px', background: '#00c3ff', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>3</span>
                                                Final Specifics
                                            </h3>
                                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                                {schema && schema.map((field: any) => renderField(field))}
                                            </div>
                                        </div>

                                        <button
                                            disabled={loading}
                                            type="submit"
                                            className="btn btn-primary"
                                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}
                                        >
                                            {loading ? 'Submitting Details...' : 'Submit Formation & Register Agent ✔'}
                                        </button>

                                        <button type="button" onClick={() => setSubStep(1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
                                            ← Back to Options
                                        </button>
                                    </div>
                                )}

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', marginTop: '1rem' }}
                                >
                                    {loading ? 'Submitting Details...' : 'Submit Formation & Register Agent ✔'}
                                </button>

                                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    ← Go Back
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass"
                            style={{ padding: '4rem 3rem', borderRadius: '24px', border: '1px solid #00ff88', textAlign: 'center' }}
                        >
                            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏢</div>
                            <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Request Received!</h2>
                            <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                                Your business formation details for <strong>{formData.name}</strong> have been successfully submitted.<br /><br />
                                Our business formation agents are now reviewing the requirements for <strong>{formData.state}</strong>.<br />
                                We will contact you at <strong>{formData.email}</strong> within 12-24 hours with the next steps and payment link.
                            </p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn btn-outline"
                                style={{ padding: '1rem 3rem' }}
                            >
                                Return Home
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <p style={{ color: '#444', fontSize: '0.8rem' }}>
                        Managed by OfficialUM1 Business Services. All rights reserved.
                    </p>
                </div>
            </div>

            <Footer />

            <style jsx>{`
                .glass {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                }
                .text-gradient {
                    background: linear-gradient(135deg, #fff 0%, #00ff88 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .input-field {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    border-radius: 12px;
                    outline: none;
                    transition: all 0.3s;
                }
                .input-field:focus {
                    border-color: #00ff88;
                    background: rgba(255,255,255,0.08);
                }
                .package-card:hover {
                    background: rgba(0, 255, 136, 0.05) !important;
                    border-color: rgba(0, 255, 136, 0.3) !important;
                    transform: translateY(-2px);
                }
                .responsive-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }
                @media (max-width: 640px) {
                    .responsive-grid {
                        grid-template-columns: 1fr;
                    }
                    .glass {
                        padding: 1.5rem !important;
                    }
                    main {
                        padding-top: 80px !important;
                    }
                }
                @media (max-width: 768px) {
                    .glass { padding: 2rem !important; }
                }
            `}</style>
        </main>
    );
}
