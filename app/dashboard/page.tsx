"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DailyBonus from '@/components/DailyBonus';
import WalletCard from '@/components/WalletCard';
import DepositModal from '@/components/DepositModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Modals & Forms
    const [showDeposit, setShowDeposit] = useState(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [ticketIssue, setTicketIssue] = useState('Login Issue');
    const [ticketDesc, setTicketDesc] = useState('');

    // Support Form State
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState('');
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const [replyMsg, setReplyMsg] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('buyer_user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchData(parsedUser.id);
    }, [router]);

    const fetchData = async (userId: string) => {
        setLoading(true);
        try {
            // Parallel Fetch
            const [walletRes, ordersRes, ticketsRes] = await Promise.all([
                fetch(`/api/user/wallet?userId=${userId}`),
                fetch(`/api/orders?userId=${userId}`),
                fetch(`/api/tickets?userId=${userId}`)
            ]);

            const walletData = await walletRes.json();
            if (walletData.balance !== undefined) {
                setBalance(walletData.balance);
                setTransactions(walletData.transactions || []);
            }

            const ordersData = await ordersRes.json();
            if (Array.isArray(ordersData)) setOrders(ordersData);

            if (ticketsRes.ok) {
                const ticketsData = await ticketsRes.json();
                setTickets(ticketsData);
            }
        } catch (error) {
            console.error("Dashboard Sync Error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/tickets/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email,
                    orderId: selectedOrder.orderId,
                    issue: ticketIssue,
                    description: ticketDesc
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("✅ Ticket created! We will contact you shortly.");
                setShowTicketModal(false);
                setTicketDesc('');
                fetchData(user.id);
            } else {
                alert("Error: " + data.error);
            }
        } catch (e) { alert("Failed to create ticket."); }
    };

    const handleCreateSupportTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingTicket(true);
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, email: user.email, subject, message, attachment })
            });
            setSubject(''); setMessage(''); setAttachment('');
            fetchData(user.id);
            alert('Ticket Created');
        } catch { alert('Failed to create ticket'); }
        setIsSubmittingTicket(false);
    };

    const handleReplyTicket = async (ticketId: number) => {
        if (!replyMsg) return;
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', ticketId, message: replyMsg, sender: 'user' })
            });
            setReplyMsg('');
            fetchData(user.id);
        } catch { alert('Failed to send reply'); }
    };

    const handleConvertAffiliate = async () => {
        if (Number(user?.affiliate_balance || 0) <= 0) return;
        if (confirm("Convert affiliate earnings to wallet balance?")) {
            const res = await fetch('/api/user/wallet/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, amount: Number(user.affiliate_balance) })
            });
            if (res.ok) {
                alert("Converted successfully!");
                window.location.reload(); // Simple reload to refresh user localstorage if needed or refetch
            }
        }
    };

    const totalSpent = orders.reduce((acc, order) => acc + Number(order.amount), 0);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center flex-col gap-4">
            <div className="loader"></div>
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 font-bold text-xl">LOADING DASHBOARD</h2>
        </div>
    );

    return (
        <main className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
            <Navbar />

            <DepositModal
                isOpen={showDeposit}
                onClose={() => setShowDeposit(false)}
                userId={user?.id}
                onSuccess={() => fetchData(user.id)}
            />

            {/* Ticket Modal (Order Issue) */}
            {showTicketModal && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="glass w-full max-w-lg p-8 rounded-3xl relative border border-red-500/30">
                        <button onClick={() => setShowTicketModal(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white text-2xl">✕</button>
                        <h2 className="text-2xl font-bold mb-4">Report Issue</h2>
                        <p className="text-gray-400 mb-6 text-sm">Order: #{selectedOrder?.orderId.slice(-6)}</p>
                        <form onSubmit={handleTicketSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Issue Type</label>
                                <select className="input-field w-full" value={ticketIssue} onChange={e => setTicketIssue(e.target.value)}>
                                    <option>Login Issue (Bad Pass/Email)</option>
                                    <option>Account Suspended/Banned</option>
                                    <option>Not Delivered Yet</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Description</label>
                                <textarea className="input-field w-full h-32" placeholder="Describe the problem..." required value={ticketDesc} onChange={e => setTicketDesc(e.target.value)} />
                            </div>
                            <button type="submit" className="btn btn-primary bg-red-500 hover:bg-red-600 border-none text-white">Submit Report</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="pt-24 pb-12 px-4 max-w-[1600px] mx-auto flex flex-col md:flex-row gap-8 min-h-[calc(100vh-80px)]">

                {/* 1. SIDEBAR NAVIGATION */}
                <aside className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
                    <div className="glass p-6 rounded-2xl mb-4 border border-white/5">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm truncate max-w-[120px]">{user?.email?.split('@')[0]}</h3>
                                <p className="text-xs text-blue-400">Buyer Account</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-1">
                        {[
                            { id: 'overview', icon: '🏠', label: 'Overview' },
                            { id: 'orders', icon: '📦', label: 'My Orders' },
                            { id: 'wallet', icon: '💳', label: 'Wallet & Top-up' },
                            { id: 'affiliate', icon: '🤝', label: 'Affiliate' },
                            { id: 'support', icon: '🎫', label: 'Support Tickets' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${activeTab === item.id
                                        ? 'bg-white/10 text-white border border-white/10 shadow-lg shadow-purple-500/10'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto pt-4">
                        <button
                            onClick={() => { localStorage.removeItem('buyer_user'); window.location.href = '/login'; }}
                            className="flex items-center gap-3 px-5 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors text-sm font-medium"
                        >
                            <span>🚪</span> Logout
                        </button>
                    </div>
                </aside>


                {/* 2. MAIN CONTENT AREA */}
                <div className="flex-1 min-w-0">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="FadeIn space-y-8">
                            {/* Header */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                                        Welcome back!
                                    </h1>
                                    <p className="text-gray-500 text-sm mt-1">Here is what's happening with your account today.</p>
                                </div>
                                <Link href="/shop" className="btn btn-primary bg-[#00ff88] text-black border-none hover:bg-[#00cc6a]">
                                    Browse Shop 🛍️
                                </Link>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl">💰</div>
                                    <p className="text-gray-400 text-sm mb-1">Total Balance</p>
                                    <h2 className="text-3xl font-bold text-[#00ff88]">${balance.toFixed(2)}</h2>
                                    <button onClick={() => setActiveTab('wallet')} className="text-xs text-[#00ff88] mt-2 hover:underline">Manage Wallet →</button>
                                </div>

                                <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl">🛍️</div>
                                    <p className="text-gray-400 text-sm mb-1">Total Spent</p>
                                    <h2 className="text-3xl font-bold text-white">${totalSpent.toFixed(2)}</h2>
                                    <p className="text-xs text-gray-500 mt-2">{orders.length} Orders Completed</p>
                                </div>

                                <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-6xl">🤝</div>
                                    <p className="text-gray-400 text-sm mb-1">Affiliate Earnings</p>
                                    <h2 className="text-3xl font-bold text-yellow-400">${Number(user?.affiliate_balance || 0).toFixed(2)}</h2>
                                    <button onClick={() => setActiveTab('affiliate')} className="text-xs text-yellow-400 mt-2 hover:underline">View Details →</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2 space-y-4">
                                    <h3 className="font-bold text-lg">Recent Orders</h3>
                                    {orders.length === 0 ? (
                                        <div className="glass p-8 rounded-2xl text-center text-gray-500">No orders yet.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {orders.slice(0, 5).map(order => (
                                                <div key={order.orderId} className="glass p-4 rounded-xl flex items-center justify-between hover:bg-white/5 transition-colors">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl">📦</div>
                                                        <div>
                                                            <div className="font-semibold text-sm">Order #{order.orderId.slice(-6)}</div>
                                                            <div className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-[#00ff88]">${order.amount}</div>
                                                        <div className="text-xs text-gray-400 capitalize">{order.status}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => setActiveTab('orders')} className="w-full py-3 text-center text-sm text-gray-400 hover:text-white transition-colors">View All Orders</button>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar Extras */}
                                <div className="space-y-6">
                                    <div className="glass p-0 rounded-2xl overflow-hidden">
                                        <DailyBonus />
                                    </div>
                                    <div className="glass p-6 rounded-2xl border border-white/5">
                                        <h3 className="font-bold mb-2">Need Help?</h3>
                                        <p className="text-xs text-gray-400 mb-4">Our support team is online and ready to assist you.</p>
                                        <button onClick={() => setActiveTab('support')} className="w-full btn btn-outline py-2 text-sm">Open Support Ticket</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div className="FadeIn">
                            <h2 className="text-2xl font-bold mb-6">Order History</h2>
                            <div className="glass rounded-2xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5 text-gray-400 font-medium">
                                        <tr>
                                            <th className="p-4">ID</th>
                                            <th className="p-4">Product</th>
                                            <th className="p-4">Date</th>
                                            <th className="p-4">Amount</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {orders.map(order => (
                                            <tr key={order.orderId} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 font-mono text-xs text-gray-500">#{order.orderId.slice(-6)}</td>
                                                <td className="p-4 font-medium">Product #{order.productId} {order.quantity > 1 && `(x${order.quantity})`}</td>
                                                <td className="p-4 text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                                                <td className="p-4 font-bold text-white">${order.amount}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'paid' ? 'bg-green-500/20 text-green-500' :
                                                            order.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                                                                'bg-orange-500/20 text-orange-500'
                                                        }`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {order.delivery_info ? (
                                                            <Link href={`/delivery/${order.orderId}`} className="text-blue-400 hover:text-blue-300 text-xs underline">View Delivery</Link>
                                                        ) : (
                                                            <span className="text-gray-600 text-xs">Processing...</span>
                                                        )}
                                                        <button
                                                            onClick={() => { setSelectedOrder(order); setShowTicketModal(true); }}
                                                            className="text-red-400 hover:text-red-300 text-xs ml-2"
                                                        >
                                                            Report Issue
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}


                    {/* WALLET TAB */}
                    {activeTab === 'wallet' && (
                        <div className="FadeIn grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <WalletCard balance={balance} onDeposit={() => setShowDeposit(true)} />
                                <div className="glass p-6 rounded-2xl border border-white/5">
                                    <h3 className="font-bold mb-4">Affiliate Exchange</h3>
                                    <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 mb-4">
                                        <p className="text-xs text-yellow-500 mb-1">Available Affiliate Balance</p>
                                        <h2 className="text-2xl font-bold text-yellow-400">${Number(user?.affiliate_balance || 0).toFixed(2)}</h2>
                                    </div>
                                    <button
                                        onClick={handleConvertAffiliate}
                                        disabled={Number(user?.affiliate_balance || 0) <= 0}
                                        className="btn w-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 hover:bg-yellow-400/20 disabled:opacity-50"
                                    >
                                        🔄 Convert to Main Balance
                                    </button>
                                </div>
                            </div>

                            <div className="glass p-6 rounded-2xl border border-white/5 max-h-[600px] overflow-y-auto">
                                <h3 className="font-bold mb-4">Transaction History</h3>
                                <div className="space-y-3">
                                    {transactions.length === 0 ? (
                                        <div className="text-gray-500 text-center py-8">No transactions yet.</div>
                                    ) : transactions.map(t => (
                                        <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${t.type === 'deposit' ? 'bg-green-500/20 text-green-500' :
                                                        t.type === 'purchase' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                    {t.type === 'deposit' ? '↓' : t.type === 'purchase' ? '↑' : '★'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium">{t.description || t.type}</div>
                                                    <div className="text-xs text-gray-500">{new Date(t.created_at).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className={`text-sm font-bold ${t.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {t.amount > 0 ? '+' : ''}{t.amount}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}


                    {/* AFFILIATE TAB */}
                    {activeTab === 'affiliate' && (
                        <div className="FadeIn">
                            <div className="glass p-8 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent text-center mb-8">
                                <h2 className="text-3xl font-bold text-yellow-400 mb-2">Program Affiliate</h2>
                                <p className="text-gray-400 max-w-lg mx-auto mb-6">Invite friends and earn a percentage of every deposit they make. Your earnings are credited instantly.</p>

                                <div className="max-w-md mx-auto bg-black/50 p-4 rounded-xl flex items-center gap-3 border border-white/10">
                                    <input
                                        readOnly
                                        value={`https://officialum1.com/register?ref=${user?.referral_code || '...'}`}
                                        className="bg-transparent border-none text-white text-sm w-full focus:outline-none font-mono"
                                    />
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`https://officialum1.com/register?ref=${user?.referral_code}`);
                                            alert('Copied!');
                                        }}
                                        className="text-yellow-400 font-bold text-sm hover:underline"
                                    >
                                        COPY
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="glass p-6 rounded-2xl">
                                    <h3 className="text-gray-400 text-sm mb-1">Total Earned (Lifetime)</h3>
                                    <div className="text-3xl font-bold text-white">${Number(user?.total_affiliate_earnings || 0).toFixed(2)}</div>
                                </div>
                                <div className="glass p-6 rounded-2xl">
                                    <h3 className="text-gray-400 text-sm mb-1">Current Balance</h3>
                                    <div className="text-3xl font-bold text-yellow-400">${Number(user?.affiliate_balance || 0).toFixed(2)}</div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* SUPPORT TAB */}
                    {activeTab === 'support' && (
                        <div className="FadeIn space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="glass p-6 rounded-2xl h-fit">
                                    <h2 className="text-xl font-bold mb-4">Create New Ticket</h2>
                                    <form onSubmit={handleCreateSupportTicket} className="space-y-4">
                                        <input
                                            placeholder="Subject"
                                            value={subject}
                                            onChange={e => setSubject(e.target.value)}
                                            className="input-field w-full"
                                            required
                                        />
                                        <textarea
                                            placeholder="Message"
                                            value={message}
                                            onChange={e => setMessage(e.target.value)}
                                            className="input-field w-full h-32"
                                            required
                                        />
                                        <input
                                            placeholder="Attachment URL (Optional)"
                                            value={attachment}
                                            onChange={e => setAttachment(e.target.value)}
                                            className="input-field w-full"
                                        />
                                        <button type="submit" disabled={isSubmittingTicket} className="btn btn-primary w-full">
                                            {isSubmittingTicket ? 'Sending...' : 'Submit Ticket'}
                                        </button>
                                    </form>
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold">My Tickets</h2>
                                    {tickets.length === 0 && <p className="text-gray-500">No tickets found.</p>}
                                    {tickets.map(t => (
                                        <div key={t.id} className={`glass p-4 rounded-xl border-l-4 ${t.status === 'open' ? 'border-l-teal-400' : 'border-l-gray-600'}`}>
                                            <div
                                                className="flex justify-between items-center cursor-pointer"
                                                onClick={() => setActiveTicketId(activeTicketId === t.id ? null : t.id)}
                                            >
                                                <h4 className="font-semibold">{t.subject}</h4>
                                                <span className={`text-xs uppercase font-bold px-2 py-1 rounded bg-black/30 ${t.status === 'open' ? 'text-teal-400' : 'text-gray-400'}`}>
                                                    {t.status}
                                                </span>
                                            </div>

                                            {activeTicketId === t.id && (
                                                <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                                                    <div className="bg-white/5 p-3 rounded-lg text-sm text-gray-300">
                                                        {t.message}
                                                    </div>
                                                    {t.attachment && <a href={t.attachment} target="_blank" className="text-teal-400 text-xs underline block">View Attachment</a>}

                                                    {/* Replies */}
                                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                        {t.replies?.map((r: any, i: number) => (
                                                            <div key={i} className={`flex flex-col ${r.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                                                <span className="text-[10px] text-gray-500 mb-1">{r.sender === 'user' ? 'You' : 'Support'}</span>
                                                                <div className={`px-4 py-2 rounded-lg text-sm max-w-[85%] ${r.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-[#222] text-gray-200'
                                                                    }`}>
                                                                    {r.message}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {t.status === 'open' && (
                                                        <div className="flex gap-2 mt-4">
                                                            <input
                                                                placeholder="Type a reply..."
                                                                className="input-field flex-1 text-sm bg-black/50"
                                                                value={replyMsg}
                                                                onChange={e => setReplyMsg(e.target.value)}
                                                            />
                                                            <button onClick={() => handleReplyTicket(t.id)} className="btn btn-primary px-6">Send</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
            <Footer />
        </main>
    );
}
