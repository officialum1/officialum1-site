"use client";

import { useState, useEffect, Suspense } from 'react';
import { getPlatformIcon } from '@/lib/icons';
import dynamic from 'next/dynamic';
import { AdminShell } from '@/components/admin/AdminShell';
const LeadsTab = dynamic(() => import('@/components/admin/tabs/LeadsTab'), { ssr: false });
const OrdersTab = dynamic(() => import('@/components/admin/tabs/OrdersTab'), { ssr: false });
const StockTab = dynamic(() => import('@/components/admin/tabs/StockTab'), { ssr: false });
const CatalogTab = dynamic(() => import('@/components/admin/tabs/CatalogTab'), { ssr: false });
const BundleTab = dynamic(() => import('@/components/admin/tabs/BundleTab'), { ssr: false });
const SellTab = dynamic(() => import('@/components/admin/tabs/SellTab'), { ssr: false });
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
const ReviewsTab = dynamic(() => import('@/components/admin/tabs/ReviewsTab'), { ssr: false });
const DocumentsTab = dynamic(() => import('@/components/admin/tabs/DocumentsTab'), { ssr: false });
const VerificationTab = dynamic(() => import('@/components/admin/tabs/VerificationTab'), { ssr: false });
const SellersTab = dynamic(() => import('@/components/admin/tabs/SellersTab'), { ssr: false });
const BuilderTab = dynamic(() => import('@/components/admin/tabs/BuilderTab'), { ssr: false });
const TrafficTab = dynamic(() => import('@/components/admin/tabs/TrafficTab'), { ssr: false });
const BusinessTab = dynamic(() => import('@/components/admin/tabs/BusinessTab'), { ssr: false });
const IndexingTab = dynamic(() => import('@/components/admin/tabs/IndexingTab'), { ssr: false });
const RankMathTab = dynamic(() => import('@/components/admin/tabs/RankMathTab'), { ssr: false });

import { useParams, useRouter, usePathname } from 'next/navigation';
import ModernUIOverlay, { modernAlert, modernConfirm, modernPrompt } from '@/components/ModernUIOverlay';

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={<div style={{ background: '#050505', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading...</div>}>
            <AdminDashboard />
        </Suspense>
    );
}

