"use client";

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { PageHero } from '@/components/ui/PageHero';
import { Badge } from '@/components/ui/Badge';
import { Building2, CheckCircle2, FileText, ShieldCheck, UserRound, ArrowRight, ArrowLeft, Check, Sparkles, Mail, MapPin, Zap } from 'lucide-react';

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
    const [subStep, setSubStep] = useState(1);

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

            // Skip package selection screen if 'Form a Company' is found or only 1 package
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

        // Hide Registered Agent section as we provide Northwest RA natively
        if (displayLabel.toLowerCase().includes('registered agent')) {
            return (
                <div key={fieldKey} style={{
                    border: '1px solid rgba(20, 108, 120, 0.25)',
                    padding: '1.5rem',
                    borderRadius: '18px',
                    marginTop: '1.5rem',
                    background: 'rgba(20, 108, 120, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    position: 'relative',
                }}>
                    <div style={{ width: '48px', height: '48px', minWidth: '48px', background: 'rgba(20, 108, 120, 0.12)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <ShieldCheck size={26} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>OfficialUM1 Registered Agent Service</h4>
                            <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 'bold' }}>VERIFIED</span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0', lineHeight: '1.4' }}>
                            We provide our official <strong>Northwest Registered Agent</strong> commercial street address in {formData.state}. <br />
                            No personal address exposure or extra filing required from your side.
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
                    border: '1px solid var(--border-subtle)',
                    padding: '1.5rem',
                    borderRadius: '18px',
                    marginTop: '1.5rem',
                    background: 'var(--bg-alt)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '4px', height: '18px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}>{displayLabel}</h4>
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
                                    toast.success("Address copied from Principal Address!");
                                }}
                                style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600' }}
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
            <div key={fieldKey} style={{ marginBottom: '0.6rem' }}>
                <label style={{ display: 'block', fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: '0.4rem', fontWeight: '600' }}>
                    {displayLabel} {field.required && <span style={{ color: 'var(--primary-2)' }}>*</span>}
                </label>

                {isBooleany ? (
                    <select
                        required={field.required}
                        className="business-input"
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
                        className="business-input"
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
                                    <option value="member-managed">Member-Managed (Standard for single/multiple owners)</option>
                                    <option value="manager-managed">Manager-Managed (Managed by appointed managers)</option>
                                </>
                            ) : null
                        )}
                    </select>
                ) : (
                    <input
                        required={field.required}
                        type={field.type === 'email' ? 'email' : 'text'}
                        className="business-input"
                        placeholder={`Enter ${displayLabel.toLowerCase()}...`}
                        value={formData.customFields[fieldKey] || ''}
                        onChange={e => setFormData({
                            ...formData,
                            customFields: { ...formData.customFields, [fieldKey]: e.target.value }
                        })}
                    />
                )}
                {field.help_text && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.4' }}>{field.help_text}</p>}
                {field.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: '1.4' }}>{field.description}</p>}
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

            const stateCost = selectedMethod?.cost || (US_STATES.find(s => s.name === formData.state)?.fee || 0);
            const totalBudget = 50 + 125 + stateCost + addOnTotal; // $50 Service + $125 RA + State Fee + Addons

            // Save as Lead in CRM
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    clientName: formData.name,
                    platform: `US Business Formation (${formData.state})`,
                    budget: totalBudget,
                    buyerEmail: formData.email,
                    notes: `Type: ${mainService} | Contact: ${formData.email} | Package: ${selectedOffering?.label || selectedOffering?.name || 'Standard'} | Speed: ${selectedMethod?.name || 'Standard'} | Entity: ${formData.entityType} | CT_ID: ${companyId} | Addons: EIN(${addOns.ein ? 'Yes' : 'No'}) OA(${addOns.agreement ? 'Yes' : 'No'}) Compliance(${addOns.compliance ? 'Yes' : 'No'}) Mail(${addOns.virtualOffice ? 'Yes' : 'No'}) | Breakdown: State($${stateCost}) RA($125) Service($50) | Params: ${JSON.stringify(formData.customFields)}`
                })
            });
            setStep(3);
            toast.success("Application successfully submitted! Our team will contact you shortly.");
        } catch (error) {
            toast.error("Failed to submit formation application.");
        } finally {
            setLoading(false);
        }
    };

    const currentStateFee = selectedMethod?.cost || (US_STATES.find(s => s.name === formData.state)?.fee || 0);
    const calculatedTotal = 50 + 125 + currentStateFee + (addOns.ein ? 50 : 0) + (addOns.agreement ? 40 : 0) + (addOns.compliance ? 100 : 0) + (addOns.virtualOffice ? 29 : 0);

    return (
        <main className="inner-page" style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
            <Navbar />
            <Toaster position="top-right" richColors />

            <div style={{ paddingTop: '80px' }}>
                <PageHero
                    breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'US Business Hub' }]}
                    label="Services"
                    title="US Business Hub"
                    description="Launch and scale your US company with Northwest Registered Agent verified compliance."
                />
            </div>

            <div className="container" style={{ paddingTop: '2rem', paddingBottom: '96px', maxWidth: '860px' }}>

                {/* Modern Step Indicator */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', gap: '8px' }}>
                    {[
                        { stepIndex: 0, label: "Select Service" },
                        { stepIndex: 1, label: "Company Details" },
                        { stepIndex: 2, label: "Filing Specifics" },
                        { stepIndex: 3, label: "Confirmation" }
                    ].map((st, idx) => (
                        <div key={st.stepIndex} style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                background: step >= st.stepIndex ? 'var(--primary)' : 'var(--border-subtle)',
                                color: step >= st.stepIndex ? '#ffffff' : 'var(--text-muted)',
                                transition: 'all 0.3s ease'
                            }}>
                                {step > st.stepIndex ? '✓' : idx + 1}
                            </div>
                            <span style={{ fontSize: '0.82rem', fontWeight: step >= st.stepIndex ? '700' : '500', color: step >= st.stepIndex ? 'var(--text-primary)' : 'var(--text-muted)' }} className="hidden sm:inline">
                                {st.label}
                            </span>
                            {idx < 3 && <div style={{ flex: 1, height: '2px', background: step > st.stepIndex ? 'var(--primary)' : 'var(--border-subtle)', transition: 'all 0.3s ease' }} />}
                        </div>
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 0: Choose Service */}
                    {step === 0 && (
                        <motion.div
                            key="step0"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="business-card"
                            style={{ padding: 'clamp(1.5rem, 5vw, 3rem)', textAlign: 'center' }}
                        >
                            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginBottom: '0.6rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                Choose a Service
                            </h1>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem' }}>
                                Fast, compliant US formation and legal support tailored for international and domestic entrepreneurs.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', textAlign: 'left' }}>
                                {[
                                    { id: 'formation', icon: <Building2 size={24} />, title: 'Start New Business', desc: 'LLC or Corporation formation in any of the 50 US states.' },
                                    { id: 'ra', icon: <UserRound size={24} />, title: 'Registered Agent', desc: 'Secure, professional registered agent for your existing company.' },
                                    { id: 'ein', icon: <FileText size={24} />, title: 'Get EIN / Tax ID', desc: 'Federal Tax ID processing with IRS for non-residents and US citizens.' },
                                    { id: 'compliance', icon: <ShieldCheck size={24} />, title: 'Annual Reports', desc: 'Stay in good standing with state-level compliance and filings.' }
                                ].map((sv) => (
                                    <div
                                        key={sv.id}
                                        onClick={() => { setMainService(sv.id as any); setStep(1); }}
                                        className="service-selection-card"
                                        style={{
                                            padding: '1.75rem',
                                            borderRadius: '20px',
                                            border: mainService === sv.id ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                                            background: '#ffffff',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                                            transition: 'all 0.25s ease'
                                        }}
                                    >
                                        <div style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', background: 'rgba(20, 108, 120, 0.08)', color: 'var(--primary)', marginBottom: '1.2rem' }}>
                                            {sv.icon}
                                        </div>
                                        <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>{sv.title}</h3>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5', margin: 0 }}>{sv.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 1: Basic Info */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="business-card"
                            style={{ padding: 'clamp(1.5rem, 5vw, 3rem)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)', fontWeight: '800', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>Basic Information</h2>
                                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>Choose your jurisdiction state and desired company legal name.</p>
                                </div>
                                <span style={{ background: 'rgba(20, 108, 120, 0.1)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                                    {mainService.toUpperCase()}
                                </span>
                            </div>

                            <form onSubmit={handleInitialSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                        {mainService === 'formation' ? 'Desired Business Name' : 'Existing Business Name'} <span style={{ color: 'var(--primary-2)' }}>*</span>
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        className="business-input"
                                        placeholder="e.g. Acme Innovations LLC"
                                        style={{ width: '100%', fontSize: '1.05rem', padding: '0.9rem 1.1rem' }}
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            Jurisdiction (US State)
                                        </label>
                                        <select
                                            className="business-input"
                                            style={{ width: '100%' }}
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                        >
                                            {US_STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                                        </select>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: '700' }}>
                                            State Government Fee: ${US_STATES.find(s => s.name === formData.state)?.fee || 0}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                            Entity Type
                                        </label>
                                        <select
                                            className="business-input"
                                            style={{ width: '100%' }}
                                            value={formData.entityType}
                                            onChange={e => setFormData({ ...formData, entityType: e.target.value })}
                                        >
                                            <option value="Limited Liability Company">Limited Liability Company (LLC)</option>
                                            <option value="Corporation">Corporation (C-Corp / S-Corp)</option>
                                            <option value="Nonprofit Corporation">Nonprofit Corporation</option>
                                            <option value="Limited Partnership">Limited Partnership (LP)</option>
                                            <option value="Limited Liability Partnership">Limited Liability Partnership (LLP)</option>
                                            <option value="Professional Limited Liability Company">Professional LLC (PLLC)</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    disabled={loading}
                                    type="submit"
                                    className="business-cta-btn"
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
                                >
                                    {loading ? 'Connecting to Northwest API...' : (mainService === 'formation' ? 'Continue to Filing Options →' : 'See Service Pricing →')}
                                </button>

                                <button type="button" onClick={() => setStep(0)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'center' }}>
                                    ← Back to Services
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 1.5: Package Selection (if multiple) */}
                    {step === 1.5 && (
                        <motion.div
                            key="step1.5"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="business-card"
                            style={{ padding: 'clamp(1.5rem, 5vw, 3rem)' }}
                        >
                            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '800', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                Choose Your Package
                            </h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.95rem' }}>
                                Available formation packages for {formData.state}. Select the one that matches your requirements.
                            </p>

                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                {offerings.map((offering: any) => (
                                    <div
                                        key={offering.id}
                                        onClick={() => handleSelectOffering(offering)}
                                        className="package-choice-card"
                                        style={{
                                            padding: '1.5rem',
                                            borderRadius: '16px',
                                            border: '1px solid var(--border-subtle)',
                                            background: '#ffffff',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                                            transition: 'all 0.2s ease',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            gap: '1rem'
                                        }}
                                    >
                                        <div style={{ flex: '1 1 200px' }}>
                                            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: '700' }}>{offering.label || offering.name}</h3>
                                            <p style={{ margin: '0.3rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>{offering.description || 'Full statutory formation & compliance included.'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>${offering.price}</div>
                                            {offering.retail_price && <div style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>${offering.retail_price}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {loading && (
                                <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--primary)', fontWeight: '600' }}>
                                    Initializing {formData.name}...
                                </div>
                            )}

                            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginTop: '1.5rem' }}>
                                ← Change State or Name
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: Filing Information & Breakdown */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="business-card"
                            style={{ padding: 'clamp(1.5rem, 5vw, 3rem)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', margin: 0, color: 'var(--text-primary)', fontWeight: '800', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                        Filing Information
                                    </h2>
                                    <p style={{ color: 'var(--text-muted)', margin: '4px 0 0', fontSize: '0.9rem' }}>
                                        Details for {formData.state} {formData.entityType} ({formData.name}).
                                    </p>
                                </div>
                                <span style={{ background: 'rgba(20, 108, 120, 0.1)', color: 'var(--primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
                                    STEP {subStep} OF 2
                                </span>
                            </div>

                            {/* Crisp Price Breakdown Card */}
                            <div style={{
                                background: '#ffffff',
                                padding: '1.5rem',
                                borderRadius: '18px',
                                border: '1px solid var(--border-subtle)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                                marginBottom: '2rem'
                            }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Case Fee Breakdown
                                </h3>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>OfficialUM1 Service Fee</span>
                                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>$50.00</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Northwest Registered Agent Service (Included)</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>$125.00</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>State Government Fee ({formData.state})</span>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>${currentStateFee}</span>
                                </div>

                                {selectedMethod && selectedMethod.cost - (filingMethods.length > 0 ? Math.min(...filingMethods.map((m: any) => m.cost)) : 0) > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.85rem', fontSize: '0.92rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Speed Upgrade ({selectedMethod.name})</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                                            +${selectedMethod.cost - Math.min(...filingMethods.map((m: any) => m.cost))}
                                        </span>
                                    </div>
                                )}

                                {/* Recommended Add-ons */}
                                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1.2rem', marginTop: '1rem', marginBottom: '1.2rem' }}>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Recommended Add-ons</h4>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        <div
                                            onClick={() => setAddOns({ ...addOns, ein: !addOns.ein })}
                                            className="addon-row"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                borderRadius: '12px',
                                                background: addOns.ein ? 'rgba(20, 108, 120, 0.06)' : '#ffffff',
                                                border: addOns.ein ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {addOns.ein ? '✅' : '➕'} EIN Federal Tax ID Service
                                            </span>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>+$50.00</span>
                                        </div>

                                        <div
                                            onClick={() => setAddOns({ ...addOns, agreement: !addOns.agreement })}
                                            className="addon-row"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                borderRadius: '12px',
                                                background: addOns.agreement ? 'rgba(20, 108, 120, 0.06)' : '#ffffff',
                                                border: addOns.agreement ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {addOns.agreement ? '✅' : '➕'} Custom Operating Agreement
                                            </span>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>+$40.00</span>
                                        </div>

                                        <div
                                            onClick={() => setAddOns({ ...addOns, compliance: !addOns.compliance })}
                                            className="addon-row"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                borderRadius: '12px',
                                                background: addOns.compliance ? 'rgba(20, 108, 120, 0.06)' : '#ffffff',
                                                border: addOns.compliance ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {addOns.compliance ? '✅' : '➕'} Annual Compliance & Corporate Veil
                                            </span>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>+$100.00</span>
                                        </div>

                                        <div
                                            onClick={() => setAddOns({ ...addOns, virtualOffice: !addOns.virtualOffice })}
                                            className="addon-row"
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '10px 14px',
                                                borderRadius: '12px',
                                                background: addOns.virtualOffice ? 'rgba(20, 108, 120, 0.06)' : '#ffffff',
                                                border: addOns.virtualOffice ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                                {addOns.virtualOffice ? '✅' : '➕'} Virtual Office / Mail Scanning
                                            </span>
                                            <span style={{ fontWeight: '700', color: 'var(--primary)' }}>+$29.00</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '1.05rem' }}>Total Case Value</span>
                                    <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.6rem', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                        ${calculatedTotal}
                                    </span>
                                </div>
                            </div>

                            <form onSubmit={(e) => { e.preventDefault(); subStep === 1 ? setSubStep(2) : handleFinalSubmit(e); }} style={{ display: 'grid', gap: '1.5rem' }}>
                                {subStep === 1 ? (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {/* Speed Selection */}
                                        {filingMethods.length > 1 && (
                                            <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: '700' }}>
                                                    <span style={{ background: 'var(--primary)', color: '#fff', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.8rem', fontWeight: 'bold' }}>1</span>
                                                    Choose Filing Speed
                                                </h3>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                                    {filingMethods.map((m: any) => {
                                                        const baseCost = Math.min(...filingMethods.map(fm => fm.cost));
                                                        const upgradeCost = m.cost - baseCost;
                                                        const isSelected = selectedMethod?.id === m.id;

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
                                                                    padding: '1.25rem',
                                                                    borderRadius: '14px',
                                                                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                                                                    background: isSelected ? 'rgba(20, 108, 120, 0.05)' : '#ffffff',
                                                                    cursor: 'pointer',
                                                                    textAlign: 'center',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>{m.name}</div>
                                                                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                                                                    {upgradeCost === 0 ? 'STANDARD' : `+$${upgradeCost}`}
                                                                </div>
                                                                <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700' }}>
                                                                    {m.name.toLowerCase().includes('standard') ? '5-7 Business Days' : `${m.docs_in?.days || 2} Business Days`}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Contact Email */}
                                        <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', padding: '1.75rem', borderRadius: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', fontWeight: '700' }}>
                                                <span style={{ background: 'var(--primary)', color: '#fff', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {filingMethods.length > 1 ? '2' : '1'}
                                                </span>
                                                Contact Email & Notifications
                                            </h3>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
                                                    Your Primary Email Address <span style={{ color: 'var(--primary-2)' }}>*</span>
                                                </label>
                                                <input
                                                    required
                                                    type="email"
                                                    className="business-input"
                                                    placeholder="youremail@company.com"
                                                    style={{ width: '100%', padding: '0.9rem 1.1rem' }}
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                />
                                                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                                    Articles of Organization, State Certificates, and EIN will be delivered to this address.
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSubStep(2)}
                                            className="business-cta-btn"
                                            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
                                        >
                                            Continue to State Questions →
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div style={{ background: '#ffffff', padding: '1.75rem', borderRadius: '18px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                                            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '700' }}>
                                                <span style={{ width: '26px', height: '26px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                    {filingMethods.length > 1 ? '3' : '2'}
                                                </span>
                                                {formData.state} Statutory Specifics
                                            </h3>
                                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                                {schema && schema.map((field: any) => renderField(field))}
                                            </div>
                                        </div>

                                        <button
                                            disabled={loading}
                                            type="submit"
                                            className="business-cta-btn"
                                            style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}
                                        >
                                            {loading ? 'Submitting Application...' : 'Submit Formation Application ✔'}
                                        </button>

                                        <button type="button" onClick={() => setSubStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'center' }}>
                                            ← Back to Contact & Speed Options
                                        </button>
                                    </div>
                                )}

                                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'center', marginTop: '0.5rem' }}>
                                    ← Change Business Name or State
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 3: Confirmation */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="business-card"
                            style={{ padding: 'clamp(2rem, 6vw, 3.5rem)', textAlign: 'center' }}
                        >
                            <div style={{ width: '70px', height: '70px', background: 'rgba(20, 108, 120, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 1.5rem' }}>
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                Application Received!
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                                Your business formation case for <strong>{formData.name}</strong> ({formData.state}) has been successfully submitted to OfficialUM1 Business Registry.<br /><br />
                                Our filing specialists are reviewing your state specifics. We will send the final confirmation and invoice breakdown to <strong>{formData.email}</strong> shortly.
                            </p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="business-cta-btn"
                                style={{ padding: '0.9rem 2.5rem', display: 'inline-block' }}
                            >
                                Return to Home
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Footer />

            <style jsx>{`
                .business-card {
                    background: #ffffff;
                    border: 1px solid var(--border-subtle);
                    border-radius: 24px;
                    box-shadow: 0 12px 34px rgba(20, 108, 120, 0.06);
                }
                .business-input {
                    background: #ffffff;
                    border: 1px solid var(--border-subtle);
                    color: var(--text-primary);
                    border-radius: 12px;
                    padding: 0.85rem 1rem;
                    font-size: 0.95rem;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    box-sizing: border-box;
                }
                .business-input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 3px rgba(20, 108, 120, 0.12);
                }
                .business-cta-btn {
                    background: linear-gradient(135deg, var(--accent-blue), var(--accent-violet));
                    color: #ffffff;
                    border: none;
                    border-radius: 9999px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 8px 24px rgba(20, 108, 120, 0.25);
                }
                .business-cta-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 30px rgba(20, 108, 120, 0.35);
                }
                .business-cta-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .service-selection-card:hover {
                    border-color: var(--primary) !important;
                    transform: translateY(-3px);
                    box-shadow: 0 10px 25px rgba(20, 108, 120, 0.08) !important;
                }
                .package-choice-card:hover {
                    border-color: var(--primary) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </main>
    );
}
