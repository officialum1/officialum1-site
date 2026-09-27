"use client";

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { 
    Building2, Search, RefreshCw, Mail, Phone, ExternalLink, 
    FileText, ShieldCheck, AlertCircle, CheckCircle2, Copy, 
    Clock, DollarSign, Filter, ChevronRight, X, Edit3, Send
} from 'lucide-react';

interface BusinessTabProps {
    fetchData?: (user?: any) => Promise<void>;
}

export default function BusinessTab({ fetchData }: BusinessTabProps) {
    const [formations, setFormations] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [editingStatus, setEditingStatus] = useState<string>('');
    const [adminNotes, setAdminNotes] = useState<string>('');
    const [isSaving, setIsSaving] = useState(false);

    const [jurisdictionFilter, setJurisdictionFilter] = useState<'all' | 'us' | 'uk'>('all');

    const loadAllData = async () => {
        setLoading(true);
        try {
            // 1. Fetch CRM Leads for US & UK Formations
            const leadsRes = await fetch('/api/leads');
            const leadsData = await leadsRes.json();
            
            const rawLeads = Array.isArray(leadsData) ? leadsData : [];
            const formationLeads = rawLeads.filter((l: any) => {
                const platform = String(l.platform || '').trim();
                const notes = String(l.notes || '');

                // Exclude marketing outreach, speed optimization, SEO, guest posting, cart abandonment
                if (
                    platform.includes('WordPress') ||
                    platform.includes('WP Speed') ||
                    platform.includes('SEO') ||
                    platform.includes('Growth USA') ||
                    platform.includes('Media Agency') ||
                    platform.includes('Outreach') ||
                    platform.includes('Guest Posting') ||
                    platform.includes('Abandoned Cart') ||
                    notes.includes('Lead Hunter') ||
                    notes.includes('Direct Booking Outreach')
                ) {
                    return false;
                }

                // Match authentic US & UK Formation submissions
                return (
                    platform.startsWith('US Formation') ||
                    platform.startsWith('US Business Formation') ||
                    platform.startsWith('UK Formation') ||
                    platform.includes('UK LTD Formation') ||
                    notes.includes('UK LTD FORMATION CASE') ||
                    (notes.includes('CT_ID:') && (notes.includes('Type: formation') || notes.includes('Type: ra') || notes.includes('Type: ein') || notes.includes('Type: compliance')))
                );
            });

            setFormations(formationLeads);

            // 2. Fetch Corporate Tools Companies (Ghost Drafts & Active Registry)
            try {
                const ctRes = await fetch('/api/admin/corptools?type=companies');
                const ctData = await ctRes.json();
                if (ctData.result) {
                    setCompanies(ctData.result || []);
                }
            } catch (e) {
                // Ignore CorpTools silent network error if keys not yet active
            }
        } catch (error) {
            toast.error("Failed to load formation submissions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Parse lead notes into structured details
    const parseLeadDetails = (notes: string) => {
        if (!notes) return {};
        const details: any = {};

        // Extract UK Metadata JSON if present
        const ukJsonMatch = notes.match(/METADATA_JSON:\s*(\{[\s\S]*\})/);
        if (ukJsonMatch && ukJsonMatch[1]) {
            try {
                details.ukMeta = JSON.parse(ukJsonMatch[1]);
                details.isUK = true;
            } catch (e) {}
        }
        
        // Extract US JSON params if present
        const paramsMatch = notes.match(/Params:\s*(\{.*\})/);
        if (paramsMatch && paramsMatch[1]) {
            try {
                details.customFields = JSON.parse(paramsMatch[1]);
            } catch (e) {}
        }

        // Extract CT_ID
        const ctMatch = notes.match(/CT_ID:\s*([^\s|]+)/);
        if (ctMatch) details.companyId = ctMatch[1];

        // Extract Package
        const pkgMatch = notes.match(/Package:\s*([^|\n]+)/);
        if (pkgMatch) details.package = pkgMatch[1].trim();

        // Extract Speed
        const speedMatch = notes.match(/Speed:\s*([^|\n]+)/);
        if (speedMatch) details.speed = speedMatch[1].trim();

        // Extract Entity
        const entityMatch = notes.match(/Entity:\s*([^|\n]+)/);
        if (entityMatch) details.entity = entityMatch[1].trim();

        // Extract Addons
        const addonsMatch = notes.match(/Addons:\s*([^|\n]+)/);
        if (addonsMatch) details.addons = addonsMatch[1].trim();

        // Extract Breakdown
        const breakdownMatch = notes.match(/Breakdown:\s*([^|\n]+)/);
        if (breakdownMatch) details.breakdown = breakdownMatch[1].trim();

        return details;
    };

    // Filtered Formations
    const filteredFormations = useMemo(() => {
        return formations.filter((f) => {
            const query = searchQuery.toLowerCase();
            const platform = (f.platform || '').toLowerCase();
            const notes = (f.notes || '').toLowerCase();

            const isUK = platform.includes('uk') || notes.includes('uk ltd');
            const isUS = !isUK;

            if (jurisdictionFilter === 'us' && !isUS) return false;
            if (jurisdictionFilter === 'uk' && !isUK) return false;

            const matchesSearch = 
                (f.clientName || '').toLowerCase().includes(query) ||
                (f.buyerEmail || '').toLowerCase().includes(query) ||
                platform.includes(query) ||
                notes.includes(query);

            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'missing_info' && (f.status === 'Missing Information' || f.status === 'Action Required')) ||
                (statusFilter === 'new' && (f.status === 'New' || f.status === 'New Case' || !f.status)) ||
                (statusFilter === 'in_progress' && (f.status === 'In Progress' || f.status === 'Reviewing' || f.status === 'Submitted to State' || f.status === 'processing')) ||
                (statusFilter === 'completed' && (f.status === 'Completed' || f.status === 'Active' || f.status === 'paid'));

            return matchesSearch && matchesStatus;
        });
    }, [formations, searchQuery, statusFilter, jurisdictionFilter]);

    const handleSelectLead = (lead: any) => {
        setSelectedItem(lead);
        setEditingStatus(lead.status || 'New');
        setAdminNotes(lead.notes || '');
    };

    const handleSaveStatus = async () => {
        if (!selectedItem) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_status',
                    id: selectedItem.id,
                    status: editingStatus,
                    notes: adminNotes,
                    budget: selectedItem.budget,
                    document_link: selectedItem.document_link || ''
                })
            });

            if (res.ok) {
                toast.success("Formation case updated!");
                setFormations(prev => prev.map(f => f.id === selectedItem.id ? { ...f, status: editingStatus, notes: adminNotes } : f));
                setSelectedItem((prev: any) => prev ? { ...prev, status: editingStatus, notes: adminNotes } : null);
            } else {
                toast.error("Failed to save changes.");
            }
        } catch (e) {
            toast.error("Network error while saving.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopySummary = (lead: any) => {
        const parsed = parseLeadDetails(lead.notes);
        const text = `=== OFFICIALUM1 US FORMATION CASE ===\n` +
            `Client: ${lead.clientName}\n` +
            `Email: ${lead.buyerEmail || 'Not provided'}\n` +
            `Platform / State: ${lead.platform}\n` +
            `Total Case Value: $${lead.budget || 0}\n` +
            `Status: ${lead.status || 'New'}\n` +
            `Corporate Tools ID: ${parsed.companyId || 'Pending'}\n` +
            `Package: ${parsed.package || 'Standard'}\n` +
            `Filing Speed: ${parsed.speed || 'Standard'}\n` +
            `Addons: ${parsed.addons || 'None'}\n` +
            `Custom Submitted Fields:\n${JSON.stringify(parsed.customFields || {}, null, 2)}\n` +
            `Submitted At: ${lead.createdAt || 'Recent'}`;

        navigator.clipboard.writeText(text);
        toast.success("Case summary copied to clipboard!");
    };

    const handleOpenEmailClient = (lead: any) => {
        const subject = encodeURIComponent(`Action Required: Your US LLC Formation with OfficialUM1 (${lead.clientName})`);
        const body = encodeURIComponent(`Hi ${lead.clientName},\n\nThank you for choosing OfficialUM1 for your US Business Formation (${lead.platform}).\n\nOur compliance team is currently reviewing your filing documents. To proceed with state submission and Registered Agent assignment, we need to clarify the following:\n\n1. [Specify missing information or verification detail here]\n\nOnce received, we will finalize your state filing within 24 hours.\n\nBest regards,\nOfficialUM1 Corporate Legal Team\nhello@officialum1.com | https://officialum1.com`);
        window.open(`mailto:${lead.buyerEmail}?subject=${subject}&body=${body}`, '_blank');
    };

    // Stats calculations
    const statsTotal = formations.length;
    const statsValue = formations.reduce((sum, f) => sum + (Number(f.budget) || 0), 0);
    const statsMissing = formations.filter(f => f.status === 'Missing Information' || f.status === 'Action Required').length;
    const statsNew = formations.filter(f => f.status === 'New' || !f.status).length;

    return (
        <div className="FadeIn">
            {/* Top Operations Header */}
            <div className="card" style={{ padding: '2rem', borderRadius: '24px', marginBottom: '2rem', border: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(20, 108, 120, 0.1)', color: 'var(--primary)', display: 'grid', placeItems: 'center' }}>
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                    US & UK Business Formations Hub
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '2px 0 0' }}>
                                    Live intake, Northwest Registered Agent US compliance, UK Companies House filings, and client outreach.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={loadAllData}
                        disabled={loading}
                        className="btn btn-outline"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: '600' }}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'Refreshing...' : 'Refresh Records'}
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.75rem' }}>
                    <div style={{ background: 'var(--bg-alt)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Submissions</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>{statsTotal}</div>
                    </div>
                    <div style={{ background: 'var(--bg-alt)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Pipeline Value</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginTop: '4px' }}>${statsValue.toLocaleString()}</div>
                    </div>
                    <div style={{ background: 'var(--bg-alt)', padding: '1.2rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>New Pending Review</div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--accent-warm)', marginTop: '4px' }}>{statsNew}</div>
                    </div>
                    <div style={{ background: statsMissing > 0 ? 'rgba(196, 71, 45, 0.08)' : 'var(--bg-alt)', padding: '1.2rem', borderRadius: '16px', border: statsMissing > 0 ? '1px solid var(--primary-2)' : '1px solid var(--border-subtle)' }}>
                        <div style={{ fontSize: '0.8rem', color: statsMissing > 0 ? 'var(--primary-2)' : 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                            Action / Missing Info
                        </div>
                        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: statsMissing > 0 ? 'var(--primary-2)' : 'var(--text-primary)', marginTop: '4px' }}>
                            {statsMissing}
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Bar: Search, Jurisdiction Toggle & Status Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Jurisdiction Switcher Tabs */}
                    <div style={{ display: 'inline-flex', padding: '4px', borderRadius: '12px', background: 'var(--bg-alt)', border: '1px solid var(--border-subtle)' }}>
                        <button
                            onClick={() => setJurisdictionFilter('all')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                border: 'none',
                                background: jurisdictionFilter === 'all' ? 'var(--primary)' : 'transparent',
                                color: jurisdictionFilter === 'all' ? '#ffffff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🌐 All ({statsTotal})
                        </button>
                        <button
                            onClick={() => setJurisdictionFilter('us')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                border: 'none',
                                background: jurisdictionFilter === 'us' ? 'var(--primary)' : 'transparent',
                                color: jurisdictionFilter === 'us' ? '#ffffff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🇺🇸 US LLCs
                        </button>
                        <button
                            onClick={() => setJurisdictionFilter('uk')}
                            style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: '700',
                                border: 'none',
                                background: jurisdictionFilter === 'uk' ? 'var(--primary)' : 'transparent',
                                color: jurisdictionFilter === 'uk' ? '#ffffff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            🇬🇧 UK LTDs
                        </button>
                    </div>

                    <div style={{ position: 'relative', minWidth: '240px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search company, client, email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ width: '100%', paddingLeft: '36px', borderRadius: '10px', background: '#ffffff', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {[
                        { id: 'all', label: 'All Statuses' },
                        { id: 'new', label: 'New' },
                        { id: 'missing_info', label: '⚠️ Action Required' },
                        { id: 'in_progress', label: 'In Progress' },
                        { id: 'completed', label: 'Completed' }
                    ].map((st) => (
                        <button
                            key={st.id}
                            onClick={() => setStatusFilter(st.id)}
                            style={{
                                padding: '5px 12px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: statusFilter === st.id ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
                                background: statusFilter === st.id ? 'var(--primary)' : '#ffffff',
                                color: statusFilter === st.id ? '#ffffff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Formations Table */}
            <div className="card" style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-subtle)', background: '#ffffff' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-alt)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>JURISDICTION & COMPANY</th>
                                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>PACKAGE / SERVICE</th>
                                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>CASE VALUE</th>
                                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>STATUS</th>
                                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' }}>DATE</th>
                                <th style={{ padding: '1rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', textAlign: 'right' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFormations.map((lead: any) => {
                                const parsed = parseLeadDetails(lead.notes);
                                const isMissing = lead.status === 'Missing Information' || lead.status === 'Action Required';
                                const isUK = parsed.isUK || (lead.platform || '').toLowerCase().includes('uk');

                                return (
                                    <tr 
                                        key={lead.id}
                                        style={{ 
                                            borderBottom: '1px solid var(--border-subtle)', 
                                            transition: 'background 0.15s',
                                            background: isMissing ? 'rgba(196, 71, 45, 0.02)' : 'transparent'
                                        }}
                                        className="hover:bg-slate-50"
                                    >
                                        <td style={{ padding: '1.2rem 1.25rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '1.2rem' }}>{isUK ? '🇬🇧' : '🇺🇸'}</span>
                                                <div>
                                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.98rem' }}>
                                                        {parsed.ukMeta?.companyName || lead.clientName}
                                                    </div>
                                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                                        <Mail size={13} /> {lead.buyerEmail || lead.email || 'No email provided'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.2rem 1.25rem' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                                {lead.platform}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                                {parsed.package || 'LLC Formation'} {parsed.speed ? `• ${parsed.speed}` : ''}
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.2rem 1.25rem' }}>
                                            <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.05rem' }}>
                                                ${lead.budget || 0}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                $50 Fee + $125 RA + State
                                            </div>
                                        </td>

                                        <td style={{ padding: '1.2rem 1.25rem' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.78rem',
                                                fontWeight: '700',
                                                background: isMissing ? 'rgba(196, 71, 45, 0.1)' : lead.status === 'Completed' ? 'rgba(20, 132, 95, 0.1)' : 'rgba(20, 108, 120, 0.1)',
                                                color: isMissing ? 'var(--primary-2)' : lead.status === 'Completed' ? 'var(--success)' : 'var(--primary)'
                                            }}>
                                                {isMissing ? '⚠️ Action Required' : lead.status || 'New Submission'}
                                            </span>
                                        </td>

                                        <td style={{ padding: '1.2rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Recent'}
                                        </td>

                                        <td style={{ padding: '1.2rem 1.25rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleSelectLead(lead)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '6px 12px', fontSize: '0.82rem', borderRadius: '8px', fontWeight: '600', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                                                >
                                                    View Details →
                                                </button>
                                                {lead.buyerEmail && (
                                                    <button
                                                        onClick={() => handleOpenEmailClient(lead)}
                                                        title="Email Client directly"
                                                        style={{ background: 'rgba(20, 108, 120, 0.08)', border: 'none', padding: '6px 10px', borderRadius: '8px', color: 'var(--primary)', cursor: 'pointer' }}
                                                    >
                                                        <Mail size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {filteredFormations.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏢</div>
                                        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>No Formation Cases Found</h3>
                                        <p style={{ fontSize: '0.88rem', margin: 0 }}>Submissions from `/services/form-business` will automatically populate here.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FULL APPLICATION DETAIL MODAL / DRAWER */}
            {selectedItem && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        background: '#ffffff',
                        height: '100%',
                        overflowY: 'auto',
                        padding: '2.5rem',
                        boxShadow: '-10px 0 40px rgba(0,0,0,0.15)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem'
                    }} className="FadeIn">
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.2rem' }}>
                            <div>
                                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    Case ID: {selectedItem.id}
                                </span>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 0', fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
                                    {selectedItem.clientName}
                                </h2>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                                    {selectedItem.platform} • Budget: ${selectedItem.budget}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedItem(null)}
                                style={{ background: 'var(--bg-alt)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Quick Contact & Action Banner */}
                        <div style={{ background: 'rgba(20, 108, 120, 0.05)', border: '1px solid rgba(20, 108, 120, 0.15)', padding: '1.2rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>CLIENT CONTACT EMAIL</div>
                                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {selectedItem.buyerEmail || 'No email saved'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {selectedItem.buyerEmail && (
                                    <button
                                        onClick={() => handleOpenEmailClient(selectedItem)}
                                        className="btn btn-primary"
                                        style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
                                    >
                                        <Send size={14} /> Email Client
                                    </button>
                                )}
                                <button
                                    onClick={() => handleCopySummary(selectedItem)}
                                    className="btn btn-outline"
                                    style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}
                                >
                                    <Copy size={14} /> Copy All
                                </button>
                            </div>
                        </div>

                        {/* Status Management & Internal Notes */}
                        <div style={{ background: 'var(--bg-alt)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                                Case Status & Staff Actions
                            </h3>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600' }}>
                                    Filing Status
                                </label>
                                <select
                                    value={editingStatus}
                                    onChange={(e) => setEditingStatus(e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', background: '#ffffff', fontWeight: '600' }}
                                >
                                    <option value="New">New Submission (Pending Initial Review)</option>
                                    <option value="Under Review">Under Review by Legal Team</option>
                                    <option value="Missing Information">⚠️ Missing Information (Action Required from Client)</option>
                                    <option value="Submitted to State">Submitted to State (Filing in Progress)</option>
                                    <option value="Registered Agent Active">Registered Agent Assigned & Active</option>
                                    <option value="Completed">Completed & Documents Delivered</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: '600' }}>
                                    Full Notes & Case Parameters
                                </label>
                                <textarea
                                    rows={4}
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', background: '#ffffff', fontSize: '0.85rem', lineHeight: '1.5' }}
                                    placeholder="Add notes about missing documents, client communications, or state filing numbers..."
                                />
                            </div>

                            <button
                                onClick={handleSaveStatus}
                                disabled={isSaving}
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '0.85rem', fontWeight: '700' }}
                            >
                                {isSaving ? 'Saving Changes...' : '💾 Save Status & Notes'}
                            </button>
                        </div>

                        {/* Submitted Specifics Breakdown */}
                        {(() => {
                            const parsed = parseLeadDetails(selectedItem.notes);
                            const custom = parsed.customFields || {};

                            return (
                                <div style={{ display: 'grid', gap: '1.2rem' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                                        Client Submitted Form Specifics
                                    </h3>

                                    <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.2rem', display: 'grid', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Corporate Tools Company ID:</span>
                                            <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{parsed.companyId || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Selected Package:</span>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{parsed.package || 'Standard'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Filing Speed:</span>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{parsed.speed || 'Standard'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Add-on Services:</span>
                                            <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{parsed.addons || 'None'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                                            <span style={{ color: 'var(--text-muted)' }}>Price Breakdown:</span>
                                            <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{parsed.breakdown || '$50 Service + $125 RA + State'}</span>
                                        </div>
                                    </div>

                                    {/* Detailed Custom Fields from Schema */}
                                    {Object.keys(custom).length > 0 && (
                                        <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.2rem' }}>
                                            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>
                                                State Schema Fields Answered
                                            </h4>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                {Object.entries(custom).map(([key, val]) => (
                                                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '6px' }}>
                                                        <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>
                                                            {key.replace(/_/g, ' ').replace(/\./g, ' → ')}:
                                                        </span>
                                                        <span style={{ fontWeight: '600', color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>
                                                            {String(val)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
