"use client";

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPlatformIcon } from '@/lib/icons';
import dynamic from 'next/dynamic';
const LeadsTab = dynamic(() => import('@/components/admin/tabs/LeadsTab'), { ssr: false });
const OrdersTab = dynamic(() => import('@/components/admin/tabs/OrdersTab'), { ssr: false });
const StockTab = dynamic(() => import('@/components/admin/tabs/StockTab'), { ssr: false });
const CatalogTab = dynamic(() => import('@/components/admin/tabs/CatalogTab'), { ssr: false });
const BundleTab = dynamic(() => import('@/components/admin/tabs/BundleTab'), { ssr: false });
const SellTab = dynamic(() => import('@/components/admin/tabs/SellTab'), { ssr: false });
const G2GTab = dynamic(() => import('@/components/admin/tabs/G2GTab'), { ssr: false });
const FinanceTab = dynamic(() => import('@/components/admin/tabs/FinanceTab'), { ssr: false });
const PromosTab = dynamic(() => import('@/components/admin/tabs/PromosTab'), { ssr: false });
const WebsiteTab = dynamic(() => import('@/components/admin/tabs/WebsiteTab'), { ssr: false });
const IntelTab = dynamic(() => import('@/components/admin/tabs/IntelTab'), { ssr: false });
const PaymentsTab = dynamic(() => import('@/components/admin/tabs/PaymentsTab'), { ssr: false });
const UsersTab = dynamic(() => import('@/components/admin/tabs/UsersTab'), { ssr: false });
const HRTab = dynamic(() => import('@/components/admin/tabs/HRTab'), { ssr: false });
const KBTab = dynamic(() => import('@/components/admin/tabs/KBTab'), { ssr: false });
const MarketingTab = dynamic(() => import('@/components/admin/tabs/MarketingTab'), { ssr: false });
const ToolsTab = dynamic(() => import('@/components/admin/tabs/ToolsTab'), { ssr: false });
const LogsTab = dynamic(() => import('@/components/admin/tabs/LogsTab'), { ssr: false });
const SupportTab = dynamic(() => import('@/components/admin/tabs/SupportTab'), { ssr: false });
const SettingsTab = dynamic(() => import('@/components/admin/tabs/SettingsTab'), { ssr: false });
const CatalogGenerator = dynamic(() => import('@/components/admin/tabs/CatalogGenerator'), { ssr: false });
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={<div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading...</div>}>
            <AdminDashboard />
        </Suspense>
    );
}