function AdminDashboard() {
    const params = useParams();
    const slugArray = params?.slug;
    const rawSlug = Array.isArray(slugArray) ? slugArray[0] : slugArray;
    
    // Robust Slug Sanitization: Auto-resolve common typos and support backward compatibility for legacy paths.
    const slug = rawSlug ? (
        rawSlug === 'inventory' || rawSlug === 'workspace' ? 'catalog' :
        rawSlug === 'reviews' ? 'reviews_hub' :
        rawSlug === 'coupons' ? 'promos' :
        rawSlug === 'payouts' ? 'finance' :
        rawSlug === 'blogs' || rawSlug === 'newsletter' ? 'website' :
        rawSlug === 'rank-math' || rawSlug === 'rank_math' ? 'rankmath' :
        rawSlug === 'bundles' ? 'bundle' :
        rawSlug === 'buyers' ? 'users' :
        rawSlug === 'verification' ? 'verifications' :
        rawSlug === 'whatsapp' ? 'catalog' :
        rawSlug
    ) : undefined;

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
    const [adminOnline, setAdminOnline] = useState(false);


    // Filter Stats
    const [stats, setStats] = useState({
        direct: 0,
        total: 0,
        profit: 0,
        margin: 0,
        stockValue: 0,
        deptBreakdown: {} as any,
        monthlyProfit: {} as any,
        productProfit: {} as any,
        productVolume: {} as any,
        wallets: { meezan: 0, ubl: 0, binance: 0, redotpay: 0, skrill: 0 } as any
    });
    const [settings, setSettings] = useState<any>({}); // API Keys
    const [employees, setEmployees] = useState<any[]>([]);
    const [showAddStaff, setShowAddStaff] = useState(false);
    const [newEmp, setNewEmp] = useState({
        name: '',
        username: '',
        password: '',
        email: '',
        position: '',
        department: '',
        salary: '',
        commissionRate: '',
        compensationType: 'Fixed', // 'Fixed' or 'Commission'
        role: 'seller', // Default to Staff
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
        emailPassword?: string;
        country?: string;
        extraInfo?: string;
        credentials?: string;
        tag?: string;
        image?: string;
    }>({ name: '', platform: 'OfficialUM1', purchasePrice: '' });
    const [showAddPost, setShowAddPost] = useState(false);
    const [newPost, setNewPost] = useState<{ content: string; platforms: string[] }>({ content: '', platforms: ['All'] });
    const [newSale, setNewSale] = useState({ description: '', platform: 'OfficialUM1', paymentReceived: '', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '', productName: '', quantity: '1' });
    const [sellMode, setSellMode] = useState<'single' | 'bulk'>('single');
    const [deliveryLink, setDeliveryLink] = useState('');
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [copiedId, setCopiedId] = useState<any>(null);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [fundForm, setFundForm] = useState({
        actionType: 'adjustment',
        platform: 'Meezan',
        fromPlatform: 'Binance',
        toPlatform: 'RedotPay',
        amount: '',
        currency: 'PKR',
        description: ''
    });

    // Bulk Import State
    const [bulkData, setBulkData] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [kbArticles, setKbArticles] = useState<any[]>([]);
    const [showAddKb, setShowAddKb] = useState(false);
    const [kbForm, setKbForm] = useState<any>({ title: '', slug: '', content: '', category: 'General', is_published: true, meta_description: '', keywords: '' });
    const [isGeneratingKb, setIsGeneratingKb] = useState(false);

    // View Mode for Inventory
    const [viewMode, setViewMode] = useState<'summary' | 'list'>('summary');
    const [catalog, setCatalog] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        platform: 'OfficialUM1',
        price: '',
        description: '',
        image: '',
        salePrice: '',
        saleEndsAt: '',
        bundleItems: '',
        stock: '100',
        category_id: '',
        seo_title: '',
        seo_description: '',
        focus_keyword: '',
        seo_keywords: '',
        canonical_url: '',
        robots: 'index,follow',
        schema_type: 'Product'
    });
    const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: '📁', image: '' });
    const [showCategorySale, setShowCategorySale] = useState<any>(null); // Category object for sale modal
    const [categorySaleForm, setCategorySaleForm] = useState({ discount: '', expiry: '' });

    // Catalog Generator State
    const [showGenerator, setShowGenerator] = useState(false);

    const [orders, setOrders] = useState<any[]>([]);
    const [importMode, setImportMode] = useState<'manual' | 'csv'>('manual');
    const [bulkProductData, setBulkProductData] = useState('');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectedShopProducts, setSelectedShopProducts] = useState<number[]>([]);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [bulkUpdateText, setBulkUpdateText] = useState('');

    const [showFulfill, setShowFulfill] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [fulfillDetails, setFulfillDetails] = useState('');
    const [intelForm, setIntelForm] = useState({ item_name: '', platform: 'OfficialUM1', competitor_price: '', my_price: '' });

    // Tools State
    const [toolUrl, setToolUrl] = useState('');
    const [toolMetrics, setToolMetrics] = useState<any>(null);
    const [toolLoading, setToolLoading] = useState(false);
    const [blogTopic, setBlogTopic] = useState('');
    const [blogLoading, setBlogLoading] = useState(false);
    const [isGuestPost, setIsGuestPost] = useState(false);

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
    const [verifications, setVerifications] = useState<any[]>([]);

    // RESTORED: Form States
    const [blogForm, setBlogForm] = useState({
        title: '',
        excerpt: '',
        content: '',
        category: 'SEO',
        image: '',
        meta_title: '',
        meta_description: '',
        focus_keyword: '',
        seo_keywords: '',
        canonical_url: '',
        robots: 'index,follow',
        schema_type: 'BlogPosting'
    });
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
        if (rawSlug === 'whatsapp') {
            router.replace('/admin/catalog');
        }
    }, [rawSlug, router]);

    useEffect(() => {
        // Attempt to load cached data for speed
        const cachedData = localStorage.getItem('admin_dashboard_cache');
        if (cachedData) {
            try {
                const parsed = JSON.parse(cachedData);
                setCatalog(parsed.catalog || []);
                setOrders(parsed.orders || []);
                setLeads(parsed.leads || []);
                setLogs(parsed.logs || []);
                setUsers(parsed.users || []);
                setEmployees(parsed.employees || []);
                setLoading(false); // Show UI immediately with cached data
            } catch (e) {
                console.error("Cache corrupted", e);
            }
        }

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
            fetchData(user); // Fetch fresh data


        } else {
            fetchData(); // Fallback for no user
        }

        // Fetch Online Status
        fetch('/api/admin/settings?key=admin_online_status', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setAdminOnline(data.value === 'online' || data.value === 'true'))
            .catch(() => { });
    }, []);


    // Optimized: Debounced cache system to prevent thread-blocking synchronous LocalStorage updates
    useEffect(() => {
        if (loading) return;
        
        const timer = setTimeout(() => {
            const cache = {
                catalog,
                orders,
                leads,
                logs,
                users,
                employees,
                lastUpdated: Date.now()
            };
            localStorage.setItem('admin_dashboard_cache', JSON.stringify(cache));
        }, 1500); // Settle for 1.5s before locking UI with writing thread

        return () => clearTimeout(timer);
    }, [catalog, orders, leads, logs, users, employees, loading]);

    // Sync tab with Dynamic Routing Slug
    useEffect(() => {
        if (slug) {
            const targetTab = (slug === 'inventory' || slug === 'workspace') ? 'catalog' : slug;
            if (targetTab !== activeTab) setActiveTab(targetTab);
        } else {
            // Fallback to default view
            if (activeTab !== 'catalog') setActiveTab('catalog');
        }
    }, [slug, activeTab]);
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
        router.push(`/admin/${tabId}`);
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
                case 'stock':
                case 'finance':
                case 'sell':
                case 'payments':
                    const invRes = await fetch(`/api/admin/inventory?type=inventory&role=${role}&email=${email}`);
                    const balRes = await fetch(`/api/admin/inventory?type=balance&role=${role}&email=${email}`);

                    const invData = await safeData(invRes);
                    const balData = await safeData(balRes);

                    setInventory(invData);
                    setBalanceHistory(balData);
                    calculateStats(balData, employees, invData);
                    break;
                case 'catalog':
                case 'reviews_hub':
                case 'bundle':
                    const catRefresh = await fetch('/api/products');
                    setCatalog(await safeData(catRefresh));
                    break;
                case 'leads':
                    const leadsRes = await fetch('/api/leads');
                    setLeads(await safeData(leadsRes));
                    break;
                case 'orders':
                    if (orders.length > 0) return;
                    const ordersRes = await fetch('/api/admin/orders');
                    setOrders(await safeData(ordersRes));
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
                case 'logs':
                    const logsFreshRes = await fetch('/api/admin/logs', { cache: 'no-store' });
                    setLogs(await safeData(logsFreshRes));
                    break;
                case 'users':
                    const usersRes = await fetch('/api/admin/users');
                    setUsers(await safeData(usersRes));
                    break;
                case 'sellers':
                    const allUsersRes = await fetch('/api/admin/users');
                    setUsers(await safeData(allUsersRes));
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

    // Dynamic URL Segment Sync Handler
    useEffect(() => {
        if (slug) {
            const t = slug === 'inventory' ? 'catalog' : slug;
            if (t !== activeTab) setActiveTab(t);
        }
    }, [slug, activeTab]);

    // Trigger fetch on tab change AND Poll every 20s for Real-Time Data (Optimized Suspension)
    useEffect(() => {
        if (loading) return;

        fetchTabContent(activeTab); // Immediate Fetch

        const interval = setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                fetchTabContent(activeTab);
            }
        }, 20000); // 20s Pulse - Suspended in background for general tabs to preserve database limits

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
            direct: 0, total: 0, profit: 0, margin: 0,
            stockValue: 0, deptBreakdown: {} as any,
            monthlyProfit: {} as any, productProfit: {} as any, productVolume: {} as any,
            wallets: { meezan: 0, ubl: 0, binance: 0, redotpay: 0, skrill: 0 } as any
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
            const type = t.type || 'sale';

            // Platform Stats (Separate by Currency or Account Type)
            // Fix: Identify PKR specifically by currency or known PKR accounts
            const isPKR = t.currency === 'PKR' || (t.currency !== 'USD' && ['Meezan', 'UBL', 'EasyPaisa', 'JazzCash'].includes(t.platform));

            // Wallets Breakdown (Keeps native currency)
            if (!newStats.wallets) newStats.wallets = { meezan: 0, ubl: 0, binance: 0, redotpay: 0, skrill: 0 };

            // Determine if we should add or subtract based on type
            let multiplier = 1;
            if (['expense', 'purchase', 'payout', 'transfer_out'].includes(type)) {
                multiplier = -1;
            }

            const val = amount * multiplier;

            if (t.platform === 'Meezan') newStats.wallets.meezan += val;
            else if (['UBL', 'EasyPaisa', 'JazzCash'].includes(t.platform)) newStats.wallets.ubl += val;
            else if (t.platform === 'Binance') newStats.wallets.binance += val;
            else if (t.platform === 'RedotPay') newStats.wallets.redotpay += val;
            else if (t.platform === 'Skrill') newStats.wallets.skrill += val;

            // Only count actual Sales for Revenue and Profit calculation
            if (type === 'sale') {
                if (!isPKR) {
                    if (['Binance', 'RedotPay', 'Skrill'].includes(t.platform)) {
                        // These are platforms now
                        if (!newStats.deptBreakdown['ThirdParty']) newStats.deptBreakdown['ThirdParty'] = 0;
                    }
                    else newStats.direct += amount; // Fallback for direct sales to banks

                    newStats.total += amount;

                    // Profit Calculation (Sale Price - Cost)
                    let cost = Number(t.cost || 0);
                    let productName = t.description || 'Unknown Product';

                    // Fallback for legacy data/missing cost (search in inventory)
                    if (cost === 0 && t.inventoryId && t.inventoryId !== 'bulk') {
                        const item = inventoryList.find(i => i.id === t.inventoryId);
                        if (item) {
                            cost = Number(item.purchasePrice || 0);
                            productName = item.name;
                        }
                    }

                    const profitLine = amount - cost;
                    newStats.profit += profitLine;

                    // Monthly breakdown
                    if (!newStats.monthlyProfit[monthKey]) newStats.monthlyProfit[monthKey] = 0;
                    newStats.monthlyProfit[monthKey] += profitLine;

                    // Product breakdown
                    if (!newStats.productProfit[productName]) newStats.productProfit[productName] = 0;
                    newStats.productProfit[productName] += profitLine;

                    // Product Volume
                    if (!newStats.productVolume[productName]) newStats.productVolume[productName] = 0;
                    newStats.productVolume[productName] += Number(t.quantity || 1);
                }
            }

            // Department Stats (USD-based performance)
            if (!isPKR && type === 'sale') {
                const staff = staffList.find(e => e.name === t.processedBy);
                const dept = staff ? staff.department : (t.processedBy === 'Admin' ? 'Admin' : 'Unknown');
                if (!newStats.deptBreakdown[dept]) newStats.deptBreakdown[dept] = 0;
                newStats.deptBreakdown[dept] += amount;
            }
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
                modernAlert('User updated successfully');
                setShowUserEdit(false);
                fetchData();
            }
        } catch (e) { modernAlert('Update failed'); }
    };

    const handleResendUserEmail = async (userId: string, email: string, action: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({ action, userId, email })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                modernAlert('Communication sent successfully', '', 'success');
            } else {
                modernAlert('Failed to send email', data.error || 'Unknown error', 'error');
            }
        } catch (e) {
            modernAlert('Failed to send email', 'Network error', 'error');
        }
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
                setNewEmp({
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    position: '',
                    department: '',
                    salary: '',
                    commissionRate: '',
                    compensationType: 'Fixed',
                    role: 'seller',
                    allowedPlatforms: [],
                    permissions: ['inventory', 'orders', 'support']
                });
                fetchData();
            } else {
                const err = await res.json();
                modernAlert(`Failed to process request: ${err.error || 'Unknown Error'}`);
            }
        } catch (error) {
            console.error(error);
            modernAlert('Error processing staff');
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
            modernAlert('Reply Sent');
            fetchData();
        } catch { modernAlert('Failed to send reply'); }
    };

    const handleCloseTicket = async (ticketId: number) => {
        if (!(await modernConfirm('Are you sure you want to close this ticket?'))) return;
        try {
            await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'close', ticketId })
            });
            modernAlert('Ticket Closed');
            fetchData();
        } catch { modernAlert('Failed to close ticket'); }
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
                modernAlert('Admin Profile Updated!');
                (e.target as HTMLFormElement).reset();
            } else {
                modernAlert('Failed to update profile');
            }
        } catch (e) {
            console.error(e);
            modernAlert('Error updating profile');
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
                body: JSON.stringify({ topic: blogTopic, isGuestPost })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                modernAlert(`Blog Published: ${data.title}`);
                setBlogTopic(''); // Clear on success
            } else {
                modernAlert('Failed: ' + (data.error || 'Unknown server error'));
            }
        } catch (e) {
            console.error(e);
            modernAlert('Network Error: Could not connect to generator');
        } finally { setBlogLoading(false); }
    };

    const handleBulkGenerateReviews = async (ids?: number[]) => {
        const targetIds = ids || selectedShopProducts;
        if (targetIds.length === 0) return modernAlert('Select at least one product');

        const count = await modernPrompt('How many reviews per product? (Default: 5)');
        if (count === null) return;

        try {
            const res = await fetch('/api/admin/bulk-generate-product-reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productIds: targetIds, count: parseInt(count) || 5 })
            });
            const data = await res.json();
            if (data.success) {
                modernAlert(`✅ ${data.message}`);
            } else {
                modernAlert('Error: ' + data.error);
            }
        } catch (e) {
            modernAlert('Failed to generate reviews');
        }
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
                modernAlert('Configuration Saved Securely!');
            } else {
                const err = await res.json();
                modernAlert('Failed to save settings: ' + (err.error || 'Unknown Error'));
            }
        } catch (error) {
            modernAlert('Failed to save settings. Please try again.');
        }
    };

    const handleAddPost = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/social', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', ...newPost, staffName: 'Admin' })
            });
            const data = await res.json();

            if (data.success) {
                // Show detailed log from backend (e.g. "Twitter: Sent", "Facebook: Failed")
                const logMsg = data.log ? data.log.join('\n') : 'Content Deployed!';
                modernAlert(logMsg.includes('Failed') ? '⚠️ Deployment Report' : '✅ Deployment Successful', logMsg);

                setShowAddPost(false);
                setNewPost({ content: '', platforms: ['All'] });
                fetchData();
            } else {
                modernAlert('❌ Error', data.error);
            }
        } catch (e) {
            modernAlert('❌ Network Error');
        }
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
                modernAlert('Order Fulfilled Successfully! Email sent to customer.');
                setShowFulfill(false);
                setFulfillDetails('');
                fetchData();
            } else {
                modernAlert('Fulfillment Error: ' + data.error);
            }
        } catch (e) { modernAlert('Network Error'); }
    };

    const handleCleanupDescriptions = async () => {
        if (!(await modernConfirm('This will remove "Imported from Z2U store" from all products and replace it with a professional description. Proceed?'))) return;
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cleanup_descriptions' })
            });
            fetchData();
            modernAlert('Descriptions Cleaned!');
        } catch { modernAlert('Failed to clean descriptions'); }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!(await modernConfirm('Are you sure you want to delete this product from the shop?'))) return;
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
        const p = await modernPrompt('Provide manual replacement credentials to skip stock check. \n\nLeave BLANK and press OK to automatically pull from stock instead.');
        if (p === null) return; // Cancelled
        const replacementData = p.trim();

        if (!replacementData) {
            const confirmed = await modernConfirm('Are you sure you want to AUTO-PULL fresh stock? Old items will be marked as DEFECTIVE.');
            if (!confirmed) return;
        }

        setIsReplacing(true);
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'replace_sale', transactionId, replacementData: replacementData || undefined })
            });
            const data = await res.json();
            if (data.success && data.newToken) {
                const newLink = `${window.location.origin}/delivery/${data.newToken}`;
                navigator.clipboard.writeText(newLink).catch(() => { });
                modernAlert(`✅ Replacement successful!`, `New Link COPIED: ${newLink}`, 'success');
                fetchData();
            } else {
                modernAlert('Replacement failed', data.error || 'No stock available?', 'error');
            }
        } catch (e) {
            modernAlert('Network error', undefined, 'error');
        } finally {
            setIsReplacing(false);
        }
    };

    const handleReplaceItem = async (itemId: string) => {
        const p = await modernPrompt('Provide manual replacement credentials for this item. \n\nLeave BLANK and press OK to automatically pull from stock instead.');
        if (p === null) return;
        const replacementData = p.trim();

        if (!replacementData) {
            const confirmed = await modernConfirm('Are you sure you want to AUTO-PULL fresh stock? Old item will be marked as DEFECTIVE.');
            if (!confirmed) return;
        }

        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'replace_item', itemId, replacementData: replacementData || undefined })
            });
            const data = await res.json();
            if (data.success && data.newToken) {
                const newLink = `${window.location.origin}/delivery/${data.newToken}`;
                navigator.clipboard.writeText(newLink).catch(() => { });
                modernAlert(`✅ Item replaced successfully!`, `New Delivery Link Generated & COPIED to clipboard:\n${newLink}`, 'success');
                fetchData();
            } else {
                modernAlert('Replacement failed', data.error || 'Check stock/logs', 'error');
            }
        } catch (e) {
            modernAlert('Network error', undefined, 'error');
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
        setNewProduct({
            name: '',
            platform: 'OfficialUM1',
            price: '',
            description: '',
            image: '',
            salePrice: '',
            saleEndsAt: '',
            bundleItems: '',
            stock: '100',
            category_id: '',
            seo_title: '',
            seo_description: '',
            focus_keyword: '',
            seo_keywords: '',
            canonical_url: '',
            robots: 'index,follow',
            schema_type: 'Product'
        });
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
            setNewCategory({ name: '', slug: '', icon: '📁', image: '' });
            fetchData();
            alert("Category Created Successfully!");
        } catch (err) {
            alert("Network error creating category");
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!(await modernConfirm('Are you sure? Products in this category will be uncategorized.'))) return;
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
                email: newItem.email || '',
                emailPassword: newItem.emailPassword || '',
                country: newItem.country || '',
                extraInfo: finalExtra,
                tag: newItem.tag || '',
                image: newItem.image || null
            })
        });
        setShowAddInv(false);
        setNewItem({ name: '', platform: 'OfficialUM1', purchasePrice: '', credentials: '', username: '', password: '', email: '', emailPassword: '', country: '', extraInfo: '', tag: '', image: '' });
        fetchData();
    };

    const handleBulkImport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/inventory', {
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
            const data = await res.json();
            if (data.success) {
                modernAlert(`✅ Successfully imported ${data.count} accounts!`);
                setShowBulk(false);
                setBulkData('');
                fetchTabContent('stock');
            } else {
                modernAlert('❌ Import failed: ' + data.error);
            }
        } catch (e) {
            modernAlert('❌ Network error during bulk import');
        }
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
            await fetch('/api/blogs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...blogForm, category: blogForm.category || 'Growth', readTime: '5 min read' }) });
            setBlogForm({
                title: '',
                excerpt: '',
                content: '',
                category: 'SEO',
                image: '',
                meta_title: '',
                meta_description: '',
                focus_keyword: '',
                seo_keywords: '',
                canonical_url: '',
                robots: 'index,follow',
                schema_type: 'BlogPosting'
            }); fetchData(); alert('Blog Posted');
        } catch { }
    };

    const handleDeleteBlog = async (id: any) => {
        if (!(await modernConfirm('Delete blog post?'))) return;
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

        // Use the bank/wallet name as the platform for Direct sales to update correct wallet
        const finalPlatform = (newSale.platform === 'Direct' && newSale.paymentReceived) ? newSale.paymentReceived : newSale.platform;

        const res = await fetch('/api/admin/inventory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'record_sale',
                ...newSale,
                platform: finalPlatform, // Use the specific wallet
                staffName: currentUser?.name || currentUser?.email || 'Admin',
                mode: sellMode, // 'single' or 'bulk'
                quantity: newSale.quantity, // For bulk
                productName: newSale.productName // For bulk
            })
        });
        const resData = await res.json();
        const token = resData?.data?.delivery?.token || resData?.delivery?.token;
        if (token) {
            const deliveryUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://officialum1.com'}/delivery/${token}`;
            try {
                if (navigator?.clipboard) {
                    await navigator.clipboard.writeText(deliveryUrl);
                }
            } catch (clipErr) {}
            modernAlert(`✅ Sale Recorded Successfully!\n\n🔗 Delivery Link (Auto-Copied to Clipboard):\n${deliveryUrl}`);
        } else {
            modernAlert("Sale recorded successfully!");
        }
        setNewSale({ description: '', platform: 'OfficialUM1', paymentReceived: '', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '', productName: '', quantity: '1' });
        fetchData();
    };

    const handleAddFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        const action = fundForm.actionType === 'transfer' ? 'transfer_funds' : 'add_funds';

        await fetch('/api/finance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...fundForm, staffName: currentUser?.name || 'Admin' })
        });
        setShowAddFunds(false);
        setFundForm({
            actionType: 'adjustment',
            platform: 'Meezan',
            fromPlatform: 'Binance',
            toPlatform: 'RedotPay',
            amount: '',
            currency: 'PKR',
            description: ''
        });
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
        <AdminShell title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('_', ' ')}>

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
                            handleReplaceItem={handleReplaceItem}
                            fetchData={fetchData}
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
                            bulkProductData={bulkProductData}
                            setBulkProductData={setBulkProductData}
                            handleDeleteProduct={handleDeleteProduct}
                            handleBulkGenerateReviews={handleBulkGenerateReviews}
                        />
                    )}

                    {activeTab === 'reviews_hub' && (
                        <ReviewsTab catalog={catalog} />
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

                    {activeTab === 'indexing' && (
                        <IndexingTab />
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

                    {activeTab === 'rankmath' && <RankMathTab />}

                    {
                        activeTab === 'leads' && (
                            <LeadsTab leads={leads} fetchData={fetchData} />
                        )
                    }
                    {
                        activeTab === 'sell' && (
                            <SellTab
                                handleRecordSale={handleRecordSale}
                                sellMode={sellMode}
                                setSellMode={setSellMode}
                                newSale={newSale}
                                setNewSale={setNewSale}
                                inventory={inventory}
                                hasPermission={hasPermission}
                                balanceHistory={balanceHistory}
                                currentUser={currentUser}
                                copiedId={copiedId}
                                setCopiedId={setCopiedId}
                                handleReplaceSale={handleReplaceSale}
                                isReplacing={isReplacing}
                                setDeleteId={setDeleteId}
                                setShowDeleteModal={setShowDeleteModal}
                            />
                        )
                    }
                    {activeTab === 'builder' && <BuilderTab />}

                    {/* MARKET INTELLIGENCE TAB */}
                    {activeTab === 'intel' && (
                        <IntelTab
                            marketIntel={marketIntel}
                            intelForm={intelForm}
                            setIntelForm={setIntelForm}
                            fetchData={fetchData}
                        />
                    )}

                    {/* LIVE TRAFFIC TAB */}
                    {activeTab === 'live_traffic' && (
                        <TrafficTab />
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
                            handleUpdateUser={handleUpdateUser} // Pass the function prop
                            handleResendUserEmail={handleResendUserEmail}
                            fetchData={fetchData}
                        />
                    )}

                    {activeTab === 'sellers' && (
                        <SellersTab
                            users={users}
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
                            handleCloseTicket={handleCloseTicket}
                        />
                    )}
                    {activeTab === 'verifications' && (
                        <VerificationTab />
                    )}
                    {activeTab === 'business' && (
                        <BusinessTab fetchData={fetchData} />
                    )}
                    {activeTab === 'documents' && (
                        <DocumentsTab />
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
                            stats={stats}
                            userCount={users.length}
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
                                isGuestPost={isGuestPost}
                                setIsGuestPost={setIsGuestPost}
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
                                    if (await modernConfirm('Terminate and delete staff account? This cannot be undone.')) {
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
                                    const method = kbForm.id ? 'PUT' : 'POST';

                                    // Auto-slug if missing
                                    const finalForm = { ...kbForm };
                                    if (!finalForm.slug && finalForm.title) {
                                        finalForm.slug = finalForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                    }

                                    const res = await fetch('/api/kb', {
                                        method,
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(finalForm)
                                    });

                                    if (res.ok) {
                                        modernAlert(kbForm.id ? "Article Updated" : "Article Created", "", "success");
                                        setShowAddKb(false);
                                        setKbForm({ title: '', slug: '', content: '', category: 'General', is_published: true, meta_description: '', keywords: '' });
                                        fetchData();
                                    } else {
                                        const err = await res.json();
                                        modernAlert("Save Failed", err.error || "Unknown error", "error");
                                    }
                                }}
                                kbArticles={kbArticles}
                                handleDeleteKb={async (id) => {
                                    if (await modernConfirm('Delete?')) {
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
                            <h3 style={{ marginBottom: '1.5rem', color: '#00ccff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '1.5rem' }}>📁</span> Manage Store Categories
                            </h3>

                            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Display Name</label>
                                        <input className="input-field" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} placeholder="e.g. Netflix Premium" required style={{ width: '100%', height: '46px', borderRadius: '12px' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.4rem', textTransform: 'uppercase' }}>URL Slug</label>
                                        <input className="input-field" value={newCategory.slug} onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })} placeholder="netflix-premium" required style={{ width: '100%', height: '46px', borderRadius: '12px' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Icon/Emoji</label>
                                        <input className="input-field" value={newCategory.icon} onChange={e => setNewCategory({ ...newCategory, icon: e.target.value })} placeholder="📁" style={{ width: '100%', padding: '0.5rem', textAlign: 'center', height: '46px', borderRadius: '12px' }} />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ display: 'block', fontSize: '0.7rem', color: '#666', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Category Banner/Image (Optional URL)</label>
                                        <input className="input-field" value={newCategory.image} onChange={e => setNewCategory({ ...newCategory, image: e.target.value })} placeholder="https://example.com/banner.jpg" style={{ width: '100%', height: '46px', borderRadius: '12px' }} />
                                    </div>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', height: '46px', borderRadius: '12px', fontWeight: 'bold' }}>Create Category</button>
                                </div>
                            </form>

                            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '5px' }}>
                                {categories.map((cat: any) => (
                                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', marginBottom: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                                            <div style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden' }}>
                                                {cat.image ? (
                                                    <img src={cat.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : cat.icon && (cat.icon.startsWith('/') || cat.icon.startsWith('http')) ? (
                                                    <img src={cat.icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                ) : (
                                                    <span style={{ fontSize: '1.8rem' }}>{cat.icon || '📁'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '700', fontSize: '1.05rem', color: '#fff' }}>{cat.name}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#555', fontFamily: 'monospace' }}>/{cat.slug}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.7rem' }}>
                                            <button onClick={() => { setShowCategorySale(cat); setCategorySaleForm({ discount: (cat.discount_percent !== undefined && cat.discount_percent !== null) ? cat.discount_percent.toString() : '', expiry: cat.sale_ends_at ? new Date(cat.sale_ends_at).toISOString().slice(0, 16) : '' }); }} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '10px', fontSize: '0.75rem', padding: '0.5rem 0.8rem', color: cat.discount_percent > 0 ? '#ff4d4d' : '#888', borderColor: cat.discount_percent > 0 ? '#ff4d4d44' : 'rgba(255,255,255,0.1)' }}>
                                                {cat.discount_percent > 0 ? `🔥 ${cat.discount_percent}% Off` : '🏷️ Flash Sale'}
                                            </button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} className="btn btn-outline" style={{ borderRadius: '10px', fontSize: '0.75rem', padding: '0.5rem 0.8rem', color: '#ff4444', borderColor: '#ff444433' }}>Delete</button>
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

            {/* GLOBAL USER EDIT MODAL */}
            {showUserEdit && selectedUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', backdropFilter: 'blur(5px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(0,255,136,0.3)', animation: 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                            <h3 style={{ color: '#00ff88', margin: 0 }}>Edit User Profile</h3>
                            <button onClick={() => setShowUserEdit(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                <input className="input-field" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%', padding: '0.8rem' }} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>New Password (Optional)</label>
                                <input className="input-field" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={{ width: '100%', padding: '0.8rem' }} placeholder="Leave blank to keep current" />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Telegram / Discord</label>
                                <input className="input-field" value={userForm.telegram} onChange={e => setUserForm({ ...userForm, telegram: e.target.value })} style={{ width: '100%', padding: '0.8rem' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>Role</label>
                                    <select className="input-field" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', color: '#fff' }}>
                                        <option value="buyer">Buyer</option>
                                        <option value="seller">Seller</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem', display: 'block' }}>VIP Tier</label>
                                    <select className="input-field" value={selectedUser.membership || 'none'} onChange={e => setSelectedUser({ ...selectedUser, membership: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#0a0a0a', color: '#fff' }}>
                                        <option value="none">Standard</option>
                                        <option value="silver">Silver</option>
                                        <option value="gold">Gold</option>
                                        <option value="diamond">Diamond</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <button type="button" onClick={() => setShowUserEdit(false)} className="btn btn-outline" style={{ padding: '0.8rem' }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', fontWeight: 'bold' }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <style jsx>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideUp { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }

                @media (max-width: 1024px) {
                    div[style*="display: flex; paddingTop: 80px"] {
                        flex-direction: column !important;
                    }
                    div[style*="width: 280px"] {
                        width: 100% !important;
                        height: auto !important;
                        position: sticky !important;
                        top: 80px !important;
                        left: 0 !important;
                        right: 0 !important;
                        z-index: 100 !important;
                        border-right: none !important;
                        border-bottom: 1px solid #222 !important;
                        padding: 0.5rem !important;
                        display: block !important;
                        background: rgba(10, 10, 10, 0.95) !important;
                        backdrop-filter: blur(10px) !important;
                        overflow-x: auto !important;
                    }
                    div[style*="width: 280px"] h1 { display: none !important; }
                    div[style*="display: flex; flexDirection: column; gap: 1.5rem"] {
                        flex-direction: row !important;
                        gap: 1rem !important;
                        width: max-content !important;
                        padding: 0.5rem !important;
                    }
                    div[style*="display: flex; flexDirection: column; gap: 0.2rem"] {
                        flex-direction: row !important;
                        gap: 0.5rem !important;
                    }
                    div[style*="display: flex; flexDirection: column; gap: 0.2rem"] button {
                        white-space: nowrap !important;
                        padding: 0.6rem 1rem !important;
                        font-size: 0.8rem !important;
                        width: auto !important;
                    }
                    div[style*="fontSize: 0.7rem; color: #666"] { display: none !important; }

                    div[style*="flex: 1; padding: 2rem 3rem"] {
                        padding: 1.5rem !important;
                        width: 100% !important;
                    }
                    div[style*="display: flex; justifyContent: flex-end"] {
                        flex-wrap: wrap !important;
                        justify-content: center !important;
                        gap: 0.5rem !important;
                    }
                    .btn {
                        font-size: 0.8rem !important;
                        padding: 0.6rem 1rem !important;
                    }
                }

                @media (max-width: 640px) {
                    div[style*="flex: 1; padding: 2rem 3rem"] {
                        padding: 1rem !important;
                    }
                    .glass { padding: 1rem !important; }
                }
            `}</style>
            <ModernUIOverlay />
        </AdminShell>
    );
}