function AdminDashboard() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [inventory, setInventory] = useState<any[]>([]);
    const [balanceHistory, setBalanceHistory] = useState<any[]>([]);
    const [leads, setLeads] = useState<any[]>([]);
    const [marketIntel, setMarketIntel] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('catalog'); // Default to Catalog as requested
    const [showAddInv, setShowAddInv] = useState(false);
    const [showBulk, setShowBulk] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter Stats
    const [stats, setStats] = useState({
        z2u: 0,
        playerup: 0,
        direct: 0,
        g2g: 0,
        total: 0,
        profit: 0,
        margin: 0,
        stockValue: 0,
        deptBreakdown: {} as any,
        monthlyProfit: {} as any,
        productProfit: {} as any,
        productVolume: {} as any,
        wallets: { z2u: 0, g2g: 0, meezan: 0, ubl: 0 } as any
    });
    const [settings, setSettings] = useState<any>({}); // API Keys
    const [employees, setEmployees] = useState<any[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newEmp, setNewEmp] = useState({
        name: '',
        password: '',
        email: '',
        position: '',
        department: '',
        salary: '',
        commissionRate: '',
        compensationType: 'Fixed', // 'Fixed' or 'Commission'
        allowedPlatforms: [] as string[],
        permissions: ['inventory', 'orders', 'support'] // Defaults
    });
    const [editingEmp, setEditingEmp] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [activeTicketId, setActiveTicketId] = useState<number | null>(null);
    const [replyMsg, setReplyMsg] = useState('');

    // Forms
    const [newItem, setNewItem] = useState<{
        name: string;
        platform: string;
        purchasePrice: string;
        username?: string;
        password?: string;
        email?: string;
        extraInfo?: string;
        credentials?: string;
    }>({ name: '', platform: 'Z2U', purchasePrice: '' });
    const [showAddPost, setShowAddPost] = useState(false);
    const [newPost, setNewPost] = useState<{ content: string; platforms: string[] }>({ content: '', platforms: ['All'] });
    const [newSale, setNewSale] = useState({ description: '', platform: 'Z2U', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '', productName: '', quantity: '1' });
    const [sellMode, setSellMode] = useState<'single' | 'bulk'>('single');
    const [deliveryLink, setDeliveryLink] = useState('');
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [copiedId, setCopiedId] = useState<any>(null);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [fundForm, setFundForm] = useState({ platform: 'Meezan', amount: '', currency: 'PKR', description: '' });

    // Bulk Import State
    const [bulkData, setBulkData] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [kbArticles, setKbArticles] = useState<any[]>([]);
    const [showAddKb, setShowAddKb] = useState(false);
    const [kbForm, setKbForm] = useState({ title: '', slug: '', content: '', category: 'General', is_published: true, meta_description: '', keywords: '' });
    const [isGeneratingKb, setIsGeneratingKb] = useState(false);

    // View Mode for Inventory
    const [viewMode, setViewMode] = useState<'summary' | 'list'>('summary');
    const [catalog, setCatalog] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', platform: 'Z2U', price: '', description: '', image: '', salePrice: '', saleEndsAt: '', bundleItems: '', stock: '100', category_id: '', g2g_listing_id: '' });
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '📁' });
    const [showCategorySale, setShowCategorySale] = useState<any>(null); // Category object for sale modal
    const [categorySaleForm, setCategorySaleForm] = useState({ discount: '', expiry: '' });

    // Catalog Generator State
    const [showGenerator, setShowGenerator] = useState(false);

    const [orders, setOrders] = useState<any[]>([]);
    const [importMode, setImportMode] = useState<'manual' | 'csv' | 'z2u' | 'playerup'>('manual');
    const [bulkProductData, setBulkProductData] = useState('');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectedShopProducts, setSelectedShopProducts] = useState<number[]>([]);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [bulkUpdateText, setBulkUpdateText] = useState('');

    const [showFulfill, setShowFulfill] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // G2G Center State
    const [g2gOrderId, setG2GOrderId] = useState('');
    const [g2gOrderData, setG2GOrderData] = useState<any>(null);
    const [g2gLoading, setG2GLoading] = useState(false);
    const [g2gDelivery, setG2GDelivery] = useState({
        account_details: '',
        status: 'completed',
        type: 'account'
    });
    const [trackedG2GOrders, setTrackedG2GOrders] = useState<any[]>([]);
    const [trackedG2GOffers, setTrackedG2GOffers] = useState<any[]>([]);
    const [g2gStats, setG2GStats] = useState({ totalRevenue: 0, totalProfit: 0, totalOrders: 0, autoPilot: false });
    const [g2gTab, setG2GTab] = useState<'orders' | 'create_offer' | 'my_offers' | 'my_orders'>('orders');
    const [offerForm, setOfferForm] = useState({ product_id: '', unit_price: '', min_qty: 1, api_qty: 10, description: '', currency: 'USD' });
    const [fulfillDetails, setFulfillDetails] = useState('');
    const [intelForm, setIntelForm] = useState({ item_name: '', platform: 'Z2U', competitor_price: '', my_price: '' });

    // Tools State
    const [toolUrl, setToolUrl] = useState('');
    const [toolMetrics, setToolMetrics] = useState<any>(null);
    const [toolLoading, setToolLoading] = useState(false);
    const [blogTopic, setBlogTopic] = useState('');
    const [blogLoading, setBlogLoading] = useState(false);

    // RESTORED: Website Content State
    const [manualBlogs, setManualBlogs] = useState<any[]>([]);
    const [pages, setPages] = useState<Record<string, string>>({});
    const [services, setServices] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [rentals, setRentals] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [promoCodes, setPromoCodes] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    // RESTORED: Form States
    const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', category: '', image: '' });
    const [websiteTab, setWebsiteTab] = useState('blogs');
    const [marketingTab, setMarketingTab] = useState('all');
    const [pageKey, setPageKey] = useState('terms');
    const [pageContent, setPageContent] = useState('');
    const [serviceForm, setServiceForm] = useState({ title: '', desc: '', icon: '' });
    const [projectForm, setProjectForm] = useState({ title: '', category: '', description: '', image: '' });
    const [rentalForm, setRentalForm] = useState({ domain: '', niche: '', price: '', traffic: '', status: 'Available', image: '' });
    const [promoForm, setPromoForm] = useState({ code: '', discount: '', expiresAt: '' });
    const [reviewForm, setReviewForm] = useState({ name: '', role: '', review: '', rating: 5 });
    const [bundleForm, setBundleForm] = useState({ name: '', price: '', items: [] as number[], image: '', platform: 'Netflix' });

    // User Editing State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUserEdit, setShowUserEdit] = useState(false);

    // Modern Delete & Replace States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    const [isReplacing, setIsReplacing] = useState(false);
    const [userForm, setUserForm] = useState({ email: '', password: '', telegram: '', role: 'buyer' });

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('buyer_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            // Sync staff name for new sales
            setNewSale(prev => ({ ...prev, staffName: user.name || user.email || 'Admin' }));

            // Permissions are stored as a JSON string in the DB
            try {
                const perms = user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : ((user.role || '').toLowerCase() === 'admin' ? ['all'] : []);
                setPermissions(perms);
            } catch (e) {
                setPermissions((user.role || '').toLowerCase() === 'admin' ? ['all'] : []);
            }
            fetchData(user); // Fetch data with user context
        } else {
            fetchData(); // Fallback for no user (will likely redirect or show guest)
        }
    }, []);

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) setActiveTab(tab);
    }, [searchParams]);

    // Real-time G2G Polling
    const playBeep = () => {
        try {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = context.createOscillator();
            const gain = context.createGain();
            osc.connect(gain);
            gain.connect(context.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, context.currentTime); // High A
            gain.gain.setValueAtTime(0.1, context.currentTime);
            osc.start();
            osc.stop(context.currentTime + 0.1);
        } catch (e) { }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (activeTab === 'g2g_center') {
            interval = setInterval(async () => {
                try {
                    // Optimized: Only fetch tracked orders, which is now handled server-side for efficiency
                    const res = await fetch('/api/admin/g2g?action=get_tracked_orders');
                    if (res.ok) {
                        const data = await res.json();
                        const newOrders = Array.isArray(data) ? data : [];

                        if (newOrders.length > trackedG2GOrders.length && trackedG2GOrders.length > 0) {
                            playBeep();
                        }

                        if (newOrders.length > 0 && !g2gOrderId) {
                            setG2GOrderId(newOrders[0].order_id);
                        }

                        setTrackedG2GOrders(newOrders);
                    }
                } catch (e) { }
            }, 30000); // Poll every 30 seconds instead of 5 to reduce browser load
        }
        return () => { if (interval) clearInterval(interval); };
    }, [activeTab, trackedG2GOrders.length, g2gOrderId]);

    // Real-time Order Detail Fetcher
    useEffect(() => {
        const fetchOrderDetail = async () => {
            if (!g2gOrderId || activeTab !== 'g2g_center') return;
            setG2GLoading(true);
            try {
                const res = await fetch(`/api/admin/g2g?action=get_order&orderId=${g2gOrderId}`);
                const data = await res.json();
                if (res.ok) {
                    setG2GOrderData(data);
                }
            } catch (e) { console.error("G2G Detail Fetch Error", e); }
            finally { setG2GLoading(false); }
        };

        fetchOrderDetail();
    }, [g2gOrderId, activeTab]);

    // REAL-TIME PERMISSION SYNC
    useEffect(() => {
        if (!currentUser || (currentUser.role || '').toLowerCase() === 'admin') return;

        const syncPermissions = async () => {
            try {
                const res = await fetch(`/api/staff/profile?email=${currentUser.email}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.permissions) {
                        const newPerms = Array.isArray(data.permissions) ? data.permissions : [];
                        const oldPerms = Array.isArray(permissions) ? permissions : [];

                        if (JSON.stringify(newPerms) !== JSON.stringify(oldPerms)) {
                            console.log("🔐 Permissions updated in real-time!");
                            setPermissions(newPerms);
                            const updatedUser = { ...currentUser, permissions: newPerms };
                            localStorage.setItem('buyer_user', JSON.stringify(updatedUser));
                        }
                    }
                }
            } catch (e) { }
        };

        const interval = setInterval(syncPermissions, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [currentUser, permissions]);

    // Force refresh categories when modal opens
    useEffect(() => {
        if (showAddCategory) {
            fetch('/api/admin/categories')
                .then(res => res.json())
                .then(data => setCategories(Array.isArray(data) ? data : []))
                .catch(err => console.error("Error fetching categories:", err));
        }
    }, [showAddCategory]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);
        router.push(`${pathname}?${params.toString()}`);
    };

    const hasPermission = (perm: string) => {
        if (!currentUser) return false;
        const role = (currentUser.role || '').toLowerCase();
        if (role === 'admin') return true;
        return permissions.includes('all') || permissions.includes(perm);
    };

    const safeData = async (res: Response, fallback: any = []) => {
        if (res.status === 401) {
            router.push('/login?redirect=/admin/inventory');
            return fallback;
        }
        try {
            const data = await res.json();
            if (data && typeof data === 'object' && data.success === false) {
                console.error("API Error:", data.error);
                return fallback;
            }
            return data || fallback;
        } catch (e) {
            return fallback;
        }
    };

    const fetchData = async (userCtx?: any) => {
        // Only fetch generic/essential data on load
        try {
            const u = userCtx || currentUser;
            const role = (u?.role || '').toLowerCase();
            const email = u?.email || '';

            // Security: If no user or role is buyer, redirect early
            if (!u || role === 'buyer') {
                router.push('/login?error=unauthorized');
                return;
            }

            // Fetch only basic settings and user info initially
            const [settingsRes, logsRes, catRes] = await Promise.all([
                fetch('/api/admin/settings'),
                fetch('/api/admin/logs'),
                fetch('/api/products')
            ]);

            setSettings(await safeData(settingsRes, {}));
            setLogs(await safeData(logsRes));
            setCatalog(await safeData(catRes));

            // Trigger first tab fetch
            fetchTabContent(activeTab, u);

        } catch (e) {
            console.error("Initial load failed", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTabContent = async (tab: string, userCtx?: any) => {
        const u = userCtx || currentUser;
        const role = (u?.role || '').toLowerCase();
        const email = u?.email || '';

        try {
            switch (tab) {
                case 'finance':
                    if (inventory.length > 0) return;
                    const invRes = await fetch(`/api/admin/inventory?type=inventory&role=${role}&email=${email}`);
                    const balRes = await fetch(`/api/admin/inventory?type=balance&role=${role}&email=${email}`);

                    const invData = await safeData(invRes);
                    const balData = await safeData(balRes);

                    setInventory(invData);
                    setBalanceHistory(balData);
                    calculateStats(balData, employees, invData);
                    break;
                case 'catalog':
                    const catRefresh = await fetch('/api/products');
                    setCatalog(await safeData(catRefresh));
                    break;
                case 'leads':
                    if (leads.length > 0) return;
                    const leadsRes = await fetch('/api/leads');
                    setLeads(await safeData(leadsRes));
                    break;
                case 'orders':
                    if (orders.length > 0) return;
                    const ordersRes = await fetch('/api/admin/orders');
                    setOrders(await safeData(ordersRes));
                    break;
                case 'g2g_center':
                    const g2Res = await fetch('/api/admin/g2g?action=get_tracked_orders');
                    const g2StatsRes = await fetch('/api/admin/g2g?action=get_stats');
                    setTrackedG2GOrders(await safeData(g2Res));
                    setG2GStats(await safeData(g2StatsRes, { totalRevenue: 0, totalProfit: 0, totalOrders: 0, autoPilot: false }));
                    break;
                case 'hr':
                    if (employees.length > 0) return;
                    const empRes = await fetch('/api/hr/employees');
                    setEmployees(await safeData(empRes));
                    break;
                case 'support':
                    if (tickets.length > 0) return;
                    const tRes = await fetch('/api/tickets');
                    setTickets(await safeData(tRes));
                    break;
                case 'website':
                    const [blogsRes, servRes, projRes, revRes, rentRes, categRes] = await Promise.all([
                        fetch('/api/blogs'),
                        fetch('/api/services'),
                        fetch('/api/projects'),
                        fetch('/api/testimonials?all=true'),
                        fetch('/api/rentals'),
                        fetch('/api/admin/categories')
                    ]);
                    setManualBlogs(await safeData(blogsRes));
                    setServices(await safeData(servRes));
                    setProjects(await safeData(projRes));
                    setReviews(await safeData(revRes));
                    setRentals(await safeData(rentRes));
                    setCategories(await safeData(categRes));
                    break;
                case 'kb':
                    const kbRes = await fetch('/api/kb?admin=true');
                    setKbArticles(await safeData(kbRes));
                    break;
                case 'intel':
                    const intelRes = await fetch('/api/market');
                    setMarketIntel(await safeData(intelRes));
                    break;
                case 'users':
                    const usersRes = await fetch('/api/admin/users');
                    setUsers(await safeData(usersRes));
                    break;
                case 'promos':
                case 'marketing':
                    const [postsRes, msgRes, promoRes] = await Promise.all([
                        fetch('/api/social'),
                        fetch('/api/messages'),
                        fetch('/api/promocodes')
                    ]);
                    setPosts(await safeData(postsRes));
                    setMessages(await safeData(msgRes));
                    setPromoCodes(await safeData(promoRes));
                    break;
            }
        } catch (error) {
            console.error(`Error fetching data for tab: ${tab}`, error);
        }
    };

    // Trigger fetch on tab change AND Poll every 30s for Real-Time Data
    useEffect(() => {
        if (loading) return;

        fetchTabContent(activeTab); // Immediate Fetch

        const interval = setInterval(() => {
            fetchTabContent(activeTab);
        }, 5000); // 5s "Instant" Poll

        return () => clearInterval(interval);
    }, [activeTab, loading]);



    const handleSettingsSave = async () => {
        try {
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            alert('Settings saved successfully!');
        } catch (error) {
            alert('Failed to save settings.');
        }
    };

    const calculateStats = (history: any[], staffList: any[], inventoryList: any[]) => {
        const newStats = {
            z2u: 0, playerup: 0, direct: 0, g2g: 0, total: 0, profit: 0, margin: 0,
            stockValue: 0, deptBreakdown: {} as any,
            monthlyProfit: {} as any, productProfit: {} as any, productVolume: {} as any,
            wallets: { z2u: 0, g2g: 0, meezan: 0, ubl: 0 } as any
        };

        // Calculate Stock Assets
        if (inventoryList) {
            inventoryList.forEach(item => {
                if (item.status === 'In Stock') {
                    newStats.stockValue += Number(item.purchasePrice || 0);
                }
            });
        }

        history.forEach(t => {
            const amount = Number(t.amount);
            const date = t.date ? new Date(t.date) : new Date();
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            // Platform Stats
            if (t.platform === 'Z2U') newStats.z2u += amount;
            else if (t.platform === 'PlayerUp') newStats.playerup += amount;
            else if (t.platform === 'Direct') newStats.direct += amount;
            else if (t.platform === 'G2G') newStats.g2g += amount;
            newStats.total += amount;

            // Wallets Breakdown
            if (!newStats.wallets) newStats.wallets = { z2u: 0, g2g: 0, meezan: 0, ubl: 0 };

            if (t.platform === 'Z2U') newStats.wallets.z2u += amount;
            else if (['G2G', 'PlayerUp'].includes(t.platform)) newStats.wallets.g2g += amount;
            else if (t.platform === 'Meezan') newStats.wallets.meezan += amount;
            else if (t.platform === 'UBL' || t.platform === 'Direct') newStats.wallets.ubl += amount; // Group Direct with UBL/Other for now or separate? FinanceTab groups UBL/Other.

            // Profit Calculation
            let cost = 0;
            let productName = t.description || 'Adjustment';
            if (t.inventoryId) {
                const item = inventoryList.find(i => i.id === t.inventoryId);
                if (item) {
                    cost = Number(item.purchasePrice || 0);
                    productName = item.name;
                }
            }
            const profit = amount - cost;
            newStats.profit += profit;

            // Monthly breakdown
            if (!newStats.monthlyProfit[monthKey]) newStats.monthlyProfit[monthKey] = 0;
            newStats.monthlyProfit[monthKey] += profit;

            // Product breakdown
            if (!newStats.productProfit[productName]) newStats.productProfit[productName] = 0;
            newStats.productProfit[productName] += profit;

            // Product Volume
            if (!newStats.productVolume[productName]) newStats.productVolume[productName] = 0;
            newStats.productVolume[productName] += 1;

            // Department Stats
            const staff = staffList.find(e => e.name === t.processedBy);
            const dept = staff ? staff.department : (t.processedBy === 'Admin' ? 'Admin' : 'Unknown');

            if (!newStats.deptBreakdown[dept]) newStats.deptBreakdown[dept] = 0;
            newStats.deptBreakdown[dept] += amount;
        });

        if (newStats.total > 0) newStats.margin = (newStats.profit / newStats.total) * 100;
        setStats(newStats);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                body: JSON.stringify({
                    id: selectedUser.id,
                    ...userForm,
                    membership: selectedUser.membership // Include membership
                })
            });
            if (res.ok) {
                alert('User updated successfully');
                setShowUserEdit(false);
                fetchData();
            }
        } catch (e) { alert('Update failed'); }
    };

    const handleResendUserEmail = async (userId: string, email: string, action: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({ action, userId, email })
            });
            if (res.ok) alert('Communication sent successfully');
            else alert('Failed to send email. Check logs.');
        } catch (e) { alert('Failed to send email'); }
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...newEmp,
                id: editingEmp?.id,
                salary: newEmp.compensationType === 'Fixed' ? Number(newEmp.salary) : 0,
                commissionRate: newEmp.compensationType === 'Commission' ? Number(newEmp.commissionRate) : 0
            };

            const res = await fetch('/api/hr/employees', {
                method: editingEmp ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert(editingEmp ? 'Staff Updated Successfully' : 'Staff Added Successfully');
                setShowAddStaff(false);
                setEditingEmp(null);
                setNewEmp({ name: '', email: '', password: '', position: '', department: '', salary: '', commissionRate: '', compensationType: 'Fixed', allowedPlatforms: [], permissions: ['inventory', 'orders', 'support'] });
                fetchData();
            } else {
                const err = await res.json();
                alert(`Failed to process request: ${err.error || 'Unknown Error'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Error processing staff');
        }
    };

    const handleReplyTicket = async (ticketId: number) => {
        if (!replyMsg) return;
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reply', ticketId, message: replyMsg, sender: 'admin' })
            });
            setReplyMsg('');
            alert('Reply Sent');
            fetchData();
        } catch { alert('Failed to send reply'); }
    };

    const handleUpdateAdminProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email && !password) return;

        try {
            const res = await fetch('/api/admin/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                alert('Admin Profile Updated!');
                (e.target as HTMLFormElement).reset();
            } else {
                alert('Failed to update profile');
            }
        } catch (e) {
            console.error(e);
            alert('Error updating profile');
        }
    };

    const handleBacklinkCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        setToolLoading(true); setToolMetrics(null);
        try {
            const res = await fetch('/api/backlinks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: toolUrl, email: 'admin@internal.com' })
            });
            setToolMetrics(await res.json());
        } catch { alert('Check failed'); }
        finally { setToolLoading(false); }
    };

    const handleGenerateBlog = async (e: React.FormEvent) => {
        e.preventDefault();
        setBlogLoading(true);
        try {
            const res = await fetch('/api/admin/generate-blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: blogTopic })
            });
            const data = await res.json();
            if (data.success) alert(`Blog Published: ${data.title}`);
            else alert('Failed: ' + data.error);
        } catch { alert('Analysis failed'); }
        finally { setBlogLoading(false); }
    };

    const toggleGateway = (method: string) => {
        let current: any = {};
        try {
            current = settings.payment_gateways ? JSON.parse(settings.payment_gateways) : { stripe: true, crypto: true, binance: true, wallet: true };
        } catch {
            current = { stripe: true, crypto: true, binance: true, wallet: true };
        }
        const updated = { ...current, [method]: !current[method] };
        setSettings({ ...settings, payment_gateways: JSON.stringify(updated) });
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                alert('Configuration Saved Securely!');
            } else {
                const err = await res.json();
                alert('Failed to save settings: ' + (err.error || 'Unknown Error'));
            }
        } catch (error) {
            alert('Failed to save settings. Please try again.');
        }
    };

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/social', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...newPost, staffName: 'Admin' })
        });
        setShowAddPost(false);
        setNewPost({ content: '', platforms: ['All'] });
        fetchData();
    };

    const handleFulfill = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedOrder || !fulfillDetails) return;

        try {
            const res = await fetch('/api/admin/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder.orderId, credentials: fulfillDetails })
            });
            const data = await res.json();
            if (data.success) {
                alert('Order Fulfilled Successfully! Email sent to customer.');
                setShowFulfill(false);
                setFulfillDetails('');
                fetchData();
            } else {
                alert('Fulfillment Error: ' + data.error);
            }
        } catch (e) { alert('Network Error'); }
    };

    const handleCleanupDescriptions = async () => {
        if (!confirm('This will remove "Imported from Z2U store" from all products and replace it with a professional description. Proceed?')) return;
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cleanup_descriptions' })
            });
            fetchData();
            alert('Descriptions Cleaned!');
        } catch { alert('Failed to clean descriptions'); }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product from the shop?')) return;
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id })
            });
            fetchData();
        } catch { alert('Failed to delete product'); }
    };

    const handleBulkDeleteProducts = async () => {
        if (selectedShopProducts.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedShopProducts.length} selected products?`)) return;
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', id: selectedShopProducts })
            });
            setSelectedShopProducts([]);
            fetchData();
            alert('Selected Products Deleted!');
        } catch { alert('Failed to delete selected products'); }
    };

    const handleCommitBulkUpdate = async () => {
        const lines = bulkUpdateText.trim().split('\n');
        const payload = lines.map(l => {
            const parts = l.split(',');
            if (parts.length < 3) return null;
            const id = parseInt(parts[0].trim());
            const price = parts[1].trim();
            const stock = parseInt(parts[2].trim());
            const platform = parts[3]?.trim() || '';
            return { id, price, stock, platform };
        }).filter(p => p !== null && !isNaN(p.id) && !isNaN(p.stock));

        if (payload.length === 0) {
            alert("No valid updates found. Format: ID,Price,Stock,Platform");
            return;
        }

        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'bulk_update', updates: payload })
        });
        const data = await res.json();
        if (data.success) {
            alert('✅ Bulk Updated Successfully!');
            setShowBulkUpdateModal(false);
            fetchData();
        } else {
            alert('❌ Update Failed: ' + data.error);
        }
    };

    const handleDeleteSale = async () => {
        if (confirmPin !== '5753') {
            setDeleteError('❌ Incorrect Administrative PIN');
            return;
        }

        setIsDeleting(true);
        setDeleteError('');
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_sale', transactionId: deleteId })
            });
            const data = await res.json();
            if (data.success) {
                setShowDeleteModal(false);
                setDeleteId('');
                setConfirmPin('');
                fetchData();
            } else {
                setDeleteError('❌ ' + (data.error || 'Deletion failed'));
            }
        } catch (e) {
            setDeleteError('❌ Network error connectivity issue');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleReplaceSale = async (transactionId: string) => {
        if (!confirm('Are you sure you want to REPLACE this sale with fresh stock? The old items will be marked as DEFECTIVE.')) return;

        setIsReplacing(true);
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'replace_sale', transactionId })
            });
            const data = await res.json();
            if (data.success) {
                alert('✅ Replacement successful! Customer delivery link has been updated.');
                fetchData();
            } else {
                alert('❌ Replacement failed: ' + (data.error || 'No stock available?'));
            }
        } catch (e) {
            alert('❌ Network error');
        } finally {
            setIsReplacing(false);
        }
    };

    const handleCreateBundle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create',
                    name: bundleForm.name,
                    price: bundleForm.price,
                    image: bundleForm.image,
                    platform: bundleForm.platform,
                    type: 'bundle',
                    description: 'Bundle Special Deal',
                    bundle_items: JSON.stringify(bundleForm.items)
                })
            });
            alert('Bundle Created! 🎁');
            setBundleForm({ name: '', price: '', items: [], image: '', platform: 'Netflix' });
            fetchData();
        } catch { alert("Failed to create bundle"); }
    };

    const handleQuickSetStock = (value: string) => {
        const lines = bulkUpdateText.split('\n');
        const newLines = lines.map(l => {
            const parts = l.split(',');
            if (parts.length < 3) return l;
            parts[2] = value;
            return parts.join(',');
        });
        setBulkUpdateText(newLines.join('\n'));
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const action = editingProduct ? 'update' : 'create';
        const payload = editingProduct ? { ...newProduct, id: editingProduct.id, action } : { ...newProduct, action };

        await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        setShowAddProduct(false);
        setEditingProduct(null);
        setNewProduct({ name: '', platform: 'Z2U', price: '', description: '', image: '', salePrice: '', saleEndsAt: '', bundleItems: '', stock: '100', category_id: '', g2g_listing_id: '' });
        fetchData();
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', ...newCategory })
            });
            if (!res.ok) {
                const data = await res.json();
                alert("Failed to create category: " + (data.error || 'Unknown error'));
                return;
            }
            setShowAddCategory(false);
            setNewCategory({ name: '', slug: '', icon: '📁' });
            fetchData();
            alert("Category Created Successfully!");
        } catch (err) {
            alert("Network error creating category");
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!confirm('Are you sure? Products in this category will be uncategorized.')) return;
        await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        });
        fetchData();
    };

    const handleSetCategorySale = async () => {
        if (!showCategorySale) return;
        await fetch('/api/admin/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'set_discount',
                id: showCategorySale.id,
                discount_percent: categorySaleForm.discount,
                sale_ends_at: categorySaleForm.expiry
            })
        });
        setShowCategorySale(null);
        fetchData();
        alert('Category Sale Applied! 🏷️');
    };



    const handleBulkProductImport = async (e: React.FormEvent) => {
        e.preventDefault();
        const lines = bulkProductData.split('\n');
        const products = lines.map(line => {
            const [name, platform, price, description, image, stock] = line.split(',');
            return { name, platform, price, description, image, stock };
        }).filter(p => p.name && p.price);

        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bulk_import',
                    products
                })
            });
            setShowAddProduct(false);
            setBulkProductData('');
            setImportMode('manual');
            fetchData();
            alert('Bulk Products Imported!');
        } catch { alert('Failed to import products'); }
    };

    const handleZ2UMagicSync = (data: string) => {
        // Regex to find titles and prices in Z2U copy-pasted text
        // Usually looks like: "Product Title ... $ 10.00"
        const products: string[] = [];

        // This is a common pattern for Z2U listings in text form
        // We look for titles followed by price components
        const lines = data.split('\n');
        let currentTitle = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Detect Price line (Starts with $ or contains USD digits)
            const priceMatch = line.match(/\$\s*([0-9.]+)/) || line.match(/USD\s*([0-9.]+)/);

            if (priceMatch && currentTitle) {
                const price = priceMatch[1];
                let platform = 'Reddit';
                const lower = currentTitle.toLowerCase();
                if (lower.includes('discord')) platform = 'Discord';
                else if (lower.includes('telegram')) platform = 'Telegram';
                else if (lower.includes('snapchat')) platform = 'Snapchat';
                else if (lower.includes('instagram')) platform = 'Instagram';
                else if (lower.includes('tiktok')) platform = 'TikTok';
                else if (lower.includes('youtube')) platform = 'YouTube';
                else if (lower.includes('google') || lower.includes('gmail')) platform = 'Google';
                else if (lower.includes('viber')) platform = 'Viber';

                products.push(`${currentTitle},${platform},${price},Premium quality account verified and ready for use.,`);
                currentTitle = ''; // Reset
            } else if (line.length > 20 && !line.includes('http') && !line.includes('Login')) {
                // Heuristic for title: long text, not a link, not a UI element
                currentTitle = line;
            }
        }

        if (products.length > 0) {
            setBulkProductData(products.join('\n'));
            setImportMode('csv');
            alert(`🪄 Magic Sync Found ${products.length} Products! Review them below and click 'Start Upload'`);
        } else {
            alert('❌ Could not find any products in the pasted text. Try copying the entire list including prices.');
        }
    };

    const handlePlayerUpMagicSync = (data: string) => {
        const products: string[] = [];
        const lines = data.split('\n');
        let currentTitle = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Skip metadata/header lines that confuse the parser
            const lower = line.toLowerCase();
            if (lower.startsWith('post by') || lower.includes('in forum:') || lower.includes('joined:') || lower.includes('threads:') || lower.includes('messages:')) continue;
            if (line.length < 3) continue;

            // Pattern 1: Title - Price on same line
            const sameLineMatch = line.match(/(.*?)\s*-\s*\$([0-9.]+)/) || line.match(/(.*?)\s*\(\s*\$([0-9.]+)\s*\)/);

            if (sameLineMatch) {
                let title = sameLineMatch[1].trim();
                const price = sameLineMatch[2];
                title = title.replace(/^Buy Now\s*-\s*/i, '').trim();

                if (title.length > 5 && !title.toLowerCase().includes('post by')) {
                    let platform = 'Social';
                    const lt = title.toLowerCase();
                    if (lt.includes('discord')) platform = 'Discord';
                    else if (lt.includes('reddit')) platform = 'Reddit';
                    else if (lt.includes('snapchat')) platform = 'Snapchat';
                    else if (lt.includes('google') || lt.includes('gmail')) platform = 'Google';

                    products.push(`${title},${platform},${price},Premium account verified.,`);
                    currentTitle = '';
                    continue;
                }
            }

            // Pattern 2: Title line followed by Price line
            const priceOnlyMatch = line.match(/^\$([0-9.]+)$/);
            if (priceOnlyMatch && currentTitle) {
                const price = priceOnlyMatch[1];
                let platform = 'Social';
                const ct = currentTitle.toLowerCase();
                if (ct.includes('discord')) platform = 'Discord';
                else if (ct.includes('reddit')) platform = 'Reddit';
                else if (ct.includes('snapchat')) platform = 'Snapchat';
                else if (ct.includes('google')) platform = 'Google';

                products.push(`${currentTitle},${platform},${price},Direct sync from listings.,`);
                currentTitle = '';
            } else if (line.length > 10 && !line.includes('$')) {
                // Potential title line
                currentTitle = line;
            }
        }

        if (products.length > 0) {
            const unique = [...new Set(products)];
            setBulkProductData(unique.join('\n'));
            setImportMode('csv');
            alert(`🛍️ PlayerUp Sync found ${unique.length} listings! Check the data below.`);
        } else {
            alert('❌ No listings found. Make sure to Select All (Ctrl+A) and Copy (Ctrl+C) the search results page.');
        }
    };

    const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            // Skip the header line if it exists
            const lines = content.split('\n');
            const dataOnly = lines[0].toLowerCase().includes('name') ? lines.slice(1).join('\n') : content;
            setBulkProductData(dataOnly);
        };
        reader.readAsText(file);
    };

    const handleAddInventory = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalUser = newItem.username || '';
        let finalPass = newItem.password || '';
        let finalExtra = newItem.extraInfo || '';

        // Parsing Logic for Single Box
        if (newItem.credentials) {
            const text = newItem.credentials.trim();

            if (text.includes('\n')) {
                // Multi-line / Complex Format
                finalExtra = text;
                finalPass = 'See Details';
                // Try to extract a username if possible, otherwise generic
                const firstLine = text.split('\n')[0];
                finalUser = firstLine.length < 30 ? firstLine : 'Digital Asset';
            } else if (text.includes(':')) {
                const parts = text.split(':');
                finalUser = parts[0];
                finalPass = parts[1];
                finalExtra = parts.slice(2).join(':');
            } else {
                finalUser = text;
            }
        }

        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'add_inventory',
                name: newItem.name,
                platform: newItem.platform,
                purchasePrice: newItem.purchasePrice,
                username: finalUser,
                password: finalPass,
                extraInfo: finalExtra
            })
        });
        setShowAddInv(false);
        setNewItem({ name: '', platform: 'Z2U', purchasePrice: '', credentials: '' });
        fetchData();
    };

    const handleBulkImport = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'bulk_import',
                bulkData,
                platform: newItem.platform,
                purchasePrice: newItem.purchasePrice,
                namePrefix: newItem.name
            })
        });
        setShowAddInv(false);
        setBulkData('');
        fetchData();
    };

    /* --- RESTORED HANDLERS --- */
    const handlePromoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/promocodes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(promoForm) });
            if (res.ok) {
                setPromoForm({ code: '', discount: '', expiresAt: '' });
                fetchTabContent('marketing'); // Refresh the tab
                alert('Promo Created');
            }
        } catch { }
    };
    const handleDeletePromo = async (id: any) => {
        if (!confirm('Delete?')) return;
        await fetch('/api/promocodes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        fetchData();
    };

    const handleBlogSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...blogForm, readTime: '5 min read' }) });
            setBlogForm({ title: '', excerpt: '', content: '', category: '', image: '' }); fetchData(); alert('Blog Posted');
        } catch { }
    };

    const handleDeleteBlog = async (id: any) => {
        if (!confirm('Delete blog post?')) return;
        await fetch('/api/blogs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        fetchData();
    };

    const handlePageSave = async () => {
        try {
            await fetch('/api/pages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page: pageKey, content: pageContent }) });
            alert('Page Updated');
            setPages(prev => ({ ...prev, [pageKey]: pageContent }));
        } catch { }
    };

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serviceForm) }); setServiceForm({ title: '', desc: '', icon: '' }); fetchData(); } catch { }
    };
    const handleDeleteService = async (id: any) => { await fetch('/api/services', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchData(); };

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await fetch('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(projectForm) }); setProjectForm({ title: '', category: '', description: '', image: '' }); fetchData(); } catch { }
    };
    const handleDeleteProject = async (id: any) => { await fetch('/api/projects', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchData(); };

    const handleRentalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await fetch('/api/rentals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rentalForm) }); setRentalForm({ domain: '', niche: '', price: '', traffic: '', status: 'Available', image: '' }); fetchData(); } catch { }
    };
    const handleDeleteRental = async (id: any) => { await fetch('/api/rentals', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchData(); };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try { await fetch('/api/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...reviewForm, isAdmin: true }) }); setReviewForm({ name: '', role: '', review: '', rating: 5 }); fetchData(); } catch { }
    };
    const handleDeleteReview = async (id: any) => { await fetch('/api/testimonials', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); fetchData(); };

    const handleRecordSale = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'record_sale',
                ...newSale,
                staffName: currentUser?.name || currentUser?.email || 'Admin',
                mode: sellMode, // 'single' or 'bulk'
                quantity: newSale.quantity, // For bulk
                productName: newSale.productName // For bulk
            })
        });
        alert("Sale recorded successfully!");
        setNewSale({ description: '', platform: 'Z2U', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '', productName: '', quantity: '1' });
        fetchData();
    };

    const handleAddFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/finance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add_funds', ...fundForm, staffName: 'Admin' })
        });
        setShowAddFunds(false);
        setFundForm({ platform: 'Meezan', amount: '', currency: 'PKR', description: '' });
        fetchData();
    };

    if (loading) return (
        <div style={{
            background: '#050505',
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <div className="loader" style={{ width: '60px', height: '60px', borderTopColor: '#00ff88', borderRightColor: 'rgba(0, 255, 136, 0.2)', borderBottomColor: 'rgba(0, 255, 136, 0.2)', borderLeftColor: 'rgba(0, 255, 136, 0.2)' }}></div>
            <h2 style={{
                color: '#fff',
                fontSize: '1.5rem',
                background: 'linear-gradient(90deg, #fff, #444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 'bold',
                letterSpacing: '1px'
            }}>
                LOADING WORKSPACE
            </h2>
        </div>
    );

    return (
        <main style={{ minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <Navbar />
            <div style={{ display: 'flex', paddingTop: '80px', minHeight: '100vh' }}>

                {/* SIDEBAR NAVIGATION */}
                <div style={{
                    width: '280px',
                    flexShrink: 0,
                    padding: '2rem 1rem',
                    borderRight: '1px solid #222',
                    background: '#0a0a0a',
                    position: 'sticky',
                    top: '80px',
                    height: 'calc(100vh - 80px)',
                    overflowY: 'auto'
                }}>
                    <h1 className="text-gradient" style={{ fontSize: '1.8rem', marginBottom: '2rem', paddingLeft: '1rem' }}>Admin Workspace</h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Group 1: Store Operations */}
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Store Operations</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {[
                                    { id: 'catalog', label: '🛍️ Catalog', perm: 'inventory' },
                                    { id: 'stock', label: '📊 Stock', perm: 'inventory' },
                                    { id: 'orders', label: '📦 Orders', perm: 'orders' },
                                    { id: 'bundle', label: '📦 Bundles', perm: 'inventory' },
                                    { id: 'g2g_hub', label: '🎮 G2G Center', perm: 'orders', onClick: () => router.push('/admin/g2g') },
                                    { id: 'promos', label: '🏷️ Promos', perm: 'inventory' },
                                ].filter(tab => hasPermission(tab.perm)).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={tab.onClick || (() => handleTabChange(tab.id))}
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '8px',
                                            background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(0,255,136,0.1), transparent)' : 'transparent',
                                            borderLeft: activeTab === tab.id ? '3px solid #00ff88' : '3px solid transparent',
                                            color: activeTab === tab.id ? '#00ff88' : '#888',
                                            borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s',
                                            width: '100%'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Group 2: Sales & Relationship */}
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Sales & CRM</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {[
                                    { id: 'sell', label: '💸 Sales', perm: 'sales' },
                                    { id: 'leads', label: '👥 Leads', perm: 'leads' },
                                    { id: 'users', label: '👤 Buyers', perm: 'users' },
                                    { id: 'support', label: '🎫 Support', perm: 'support' },
                                ].filter(tab => hasPermission(tab.perm)).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '8px',
                                            background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(0,255,136,0.1), transparent)' : 'transparent',
                                            borderLeft: activeTab === tab.id ? '3px solid #00ff88' : '3px solid transparent',
                                            color: activeTab === tab.id ? '#00ff88' : '#888',
                                            borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s',
                                            width: '100%'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Group 3: Content & Tools */}
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Content & Tools</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {[
                                    { id: 'website', label: '🌐 Website', perm: 'website' },
                                    { id: 'marketing', label: '📢 Marketing', perm: 'marketing' },
                                    { id: 'intel', label: '📊 Intelligence', perm: 'marketing' },
                                    { id: 'tools', label: '🛠️ Tools', perm: 'tools' },
                                    { id: 'kb', label: '📚 KB/FAQ', perm: 'website' },
                                ].filter(tab => hasPermission(tab.perm)).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '8px',
                                            background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(0,255,136,0.1), transparent)' : 'transparent',
                                            borderLeft: activeTab === tab.id ? '3px solid #00ff88' : '3px solid transparent',
                                            color: activeTab === tab.id ? '#00ff88' : '#888',
                                            borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s',
                                            width: '100%'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Group 4: Administration */}
                        <div>
                            <div style={{ fontSize: '0.7rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', paddingLeft: '1rem' }}>Administration</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {[
                                    { id: 'finance', label: '💰 Finance', perm: 'finance' },
                                    { id: 'payments', label: '💳 Payments', perm: 'settings' },
                                    { id: 'hr', label: '👔 Staff', perm: 'hr' },
                                    { id: 'logs', label: '📜 Logs', perm: 'all' },
                                    { id: 'settings', label: '⚙️ Settings', perm: 'settings' }
                                ].filter(tab => hasPermission(tab.perm)).map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '0.8rem 1rem',
                                            borderRadius: '8px',
                                            background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(0,255,136,0.1), transparent)' : 'transparent',
                                            borderLeft: activeTab === tab.id ? '3px solid #00ff88' : '3px solid transparent',
                                            color: activeTab === tab.id ? '#00ff88' : '#888',
                                            borderTop: 'none', borderRight: 'none', borderBottom: 'none',
                                            fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            fontSize: '0.95rem',
                                            transition: 'all 0.2s',
                                            width: '100%'
                                        }}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1600px', overflowX: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    await fetch('/api/admin/sync-db');
                                    alert('System Tables Synchronized!');
                                } catch (e) { alert('Sync Failed'); }
                                fetchData();
                            }}
                            className="btn btn-outline"
                            style={{ color: '#00ff88', borderColor: '#00ff8833', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                        >
                            🔄 Sync System
                        </button>
                        <button onClick={() => { localStorage.removeItem('admin_user'); localStorage.removeItem('buyer_user'); window.location.href = '/admin/login'; }} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#444', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                            Logout
                        </button>
                    </div>

                    {activeTab === 'orders' && (
                        <OrdersTab
                            orders={orders}
                            showFulfill={showFulfill}
                            setShowFulfill={setShowFulfill}
                            selectedOrder={selectedOrder}
                            setSelectedOrder={setSelectedOrder}
                            fulfillDetails={fulfillDetails}
                            setFulfillDetails={setFulfillDetails}
                            handleFulfill={handleFulfill}
                            fetchData={fetchData}
                        />
                    )}

                    {activeTab === 'stock' && (
                        <StockTab
                            inventory={inventory}
                            showAddInv={showAddInv}
                            setShowAddInv={setShowAddInv}
                            showBulk={showBulk}
                            setShowBulk={setShowBulk}
                            viewMode={viewMode}
                            setViewMode={setViewMode}
                            newItem={newItem}
                            setNewItem={setNewItem}
                            bulkData={bulkData}
                            setBulkData={setBulkData}
                            handleAddInventory={handleAddInventory}
                            handleBulkImport={handleBulkImport}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                        />
                    )}

                    {/* CATALOG TAB */}
                    {activeTab === 'catalog' && (
                        <CatalogTab
                            catalog={catalog}
                            selectedShopProducts={selectedShopProducts}
                            setSelectedShopProducts={setSelectedShopProducts}
                            handleBulkDeleteProducts={handleBulkDeleteProducts}
                            handleCleanupDescriptions={handleCleanupDescriptions}
                            setBulkUpdateText={setBulkUpdateText}
                            setShowBulkUpdateModal={setShowBulkUpdateModal}
                            setShowAddCategory={setShowAddCategory}
                            setShowGenerator={setShowGenerator}
                            setEditingProduct={setEditingProduct}
                            setShowAddProduct={setShowAddProduct}
                            showAddProduct={showAddProduct}
                            editingProduct={editingProduct}
                            importMode={importMode}
                            setImportMode={setImportMode}
                            newProduct={newProduct}
                            setNewProduct={setNewProduct}
                            categories={categories}
                            handleAddProduct={handleAddProduct}
                            handleProductFileChange={handleProductFileChange}
                            handleBulkProductImport={handleBulkProductImport}
                            handleZ2UMagicSync={handleZ2UMagicSync}
                            handlePlayerUpMagicSync={handlePlayerUpMagicSync}
                            bulkProductData={bulkProductData}
                            setBulkProductData={setBulkProductData}
                            handleDeleteProduct={handleDeleteProduct}
                        />
                    )}


                    {/* BUNDLE TAB */}
                    {activeTab === 'bundle' && (
                        <BundleTab
                            catalog={catalog}
                            bundleForm={bundleForm}
                            setBundleForm={setBundleForm}
                            handleCreateBundle={handleCreateBundle}
                        />
                    )}

                    {/* SELL TAB */}
                    {activeTab === 'sell' && (
                        <SellTab
                            sellMode={sellMode}
                            setSellMode={setSellMode}
                            newSale={newSale}
                            setNewSale={setNewSale}
                            inventory={inventory}
                            handleRecordSale={handleRecordSale}
                            balanceHistory={balanceHistory}
                            hasPermission={hasPermission}
                            currentUser={currentUser}
                            copiedId={copiedId}
                            setCopiedId={setCopiedId}
                            handleReplaceSale={handleReplaceSale}
                            isReplacing={isReplacing}
                            setDeleteId={setDeleteId}
                            setShowDeleteModal={setShowDeleteModal}
                        />
                    )}

                    {/* G2G CENTER TAB */}
                    {activeTab === 'g2g_center' && (
                        <G2GTab
                            fetchData={fetchData}
                            g2gTab={g2gTab}
                            setG2GTab={setG2GTab}
                            g2gStats={g2gStats}
                            hasPermission={hasPermission}
                            trackedG2GOrders={trackedG2GOrders}
                            g2gOrderId={g2gOrderId}
                            setG2GOrderId={setG2GOrderId}
                            setG2GLoading={setG2GLoading}
                            setG2GOrderData={setG2GOrderData}
                            g2gOrderData={g2gOrderData}
                            g2gLoading={g2gLoading}
                            g2gDelivery={g2gDelivery}
                            setG2GDelivery={setG2GDelivery}
                            offerForm={offerForm}
                            setOfferForm={setOfferForm}
                            trackedG2GOffers={trackedG2GOffers}
                        />
                    )}

                    {/* FINANCE TAB (was Sales) */}
                    {activeTab === 'finance' && (
                        <FinanceTab
                            stats={stats}
                            balanceHistory={balanceHistory}
                            showAddFunds={showAddFunds}
                            setShowAddFunds={setShowAddFunds}
                            fundForm={fundForm}
                            setFundForm={setFundForm}
                            handleAddFunds={handleAddFunds}
                            copiedId={copiedId}
                            setCopiedId={setCopiedId}
                        />
                    )}

                    {/* PROMOS TAB */}
                    {activeTab === 'promos' && (
                        <PromosTab
                            promoForm={promoForm}
                            setPromoForm={setPromoForm}
                            handlePromoSubmit={handlePromoSubmit}
                            promoCodes={promoCodes}
                            handleDeletePromo={handleDeletePromo}
                        />
                    )}

                    {/* WEBSITE TAB */}
                    {activeTab === 'website' && (
                        <WebsiteTab
                            websiteTab={websiteTab}
                            setWebsiteTab={setWebsiteTab}
                            blogForm={blogForm}
                            setBlogForm={setBlogForm}
                            handleBlogSubmit={handleBlogSubmit}
                            manualBlogs={manualBlogs}
                            handleDeleteBlog={handleDeleteBlog}
                            pageKey={pageKey}
                            setPageKey={setPageKey}
                            pageContent={pageContent}
                            setPageContent={setPageContent}
                            pages={pages}
                            handlePageSave={handlePageSave}
                            serviceForm={serviceForm}
                            setServiceForm={setServiceForm}
                            handleServiceSubmit={handleServiceSubmit}
                            services={services}
                            handleDeleteService={handleDeleteService}
                            projectForm={projectForm}
                            setProjectForm={setProjectForm}
                            handleProjectSubmit={handleProjectSubmit}
                            projects={projects}
                            handleDeleteProject={handleDeleteProject}
                            rentalForm={rentalForm}
                            setRentalForm={setRentalForm}
                            handleRentalSubmit={handleRentalSubmit}
                            rentals={rentals}
                            handleDeleteRental={handleDeleteRental}
                            reviewForm={reviewForm}
                            setReviewForm={setReviewForm}
                            handleReviewSubmit={handleReviewSubmit}
                            reviews={reviews}
                            handleDeleteReview={handleDeleteReview}
                            messages={messages}
                        />
                    )}

                    {
                        activeTab === 'leads' && (
                            <LeadsTab leads={leads} fetchData={fetchData} />
                        )
                    }

                    {/* MARKET INTELLIGENCE TAB */}
                    {activeTab === 'intel' && (
                        <IntelTab
                            marketIntel={marketIntel}
                            intelForm={intelForm}
                            setIntelForm={setIntelForm}
                            fetchData={fetchData}
                        />
                    )}

                    {/* PAYMENTS TAB (New Modern Layout) */}
                    {activeTab === 'payments' && (
                        <PaymentsTab
                            hasPermission={hasPermission('settings')}
                            settings={settings}
                            setSettings={setSettings}
                            fundForm={fundForm}
                            setFundForm={setFundForm}
                            stats={stats}
                            handleSettingsSave={handleSettingsSave}
                            balanceHistory={balanceHistory}
                        />
                    )}

                    {/* USERS TAB (BUYERS) */}
                    {activeTab === 'users' && (
                        <UsersTab
                            users={users}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                            userForm={userForm}
                            setUserForm={setUserForm}
                            showUserEdit={showUserEdit}
                            setShowUserEdit={setShowUserEdit}
                            handleUpdateUser={handleUpdateUser}
                            handleResendUserEmail={handleResendUserEmail}
                            fetchData={fetchData}
                        />
                    )}
                    {/* SUPPORT TAB */}
                    {activeTab === 'support' && (
                        <SupportTab
                            tickets={tickets}
                            activeTicketId={activeTicketId}
                            setActiveTicketId={setActiveTicketId}
                            replyMsg={replyMsg}
                            setReplyMsg={setReplyMsg}
                            handleReplyTicket={handleReplyTicket}
                        />
                    )}
                    {activeTab === 'marketing' && (
                        <MarketingTab
                            marketingTab={marketingTab}
                            setMarketingTab={setMarketingTab}
                            showAddPost={showAddPost}
                            setShowAddPost={setShowAddPost}
                            posts={posts}
                            newPost={newPost}
                            setNewPost={setNewPost}
                            handleAddPost={handleAddPost}
                        />
                    )}


                    {/* TOOLS TAB (New) */}
                    {
                        activeTab === 'tools' && (
                            <ToolsTab
                                handleBacklinkCheck={handleBacklinkCheck}
                                toolUrl={toolUrl}
                                setToolUrl={setToolUrl}
                                toolLoading={toolLoading}
                                toolMetrics={toolMetrics}
                                handleGenerateBlog={handleGenerateBlog}
                                blogTopic={blogTopic}
                                setBlogTopic={setBlogTopic}
                                blogLoading={blogLoading}
                            />
                        )
                    }



                    {/* HR TAB */}
                    {
                        activeTab === 'hr' && (
                            <HRTab
                                showAddStaff={showAddStaff}
                                setShowAddStaff={setShowAddStaff}
                                editingEmp={editingEmp}
                                setEditingEmp={setEditingEmp}
                                newEmp={newEmp}
                                setNewEmp={setNewEmp}
                                handleAddEmployee={handleAddEmployee}
                                employees={employees}
                                handleDeleteEmployee={async (id) => {
                                    if (confirm('Terminate and delete staff account? This cannot be undone.')) {
                                        await fetch(`/api/hr/employees?id=${id}`, { method: 'DELETE' });
                                        fetchData();
                                    }
                                }}
                                users={users}
                                setSelectedUser={setSelectedUser}
                                setUserForm={setUserForm}
                                setShowUserEdit={setShowUserEdit}
                            />
                        )
                    }

                    {/* KB TAB */}
                    {
                        activeTab === 'kb' && (
                            <KBTab
                                showAddKb={showAddKb}
                                setShowAddKb={setShowAddKb}
                                kbForm={kbForm}
                                setKbForm={setKbForm}
                                isGeneratingKb={isGeneratingKb}
                                setIsGeneratingKb={setIsGeneratingKb}
                                handleKbSubmit={async (e) => {
                                    e.preventDefault();
                                    await fetch('/api/kb', { method: 'POST', body: JSON.stringify({ ...kbForm, action: 'create' }) });
                                    setShowAddKb(false);
                                    fetchData();
                                }}
                                kbArticles={kbArticles}
                                handleDeleteKb={async (id) => {
                                    if (confirm('Delete?')) {
                                        await fetch('/api/kb', { method: 'DELETE', body: JSON.stringify({ id }) });
                                        fetchData();
                                    }
                                }}
                            />
                        )
                    }

                    {/* LOGS TAB */}
                    {
                        activeTab === 'logs' && (
                            <LogsTab logs={logs} />
                        )
                    }

                    {/* SETTINGS TAB */}
                    {
                        activeTab === 'settings' && (
                            <SettingsTab
                                settings={settings}
                                setSettings={setSettings}
                                handleSaveSettings={handleSaveSettings}
                                handleUpdateAdminProfile={handleUpdateAdminProfile}
                            />
                        )
                    }
                </div >
            </div >

            {
                showBulkUpdateModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                        <div className="glass" style={{ width: '100%', maxWidth: '800px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid #00ff88', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button onClick={() => setShowBulkUpdateModal(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>

                            <div style={{ marginBottom: '2rem' }}>
                                <h3 style={{ margin: 0, color: '#00ff88' }}>📝 Bulk Editor</h3>
                                <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '0.5rem' }}>Update Price, Stock, and Category in bulk.</p>
                            </div>

                            <div style={{ background: 'rgba(0,255,136,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.1)', marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold' }}>🚀 Quick Set Tools</label>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Set all stocks to:</span>
                                    <button onClick={() => handleQuickSetStock('100')} className="btn btn-outline" style={{ padding: '0.3rem 1rem', fontSize: '0.8rem' }}>100</button>
                                    <button onClick={() => handleQuickSetStock('50')} className="btn btn-outline" style={{ padding: '0.3rem 1rem', fontSize: '0.8rem' }}>50</button>
                                    <button onClick={() => handleQuickSetStock('10')} className="btn btn-outline" style={{ padding: '0.3rem 1rem', fontSize: '0.8rem' }}>10</button>
                                    <button onClick={() => {
                                        const val = prompt("Enter stock value for all:");
                                        if (val) handleQuickSetStock(val);
                                    }} className="btn btn-primary" style={{ padding: '0.3rem 1rem', fontSize: '0.8rem' }}>Custom Value</button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ color: '#ccc', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Update Data (Format: ID, PRICE, STOCK, CATEGORY)</label>
                                <textarea
                                    className="input-field"
                                    value={bulkUpdateText}
                                    onChange={(e) => setBulkUpdateText(e.target.value)}
                                    style={{ width: '100%', height: '300px', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', fontSize: '0.9rem', lineHeight: '1.5' }}
                                    placeholder="Example:\n23,66,100,Reddit\n22,77,100,Reddit"
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button onClick={() => setShowBulkUpdateModal(false)} className="btn btn-outline">Cancel</button>
                                <button onClick={handleCommitBulkUpdate} className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>
                                    ✅ Save All Updates
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showDeleteModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                        <div className="glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid #ff4444', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
                            <h2 style={{ margin: '0 0 1rem 0', color: '#ff4444' }}>Admin Verification</h2>
                            <p style={{ color: '#aaa', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                You are about to delete a transaction and restore stock. Please enter your 4-digit security PIN to confirm.
                            </p>

                            <div style={{ marginBottom: '2rem' }}>
                                <input
                                    type="password"
                                    placeholder="Enter Security PIN"
                                    value={confirmPin}
                                    onChange={(e) => setConfirmPin(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1.2rem',
                                        borderRadius: '12px',
                                        border: '2px solid rgba(255, 68, 68, 0.2)',
                                        background: 'rgba(0,0,0,0.3)',
                                        color: '#fff',
                                        fontSize: '1.5rem',
                                        textAlign: 'center',
                                        letterSpacing: '1rem'
                                    }}
                                    maxLength={4}
                                />
                                {deleteError && <p style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '1rem' }}>{deleteError}</p>}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button onClick={() => { setShowDeleteModal(false); setConfirmPin(''); setDeleteError(''); }} className="btn btn-outline" style={{ borderRadius: '12px' }}>Cancel</button>
                                <button
                                    onClick={handleDeleteSale}
                                    disabled={isDeleting}
                                    className="btn"
                                    style={{ background: '#ff4444', color: '#fff', borderRadius: '12px', fontWeight: 'bold' }}
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete Sale'}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {
                showAddCategory && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                        <div className="glass" style={{ width: '100%', maxWidth: '750px', padding: '2.5rem', borderRadius: '24px', position: 'relative', border: '1px solid #00ccff' }}>
                            <button onClick={() => setShowAddCategory(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                            <h3 style={{ marginBottom: '1.5rem', color: '#00ccff' }}>📁 Manage Store Categories</h3>

                            <form onSubmit={handleAddCategory} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr auto', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                                <input className="input-field" value={newCategory.icon} onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })} placeholder="Icon" style={{ padding: '0.5rem', textAlign: 'center', height: '46px', borderRadius: '12px' }} />
                                <input className="input-field" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} placeholder="Category Name" required style={{ height: '46px', borderRadius: '12px' }} />
                                <input className="input-field" value={newCategory.slug} onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })} placeholder="slug" required style={{ height: '46px', borderRadius: '12px' }} />
                                <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Add</button>
                            </form>

                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {categories.map((cat: any) => (
                                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http')) ? (
                                                    <img src={cat.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <span style={{ fontSize: '1.5rem' }}>{cat.icon || '📁'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600' }}>{cat.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>/{cat.slug}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => { setShowCategorySale(cat); setCategorySaleForm({ discount: (cat.discount_percent !== undefined && cat.discount_percent !== null) ? cat.discount_percent.toString() : '', expiry: cat.sale_ends_at ? new Date(cat.sale_ends_at).toISOString().slice(0, 16) : '' }); }} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', color: cat.discount_percent > 0 ? '#ff4d4d' : '#888' }}>
                                                {cat.discount_percent > 0 ? `🔥 ${cat.discount_percent}% Off` : '🏷️ Sale'}
                                            </button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', color: '#ff4d4d', borderColor: '#ff4d4d33' }}>Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCategorySale && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(15px)' }}>
                        <div className="glass" style={{ width: '400px', padding: '2rem', borderRadius: '24px', border: '1px solid #ff4d4d' }}>
                            <h4 style={{ marginBottom: '1rem', color: '#ff4d4d' }}>🔥 Flash Sale: {showCategorySale.name}</h4>
                            <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>This will apply a discount to all products in this category.</p>

                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '0.4rem' }}>Discount Percentage (%)</label>
                                <input type="number" className="input-field" value={categorySaleForm.discount} onChange={e => setCategorySaleForm({ ...categorySaleForm, discount: e.target.value })} placeholder="e.g. 10" style={{ width: '100%' }} />
                            </div>

                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: '0.4rem' }}>Sale Ends At</label>
                                <input type="datetime-local" className="input-field" value={categorySaleForm.expiry} onChange={e => setCategorySaleForm({ ...categorySaleForm, expiry: e.target.value })} style={{ width: '100%' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button onClick={() => setShowCategorySale(null)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button onClick={handleSetCategorySale} className="btn btn-primary" style={{ flex: 1, background: '#ff4d4d', color: '#fff' }}>Apply Sale</button>
                            </div>
                        </div>
                    </div>
                )
            }

            <CatalogGenerator
                showGenerator={showGenerator}
                setShowGenerator={setShowGenerator}
                fetchData={fetchData}
                categories={categories}
            />
            <Footer />
        </main >
    );
}
