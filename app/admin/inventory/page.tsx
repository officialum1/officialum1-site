"use client";

import { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getPlatformIcon } from '@/lib/icons';
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
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'leads', 'marketing'
    const [showAddInv, setShowAddInv] = useState(false);
    const [showRecordSale, setShowRecordSale] = useState(false);
    const [showBulk, setShowBulk] = useState(false);

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
        productProfit: {} as any
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
    const [newSale, setNewSale] = useState({ description: '', platform: 'Z2U', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '' });
    const [deliveryLink, setDeliveryLink] = useState('');
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [fundForm, setFundForm] = useState({ platform: 'Meezan', amount: '', currency: 'PKR', description: '' });

    // Bulk Import State
    const [isBulk, setIsBulk] = useState(false);
    const [bulkData, setBulkData] = useState('');
    const [logs, setLogs] = useState<any[]>([]);
    const [kbArticles, setKbArticles] = useState<any[]>([]);
    const [showAddKb, setShowAddKb] = useState(false);
    const [kbForm, setKbForm] = useState({ title: '', content: '', category: 'General', is_published: true });

    // View Mode for Inventory
    const [viewMode, setViewMode] = useState<'summary' | 'list'>('summary');
    const [catalog, setCatalog] = useState<any[]>([]);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', platform: 'Z2U', price: '', description: '', image: '', salePrice: '', saleEndsAt: '', bundleItems: '', stock: '100' });
    const [orders, setOrders] = useState<any[]>([]);
    const [isBulkProduct, setIsBulkProduct] = useState(false);
    const [importMode, setImportMode] = useState<'manual' | 'csv' | 'z2u' | 'playerup'>('manual');
    const [bulkProductData, setBulkProductData] = useState('');
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [selectedShopProducts, setSelectedShopProducts] = useState<number[]>([]);
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    const [bulkUpdateText, setBulkUpdateText] = useState('');

    // Fulfillment
    const [showFulfill, setShowFulfill] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [fulfillDetails, setFulfillDetails] = useState('');

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
    const [promoForm, setPromoForm] = useState({ code: '', discount: '' });
    const [reviewForm, setReviewForm] = useState({ name: '', role: '', review: '', rating: 5 });

    // User Editing State
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showUserEdit, setShowUserEdit] = useState(false);
    const [userForm, setUserForm] = useState({ email: '', password: '', telegram: '', role: 'buyer' });

    const [currentUser, setCurrentUser] = useState<any>(null);
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem('buyer_user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
            // Permissions are stored as a JSON string in the DB
            try {
                const perms = user.permissions ? (typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions) : ((user.role || '').toLowerCase() === 'admin' ? ['all'] : []);
                setPermissions(perms);
            } catch (e) {
                setPermissions((user.role || '').toLowerCase() === 'admin' ? ['all'] : []);
            }
        }
    }, []);

    // Sync tab with URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && tab !== activeTab) setActiveTab(tab);
    }, [searchParams]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', tabId);
        router.push(`${pathname}?${params.toString()}`);
    };

    const hasPermission = (perm: string) => {
        return permissions.includes('all') || permissions.includes(perm);
    };

    const fetchData = async () => {
        try {
            const [invRes, balRes, leadsRes, postsRes, settingsRes, empRes, logsRes, catRes, ordersRes,
                blogsRes, pagesRes, servRes, projRes, revRes, rentRes, msgRes, promoRes, usersRes
            ] = await Promise.all([
                fetch('/api/admin/inventory?type=inventory'),
                fetch('/api/admin/inventory?type=balance'),
                fetch('/api/leads'),
                fetch('/api/social'),
                fetch('/api/admin/settings'),
                fetch('/api/hr/employees'),
                fetch('/api/admin/logs'),
                fetch('/api/products'),
                fetch('/api/admin/orders'),
                // Restored Fetches
                fetch('/api/blogs'),
                fetch('/api/pages'),
                fetch('/api/services'),
                fetch('/api/projects'),
                fetch('/api/testimonials?all=true'),
                fetch('/api/rentals'),
                fetch('/api/messages'),
                fetch('/api/promocodes'),
                fetch('/api/admin/users')
            ]);

            const invData = await invRes.json();
            const balData = await balRes.json();
            const leadsData = await leadsRes.json();
            const postsData = await postsRes.json();
            const settingsData = await settingsRes.json();
            const empData = await empRes.json();
            const logsData = await logsRes.json();
            const catData = await catRes.json();
            const ordersData = await ordersRes.json();

            // Fail-safe Ticket Fetch (Don't crash if DB is down)
            let ticketData = [];
            try {
                const tRes = await fetch('/api/tickets');
                if (tRes.ok) ticketData = await tRes.json();
            } catch (e) { console.warn("Tickets fetch failed"); }

            setInventory(invData);
            setBalanceHistory(balData);
            setLeads(leadsData);
            setPosts(postsData);
            setSettings(settingsData);
            setEmployees(empData);
            setLogs(logsData);
            setCatalog(catData);
            setOrders(ordersData);
            setTickets(ticketData);

            // Set Restored Data with Array Validation
            try { const b = await blogsRes.json(); setManualBlogs(Array.isArray(b) ? b : []); } catch { setManualBlogs([]); }
            try { setPages(await pagesRes.json()); } catch { setPages({}); }
            try { const s = await servRes.json(); setServices(Array.isArray(s) ? s : []); } catch { setServices([]); }
            try { const p = await projRes.json(); setProjects(Array.isArray(p) ? p : []); } catch { setProjects([]); }
            try { const r = await revRes.json(); setReviews(Array.isArray(r) ? r : []); } catch { setReviews([]); }
            try { const rt = await rentRes.json(); setRentals(Array.isArray(rt) ? rt : []); } catch { setRentals([]); }
            try { const m = await msgRes.json(); setMessages(Array.isArray(m) ? m : []); } catch { setMessages([]); }
            try { const pc = await promoRes.json(); setPromoCodes(Array.isArray(pc) ? pc : []); } catch { setPromoCodes([]); }
            try { const u = await usersRes.json(); setUsers(Array.isArray(u) ? u : []); } catch { setUsers([]); }
            try {
                const kbRes = await fetch('/api/kb');
                const kbData = await kbRes.json();
                setKbArticles(Array.isArray(kbData) ? kbData : []);
            } catch { setKbArticles([]); }

            calculateStats(balData, empData, invData);
        } catch (e) {
            console.error("Failed to load admin data", e);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (history: any[], staffList: any[], inventoryList: any[]) => {
        const newStats = {
            z2u: 0, playerup: 0, direct: 0, g2g: 0, total: 0, profit: 0, margin: 0,
            stockValue: 0, deptBreakdown: {} as any,
            monthlyProfit: {} as any, productProfit: {} as any
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

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/admin/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        alert('API Keys Saved Securely!');
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
        setNewProduct({ name: '', platform: 'Z2U', price: '', description: '', image: '', salePrice: '', saleEndsAt: '', bundleItems: '', stock: '100' });
        fetchData();
    };

    const handleBulkProductImport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bulk_import',
                    bulkData: bulkProductData
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
            if (res.ok) { setPromoForm({ code: '', discount: '' }); fetchData(); alert('Promo Created'); }
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
            body: JSON.stringify({ action: 'record_sale', ...newSale })
        });
        setShowRecordSale(false);
        setNewSale({ description: '', platform: 'Z2U', salePrice: '', staffName: 'Admin', proofImage: '', inventoryId: '' });
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

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {[
                            { id: 'inventory', label: '📦 Orders', perm: 'orders' },
                            { id: 'stock', label: '📊 Stock', perm: 'inventory' },
                            { id: 'website', label: '🌐 Website', perm: 'website' },
                            { id: 'sell', label: '💸 Sales', perm: 'sales' },
                            { id: 'finance', label: '💰 Finance', perm: 'finance' },
                            { id: 'payments', label: '💳 Payments', perm: 'settings' }, // Removed href to keep in-app
                            { id: 'catalog', label: '🛍️ Catalog', perm: 'inventory' },
                            { id: 'leads', label: '👥 Leads', perm: 'leads' },
                            { id: 'users', label: '👤 Buyers', perm: 'users' },
                            { id: 'support', label: '🎫 Support', perm: 'support' },
                            { id: 'promos', label: '🏷️ Promos', perm: 'inventory' },
                            { id: 'marketing', label: '📢 Marketing', perm: 'marketing' },
                            { id: 'tools', label: '🛠️ Tools', perm: 'tools' },
                            { id: 'hr', label: '👔 Staff & Admins', perm: 'hr' },
                            { id: 'logs', label: '📜 Logs', perm: 'all' },
                            { id: 'kb', label: '📚 KB/FAQ', perm: 'website' },
                            { id: 'settings', label: '⚙️ Settings', perm: 'settings' }
                        ].filter(tab => hasPermission(tab.perm)).map((tab: any) => (
                            <button
                                key={tab.id}
                                onClick={() => tab.href ? router.push(tab.href) : handleTabChange(tab.id)}
                                style={{
                                    background: activeTab === tab.id ? 'linear-gradient(90deg, rgba(0,255,136,0.1), transparent)' : 'transparent',
                                    border: 'none',
                                    borderLeft: activeTab === tab.id ? '3px solid #00ff88' : '3px solid transparent',
                                    color: activeTab === tab.id ? '#00ff88' : '#888',
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    padding: '0.8rem 1rem',
                                    textAlign: 'left',
                                    borderRadius: '0 8px 8px 0',
                                    transition: 'all 0.2s',
                                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                    width: '100%'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div style={{ flex: 1, padding: '2rem 3rem', maxWidth: '1600px', overflowX: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => {
                                setLoading(true);
                                fetchData();
                            }}
                            className="btn btn-outline"
                            style={{ color: '#00ff88', borderColor: '#00ff8833', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                        >
                            🔄 Sync System
                        </button>
                        <button onClick={() => { localStorage.removeItem('admin_user'); window.location.href = '/admin/login'; }} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#444', padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}>
                            Logout
                        </button>
                    </div>

                    {/* INVENTORY TAB */}
                    {/* ORDERS TAB (Formerly Inventory) */}
                    {activeTab === 'inventory' && (
                        <div className="FadeIn">
                            <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-outfit)' }}>📦 Customer Orders</h2>

                            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Order ID</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Customer</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                            <th style={{ padding: '1rem', textAlign: 'left' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order: any) => (
                                            <tr key={order.orderId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>{new Date(order.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>#{order.orderId ? order.orderId.slice(-6) : 'N/A'}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{order.product_name}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{order.platform}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div>{order.guestEmail || 'Registered User'}</div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span style={{
                                                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                                                        background: order.status === 'completed' ? 'rgba(0,255,136,0.2)' : 'rgba(255,165,0,0.2)',
                                                        color: order.status === 'completed' ? '#00ff88' : '#ffa500'
                                                    }}>
                                                        {order.status ? order.status.toUpperCase() : 'PENDING'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {order.status !== 'completed' && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedOrder(order);
                                                                setShowFulfill(true);
                                                            }}
                                                            className="btn btn-primary"
                                                            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                                                        >
                                                            Fulfill
                                                        </button>
                                                    )}
                                                    {order.status === 'completed' && <span style={{ color: '#666', fontSize: '0.8rem' }}>Delivered</span>}
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No orders found yet.</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            {/* Fulfill Modal */}
                            {showFulfill && selectedOrder && (
                                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                                    <div className="glass" style={{ padding: '2rem', borderRadius: '16px', width: '500px', maxWidth: '90%' }}>
                                        <h3 style={{ marginBottom: '1rem' }}>Fulfill Order #{selectedOrder.orderId.slice(-6)}</h3>
                                        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Send delivery details for <b>{selectedOrder.product_name}</b> to <b>{selectedOrder.guestEmail}</b>.</p>

                                        <form onSubmit={handleFulfill}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff88' }}>Credentials / Delivery Info</label>
                                            <textarea
                                                className="input-field"
                                                rows={6}
                                                placeholder="Enter Email:Password or Download Link here..."
                                                value={fulfillDetails}
                                                onChange={e => setFulfillDetails(e.target.value)}
                                                required
                                                style={{ width: '100%', marginBottom: '1.5rem', fontFamily: 'monospace' }}
                                            />

                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                                <button type="button" onClick={() => setShowFulfill(false)} className="btn btn-outline">Cancel</button>
                                                <button type="submit" className="btn btn-primary">Complete & Send Email</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                    {/* STOCK TAB */}
                    {activeTab === 'stock' && (
                        <div className="FadeIn">
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <div>
                                        <h2 style={{ fontSize: '1.4rem', margin: 0 }}>📦 Stock Inventory</h2>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Manage bulk accounts and manual links.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setShowAddInv(true)} className="btn btn-outline">+ Add Item</button>
                                        <button onClick={() => setShowBulk(true)} className="btn btn-outline">Bulk</button>

                                    </div>
                                </div>

                                {/* STOCK VIEW TOGGLE */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                                        <button onClick={() => setViewMode('summary')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'summary' ? '#00ff88' : 'transparent', color: viewMode === 'summary' ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>Cards</button>
                                        <button onClick={() => setViewMode('list')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: viewMode === 'list' ? '#00ff88' : 'transparent', color: viewMode === 'list' ? '#000' : '#888', cursor: 'pointer', fontWeight: 'bold' }}>List</button>
                                    </div>
                                </div>

                                {/* Stock Display */}
                                {viewMode === 'summary' ? (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {Array.from(new Set(inventory.filter(i => i.status === 'In Stock').map(i => i.name))).map(name => {
                                            const items = inventory.filter(i => i.name === name);
                                            const activeItems = items.filter(i => i.status === 'In Stock');
                                            const inStock = activeItems.length;
                                            const platform = activeItems[0]?.platform || 'Unknown';

                                            if (inStock === 0) return null;

                                            return (
                                                <div key={name} className="glass" style={{ padding: '1.5rem', borderRadius: '16px', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 8px', background: '#00ff88', color: '#000', fontSize: '0.7rem', fontWeight: 'bold' }}>
                                                        ACTIVE
                                                    </div>
                                                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', color: '#fff' }}>{name}</h3>
                                                    <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1.5rem' }}>Platform: <span style={{ color: '#ccc' }}>{platform}</span></div>

                                                    <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                                                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#00ff88' }}>{inStock}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase' }}>Available Stock</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {inventory.filter(i => i.status === 'In Stock').length === 0 && <div style={{ color: '#666' }}>No active stock found.</div>}
                                    </div>
                                ) : (
                                    <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                            <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                                <tr>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Item Name</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Platform</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Asset Value</th>
                                                    <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inventory.filter(i => i.status === 'In Stock').map((item: any) => (
                                                    <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '1rem' }}>{item.name}</td>
                                                        <td style={{ padding: '1rem' }}>{item.platform}</td>
                                                        <td style={{ padding: '1rem', color: '#ccc' }}>{item.purchasePrice ? `$${item.purchasePrice}` : '***'}</td>
                                                        <td style={{ padding: '1rem' }}><span style={{ color: '#00ff88' }}>In Stock</span></td>
                                                    </tr>
                                                ))}
                                                {inventory.filter(i => i.status === 'In Stock').length === 0 && <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No items in inventory.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Forms for RESTORED Features */}
                                {showAddInv && (
                                    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)', marginTop: '2rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                            <h3 style={{ margin: 0 }}>Add Inventory Stock</h3>
                                        </div>

                                        <form onSubmit={handleAddInventory} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Platform</label><select className="input-field" value={newItem.platform} onChange={e => setNewItem({ ...newItem, platform: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}><option value="Z2U">Z2U</option><option value="PlayerUp">PlayerUp</option><option value="G2G">G2G</option><option value="Direct">Direct Sale</option></select></div>
                                            <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Item Name</label><input type="text" className="input-field" required value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} placeholder="Product Title" style={{ width: '100%' }} /></div>
                                            <div style={{ gridColumn: 'span 2' }}><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Purchase Price ($)</label><input type="number" required className="input-field" value={newItem.purchasePrice} onChange={e => setNewItem({ ...newItem, purchasePrice: e.target.value })} style={{ width: '100%' }} /></div>

                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#00ff88' }}>Account Credentials (Paste Full)</label>
                                                <textarea
                                                    className="input-field"
                                                    value={newItem.credentials || ''}
                                                    onChange={e => setNewItem({ ...newItem, credentials: e.target.value })}
                                                    style={{ width: '100%', height: '100px', fontFamily: 'monospace' }}
                                                    placeholder="Paste detail here (e.g. user:pass:email or just user:pass)"
                                                />
                                            </div>

                                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                <button type="button" onClick={() => setShowAddInv(false)} className="btn btn-outline">Cancel</button>
                                                <button type="submit" className="btn btn-primary">Add Item</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {showBulk && (
                                    <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #06b6d4', marginTop: '2rem' }}>
                                        <h3 style={{ marginBottom: '1rem' }}>Bulk Import Inventory</h3>
                                        <textarea
                                            placeholder="Paste Account Lines Here..."
                                            value={bulkData}
                                            onChange={e => setBulkData(e.target.value)}
                                            className="input-field"
                                            style={{ width: '100%', height: '150px', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '1rem' }}
                                        />
                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                            <button onClick={handleBulkImport} className="btn btn-primary">Process Import</button>
                                            <button onClick={() => setShowBulk(false)} className="btn btn-outline">Cancel</button>
                                        </div>
                                    </div>
                                )}


                            </div>
                        </div>
                    )}

                    {/* CATALOG TAB */}
                    {activeTab === 'catalog' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>🛍️ Shop Product Catalog</h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {catalog.length > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginRight: '1rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedShopProducts.length === catalog.length}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedShopProducts(catalog.map(p => p.id));
                                                    else setSelectedShopProducts([]);
                                                }}
                                                style={{ width: '18px', height: '18px', accentColor: '#00ff88', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.9rem', color: '#888' }}>Select All</span>
                                        </div>
                                    )}
                                    {selectedShopProducts.length > 0 && (
                                        <button onClick={handleBulkDeleteProducts} className="btn btn-outline" style={{ color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)', background: 'rgba(255,77,77,0.05)' }}>
                                            🗑️ Delete ({selectedShopProducts.length})
                                        </button>
                                    )}
                                    <button onClick={handleCleanupDescriptions} className="btn btn-outline" style={{ borderStyle: 'dashed', opacity: 0.7 }}>🧹 Clean Descriptions</button>
                                    <button onClick={() => {
                                        const results = catalog.filter(p => selectedShopProducts.includes(p.id) || (selectedShopProducts.length === 0));
                                        const bulkText = results.map(p => `${p.id},${p.price},${p.stock || 1},${p.platform}`).join('\n');
                                        setBulkUpdateText(bulkText);
                                        setShowBulkUpdateModal(true);
                                    }} className="btn btn-outline" style={{ color: '#00ff88', borderColor: '#00ff8833' }}>
                                        📝 Bulk Stock/Price
                                    </button>
                                    <button onClick={() => setShowAddProduct(true)} className="btn btn-primary">+ Add Shop Product</button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {catalog.map((prod: any) => (
                                    <div key={prod.id} className="glass" style={{ borderRadius: '16px', overflow: 'hidden', border: `1px solid ${selectedShopProducts.includes(prod.id) ? '#00ff88' : 'rgba(255,255,255,0.05)'}`, position: 'relative' }}>
                                        {/* Bulk Select Checkbox */}
                                        <div style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10 }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedShopProducts.includes(prod.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedShopProducts([...selectedShopProducts, prod.id]);
                                                    else setSelectedShopProducts(selectedShopProducts.filter(id => id !== prod.id));
                                                }}
                                                style={{ width: '20px', height: '20px', accentColor: '#00ff88', cursor: 'pointer' }}
                                            />
                                        </div>

                                        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
                                            <div style={{ width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#222', borderRadius: '50%', fontSize: '2rem' }}>
                                                <img src={getPlatformIcon(prod.platform, prod.image)} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
                                            </div>
                                        </div>
                                        <div style={{ padding: '1.5rem' }}>
                                            <h3 style={{ marginBottom: '0.5rem', color: '#fff' }}>{prod.name}</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ccc', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                                <span>{prod.platform}</span>
                                                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>${prod.price}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(prod);
                                                        setNewProduct({
                                                            name: prod.name,
                                                            platform: prod.platform,
                                                            price: prod.price,
                                                            description: prod.description || '',
                                                            image: prod.image || '',
                                                            salePrice: prod.sale_price || '',
                                                            saleEndsAt: prod.sale_ends_at ? new Date(prod.sale_ends_at).toISOString().slice(0, 16) : '',
                                                            bundleItems: prod.bundle_items || '',
                                                            stock: prod.stock || '1'
                                                        });
                                                        setShowAddProduct(true);
                                                        setImportMode('manual');
                                                    }}
                                                    className="btn btn-outline"
                                                    style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(`${window.location.origin}/shop/${prod.id}`);
                                                        alert('Link Copied!');
                                                    }}
                                                    className="btn btn-outline"
                                                    style={{ flex: 1, fontSize: '0.75rem', color: '#00ff88', borderColor: 'rgba(0,255,136,0.3)', padding: '0.5rem' }}
                                                >
                                                    🔗 Link
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(prod.id)}
                                                    className="btn btn-outline"
                                                    style={{ flex: 0.5, fontSize: '0.75rem', color: '#ff4d4d', borderColor: 'rgba(255,77,77,0.3)', padding: '0.5rem' }}
                                                    title="Delete Product"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {catalog.length === 0 && <p style={{ color: '#666' }}>No products in catalog. Add one to start selling.</p>}
                            </div>

                            {showAddProduct && (
                                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(10px)', padding: '2rem' }}>
                                    <div className="glass" style={{ width: '100%', maxWidth: '900px', padding: '3rem', borderRadius: '30px', position: 'relative', border: '1px solid #00ff88', maxHeight: '90vh', overflowY: 'auto' }}>
                                        <button
                                            onClick={() => { setShowAddProduct(false); setEditingProduct(null); }}
                                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}
                                        >✕</button>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                                            <h3 style={{ margin: 0 }}>
                                                {editingProduct ? '📝 Edit Shop Product' : (importMode === 'manual' ? 'Add New Product' : 'Bulk Product Import')}
                                            </h3>
                                            {!editingProduct && (
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => setImportMode('manual')} className={`btn ${importMode === 'manual' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>Single Entry</button>
                                                    <button onClick={() => setImportMode('csv')} className={`btn ${importMode === 'csv' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem' }}>Bulk CSV</button>
                                                    <button onClick={() => setImportMode('z2u')} className={`btn ${importMode === 'z2u' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', color: '#00ff88', borderColor: '#00ff88' }}>🪄 Z2U Sync</button>
                                                    <button onClick={() => setImportMode('playerup')} className={`btn ${importMode === 'playerup' ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', color: '#00c3ff', borderColor: '#00c3ff' }}>🛒 PlayerUp Importer</button>
                                                </div>

                                            )}
                                        </div>

                                        {importMode === 'manual' ? (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '2rem' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '2rem', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                        <img src={getPlatformIcon(newProduct.platform, newProduct.image)} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                                                    </div>
                                                    <p style={{ fontSize: '0.8rem', color: '#888' }}>Icon Preview</p>
                                                </div>
                                                <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                    <div><label style={{ color: '#ccc' }}>Product Name</label><input className="input-field" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required style={{ width: '100%' }} /></div>
                                                    <div><label style={{ color: '#ccc' }}>Category / Platform</label><input className="input-field" value={newProduct.platform} onChange={e => setNewProduct({ ...newProduct, platform: e.target.value })} placeholder="e.g. Discord, Snapchat" required style={{ width: '100%' }} /></div>
                                                    <div><label style={{ color: '#ccc' }}>Price ($)</label><input type="number" className="input-field" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required style={{ width: '100%' }} /></div>

                                                    {/* Flash Sale Fields */}
                                                    <div>
                                                        <label style={{ color: '#ff4d4d', display: 'block', marginBottom: '0.5rem' }}>🔥 Sale Price ($)</label>
                                                        <input type="number" className="input-field" value={newProduct.salePrice || ''} onChange={e => setNewProduct({ ...newProduct, salePrice: e.target.value })} style={{ width: '100%', borderColor: '#ff4d4d' }} placeholder="Optional" />
                                                    </div>
                                                    <div>
                                                        <label style={{ color: '#ff4d4d', display: 'block', marginBottom: '0.5rem' }}>Sale Ends At</label>
                                                        <input type="datetime-local" className="input-field" value={newProduct.saleEndsAt || ''} onChange={e => setNewProduct({ ...newProduct, saleEndsAt: e.target.value })} style={{ width: '100%', borderColor: '#ff4d4d' }} />
                                                    </div>
                                                    <div>
                                                        <label style={{ color: '#ccc' }}>Stock Level (Manual)</label>
                                                        <input type="number" className="input-field" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} style={{ width: '100%' }} placeholder="Enter manual stock count" />
                                                        <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.3rem' }}>Overrides inventory system if set.</p>
                                                    </div>
                                                    <div><label style={{ color: '#ccc' }}>Image URL (Optional)</label><input className="input-field" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} style={{ width: '100%' }} placeholder="https://..." /></div>
                                                    <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#ccc' }}>Description</label><textarea className="input-field" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ width: '100%', height: '80px' }} /></div>

                                                    {/* Bundle Configuration */}
                                                    <div style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                                        <label style={{ color: '#00c3ff', display: 'block', marginBottom: '0.5rem' }}>📦 Bundle Configuration (Optional)</label>
                                                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                                            {/* Helper to add IDs */}
                                                            <div style={{ flex: 1, maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.5rem' }}>
                                                                {catalog.map(p => (
                                                                    <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={(newProduct.bundleItems ? JSON.parse(newProduct.bundleItems) : []).includes(p.id)}
                                                                            onChange={(e) => {
                                                                                const currentIds = newProduct.bundleItems ? JSON.parse(newProduct.bundleItems) : [];
                                                                                let newIds;
                                                                                if (e.target.checked) {
                                                                                    newIds = [...currentIds, p.id];
                                                                                } else {
                                                                                    newIds = currentIds.filter((id: number) => id !== p.id);
                                                                                }
                                                                                setNewProduct({ ...newProduct, bundleItems: JSON.stringify(newIds) });
                                                                            }}
                                                                        />
                                                                        <span style={{ fontSize: '0.8rem', color: '#ccc' }}>{p.name} (${p.price})</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <input
                                                            className="input-field"
                                                            placeholder="Selected IDs (Auto-filled)"
                                                            value={newProduct.bundleItems || ''}
                                                            readOnly
                                                            style={{ width: '100%', fontSize: '0.8rem', color: '#888' }}
                                                        />
                                                    </div>

                                                    <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                                        <button type="button" onClick={() => { setShowAddProduct(false); setEditingProduct(null); setNewProduct({ name: '', platform: 'Z2U', price: '', description: '', image: '', salePrice: '', saleEndsAt: '', bundleItems: '', stock: '100' }); }} className="btn btn-outline">Cancel</button>
                                                        <button type="submit" className="btn btn-primary">{editingProduct ? 'Save Changes' : 'Create Product'}</button>
                                                    </div>
                                                </form>
                                            </div>
                                        ) : importMode === 'z2u' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,255,136,0.05) 100%)', padding: '2rem', borderRadius: '16px', border: '1px solid #00ff88', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪄</div>
                                                    <h4 style={{ marginBottom: '1rem' }}>Express Z2U Sync</h4>
                                                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                                                        Z2U prevents automated tools from reading prices. To bypass this, simply:
                                                        <br /><br />
                                                        1. Go to your <a href="https://www.z2u.com/reddit/accounts-5-15132?seller=265820" target="_blank" style={{ color: '#00ff88' }}>Z2U Seller Page</a>
                                                        <br />
                                                        2. Press <b>Ctrl + A</b> (Select All) then <b>Ctrl + C</b> (Copy)
                                                        <br />
                                                        3. Paste everything in the box below
                                                    </p>

                                                    <textarea
                                                        className="input-field"
                                                        placeholder="Paste everything from Z2U page here..."
                                                        style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.5)', marginBottom: '1.5rem' }}
                                                        onChange={(e) => handleZ2UMagicSync(e.target.value)}
                                                    />

                                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                                        I will automatically extract all Product Titles and Prices for you.
                                                    </div>
                                                </div>
                                            </div>
                                        ) : importMode === 'playerup' ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ background: 'linear-gradient(135deg, rgba(0,195,255,0.1) 0%, rgba(0,195,255,0.05) 100%)', padding: '2rem', borderRadius: '16px', border: '1px solid #00c3ff', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
                                                    <h4 style={{ marginBottom: '1rem' }}>PlayerUp Bulk Importer</h4>
                                                    <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '2rem', maxWidth: '550px', margin: '0 auto 2rem' }}>
                                                        Import all your PlayerUp listings instantly.
                                                        <br /><br />
                                                        1. Open your <a href="https://www.playerup.com/search/28909027/?q=officialum1&o=date&c[node]=1075" target="_blank" style={{ color: '#00c3ff', fontWeight: 'bold' }}>PlayerUp Listing Page</a>
                                                        <br />
                                                        2. Select All (<b>Ctrl+A</b>) and Copy (<b>Ctrl+C</b>)
                                                        <br />
                                                        3. Paste everything in the box below
                                                    </p>

                                                    <textarea
                                                        className="input-field"
                                                        placeholder="Paste PlayerUp page content here..."
                                                        style={{ width: '100%', height: '150px', background: 'rgba(0,0,0,0.5)', marginBottom: '1.5rem', border: '1px solid rgba(0,195,255,0.3)' }}
                                                        onChange={(e) => handlePlayerUpMagicSync(e.target.value)}
                                                    />

                                                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                                                        I will scan the text and find every listing title and price for your catalog.
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <button type="button" onClick={() => setImportMode('manual')} className="btn btn-outline">Cancel</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleBulkProductImport} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div style={{ background: 'rgba(0,255,136,0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.1)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                        <p style={{ color: '#00ff88', fontSize: '1rem', margin: 0, fontWeight: 'bold' }}>1. Get Template File</p>
                                                        <a href="/catalog_template.csv" download className="btn btn-outline" style={{ color: '#00ff88', borderColor: '#00ff88', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                                            📥 Download Excel Template
                                                        </a>
                                                    </div>
                                                    <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                                        Download the template, fill it in Excel, save it, and then upload it below.
                                                    </p>

                                                    <p style={{ color: '#00ff88', fontSize: '1rem', margin: '0 0 1rem 0', fontWeight: 'bold' }}>2. Upload your Sheet</p>
                                                    <input
                                                        type="file"
                                                        accept=".csv"
                                                        onChange={handleProductFileChange}
                                                        style={{
                                                            background: 'rgba(255,255,255,0.03)',
                                                            padding: '1.5rem',
                                                            borderRadius: '10px',
                                                            border: '2px dashed rgba(0,255,136,0.3)',
                                                            width: '100%',
                                                            color: '#aaa',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                </div>

                                                <div style={{ opacity: bulkProductData ? 1 : 0.5 }}>
                                                    <label style={{ color: '#ccc', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>Preview / Manual Data (Optional)</label>
                                                    <textarea
                                                        className="input-field"
                                                        placeholder="Data from your file will appear here automatically..."
                                                        value={bulkProductData}
                                                        onChange={e => setBulkProductData(e.target.value)}
                                                        style={{ width: '100%', height: '150px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                                                    />
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                                    <button type="button" onClick={() => { setShowAddProduct(false); setBulkProductData(''); }} className="btn btn-outline">Cancel</button>
                                                    <button type="submit" className="btn btn-primary" disabled={!bulkProductData} style={{ padding: '0.8rem 2rem' }}>
                                                        ✅ Start Upload Process
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SELL TAB */}
                    {activeTab === 'sell' && (
                        <div className="FadeIn">
                            <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid #00ff88' }}>
                                <h3 style={{ marginBottom: '1.5rem', color: '#00ff88', fontSize: '1.5rem' }}>💸 Create New Sale</h3>
                                <p style={{ color: '#888', marginBottom: '1.5rem' }}>Select an item from inventory to generate a secure delivery link instantly.</p>

                                <form onSubmit={handleRecordSale} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {/* Inventory Selector */}
                                    <label style={{ color: '#ccc', marginBottom: '-1rem' }}>Select Product from Stock</label>
                                    <select
                                        className="input-field"
                                        value={newSale.inventoryId}
                                        onChange={e => {
                                            const id = e.target.value;
                                            const item = inventory.find(i => i.id === id);
                                            if (item) {
                                                setNewSale({ ...newSale, inventoryId: id, description: item.name, platform: item.platform });
                                            } else {
                                                setNewSale({ ...newSale, inventoryId: '' });
                                            }
                                        }}
                                        style={{ width: '100%', border: '1px solid #333', background: '#111', color: '#00ff88', padding: '1rem', fontSize: '1.1rem' }}
                                    >
                                        <option value="">-- Click to Choose Product --</option>
                                        {inventory.filter(i => i.status === 'In Stock').map(i => (
                                            <option key={i.id} value={i.id}>{i.platform} | {i.name} {i.purchasePrice ? `($${i.purchasePrice})` : ''}</option>
                                        ))}
                                    </select>

                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                        <div><label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>Sale Description / Order ID</label><input placeholder="Description" value={newSale.description} onChange={e => setNewSale({ ...newSale, description: e.target.value })} className="input-field" required style={{ width: '100%' }} /></div>
                                        <div><label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>Platform</label>
                                            <select value={newSale.platform} onChange={e => setNewSale({ ...newSale, platform: e.target.value })} className="input-field" style={{ width: '100%' }}>
                                                <option value="Z2U">Z2U</option>
                                                <option value="PlayerUp">PlayerUp</option>
                                                <option value="G2G">G2G</option>
                                                <option value="Direct">Direct</option>
                                            </select></div>
                                        <div><label style={{ color: '#888', display: 'block', marginBottom: '0.5rem' }}>Sale Price ($)</label><input type="number" placeholder="0.00" value={newSale.salePrice} onChange={e => setNewSale({ ...newSale, salePrice: e.target.value })} className="input-field" required style={{ width: '100%' }} /></div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                        <button type="submit" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Generate Link & Record Sale</button>
                                    </div>
                                </form>
                            </div>

                            {/* Recent Sales List */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                                <h3 style={{ marginBottom: '1.5rem' }}>Recent Manual Sales</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ padding: '1rem' }}>Item</th>
                                            <th style={{ padding: '1rem' }}>Date</th>
                                            <th style={{ padding: '1rem' }}>Amount</th>
                                            <th style={{ padding: '1rem' }}>Link / Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {balanceHistory && balanceHistory.filter((s: any) => s.deliveryToken).length > 0 ? balanceHistory.filter((s: any) => s.deliveryToken).slice(0, 10).map((sale: any) => (
                                            <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>{sale.description}</td>
                                                <td style={{ padding: '1rem', color: '#888' }}>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                                                <td style={{ padding: '1rem', color: '#00ff88', fontWeight: 'bold' }}>${Number(sale.amount).toLocaleString()}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(`${window.location.origin}/delivery/${sale.deliveryToken}`);
                                                                setCopiedId(sale.id);
                                                                setTimeout(() => setCopiedId(null), 2000);
                                                            }}
                                                            style={{
                                                                background: copiedId === sale.id ? 'rgba(0,255,136,0.3)' : 'rgba(0,255,136,0.1)',
                                                                border: '1px solid #00ff88',
                                                                color: '#00ff88',
                                                                borderRadius: '4px',
                                                                padding: '0.4rem 0.8rem',
                                                                cursor: 'pointer',
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            {copiedId === sale.id ? '✅ Copied' : '🔗 Copy Link'}
                                                        </button>
                                                        <span style={{ fontSize: '0.8rem', color: '#666' }}>Views: {sale.deliveryViews || 0}</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No manual sales recorded yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* FINANCE TAB (was Sales) */}
                    {activeTab === 'finance' && (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                {/* ROI & Profitability */}
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,215,0,0.2)', background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, transparent 100%)' }}>
                                    <h3 style={{ color: '#ffd700', marginBottom: '1rem' }}>📈 ROI & Profitability</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span style={{ color: '#ccc' }}>Net Profit</span>
                                        <span style={{ fontWeight: 'bold', color: '#00ff88', fontSize: '1.2rem' }}>$ {stats.profit.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                        <span style={{ color: '#ccc' }}>Profit Margin</span>
                                        <span style={{ fontWeight: 'bold' }}>{stats.margin.toFixed(1)}%</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '0.8rem' }}>
                                        <span style={{ color: '#ccc' }}>Asset Value (In Stock)</span>
                                        <span style={{ fontWeight: 'bold' }}>$ {stats.stockValue.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* PKR Wallet */}
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.2)' }}>
                                    <h3 style={{ color: '#00ff88', marginBottom: '1rem' }}>🇵🇰 PKR Wallets</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                                        <span style={{ color: '#ccc' }}>Meezan Bank</span>
                                        <span style={{ fontWeight: 'bold' }}>₨ {balanceHistory.filter((t: any) => t.platform === 'Meezan').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#ccc' }}>UBL / Other</span>
                                        <span style={{ fontWeight: 'bold' }}>₨ {balanceHistory.filter((t: any) => t.platform === 'UBL').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* USD Wallet */}
                                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,100,255,0.2)' }}>
                                    <h3 style={{ color: '#4dacff', marginBottom: '1rem' }}>🇺🇸 USD Accounts</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
                                        <span style={{ color: '#ccc' }}>Z2U</span>
                                        <span style={{ fontWeight: 'bold' }}>$ {balanceHistory.filter((t: any) => t.platform === 'Z2U').reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color: '#ccc' }}>PlayerUp / G2G</span>
                                        <span style={{ fontWeight: 'bold' }}>$ {balanceHistory.filter((t: any) => ['PlayerUp', 'G2G'].includes(t.platform)).reduce((sum: number, t: any) => sum + Number(t.amount || 0), 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                                {/* Monthly Profit Breakdown */}
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                                    <h3 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>📅 Monthly Net Profit</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {Object.entries(stats.monthlyProfit).sort((a, b) => b[0].localeCompare(a[0])).map(([month, val]: [string, any]) => (
                                            <div key={month} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                <span style={{ color: '#aaa', fontWeight: 'bold' }}>{new Date(month + '-01').toLocaleDateString('default', { month: 'long', year: 'numeric' })}</span>
                                                <span style={{ color: val >= 0 ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>$ {Number(val).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {Object.keys(stats.monthlyProfit).length === 0 && <p style={{ color: '#666' }}>No data yet.</p>}
                                    </div>
                                </div>

                                {/* Top Performing Accounts */}
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                                    <h3 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>💎 Profit per Product/Account</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {Object.entries(stats.productProfit).sort((a, b) => (b[1] as number) - (a[1] as number)).slice(0, 5).map(([name, val]: [string, any]) => (
                                            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                <span style={{ color: '#ddd', fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
                                                <span style={{ color: '#00ff88', fontWeight: 'bold' }}>$ {Number(val).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {Object.keys(stats.productProfit).length === 0 && <p style={{ color: '#666' }}>No data yet.</p>}
                                    </div>
                                </div>
                            </div>



                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ color: '#ffd700', margin: 0 }}>💰 Transaction History</h2>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button onClick={() => setShowAddFunds(true)} className="btn btn-primary" style={{ background: 'rgba(255,255,255,0.1)' }}>+ Add Funds</button>
                                    </div>
                                </div>

                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                        <tr>
                                            <th style={{ padding: '1rem' }}>Description</th>
                                            <th style={{ padding: '1rem' }}>Source</th>
                                            <th style={{ padding: '1rem' }}>By</th>
                                            <th style={{ padding: '1rem' }}>Date</th>
                                            <th style={{ padding: '1rem' }}>Amount</th>
                                            <th style={{ padding: '1rem' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {balanceHistory && balanceHistory.length > 0 ? balanceHistory.map((sale: any) => (
                                            <tr key={sale.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem' }}>{sale.description}</td>
                                                <td style={{ padding: '1rem' }}>{sale.platform}</td>
                                                <td style={{ padding: '1rem' }}>{sale.processedBy}</td>
                                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                                                <td style={{ padding: '1rem', color: Number(sale.amount) >= 0 ? '#00ff88' : '#ff4444', fontWeight: 'bold' }}>
                                                    {sale.currency === 'PKR' ? '₨ ' : '$ '}
                                                    {Number(sale.amount).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {sale.deliveryToken ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(`${window.location.origin}/delivery/${sale.deliveryToken}`);
                                                                    setCopiedId(sale.id);
                                                                    setTimeout(() => setCopiedId(null), 2000);
                                                                }}
                                                                style={{
                                                                    background: copiedId === sale.id ? 'rgba(0,255,136,0.3)' : 'rgba(0,255,136,0.1)',
                                                                    border: '1px solid #00ff88',
                                                                    color: '#00ff88',
                                                                    borderRadius: '4px',
                                                                    padding: '0.4rem 0.8rem',
                                                                    cursor: 'pointer',
                                                                    fontSize: '0.8rem',
                                                                    minWidth: '100px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                {copiedId === sale.id ? '✅ Copied' : '🔗 Copy Link'}
                                                            </button>
                                                            <span title={`Link Viewed ${sale.deliveryViews || 0} times`} style={{ fontSize: '0.8rem', color: '#aaa' }}>
                                                                👁️ {sale.deliveryViews || 0}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span style={{ color: '#666', fontSize: '0.8rem' }}>{sale.type === 'manual_adjustment' ? 'Adjusted' : (sale.type === 'expense' ? 'Expense' : 'Funding')}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No financial activity yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Add Funds Modal */}
                            {/* MOVED: Generate Link Modal */}


                            {showAddFunds && (
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)', marginTop: '2rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem' }}>Add / Subtract Funds</h3>
                                    <form onSubmit={handleAddFunds} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Platform / Bank</label>
                                            <select className="input-field" value={fundForm.platform} onChange={e => {
                                                const p = e.target.value;
                                                const c = (p === 'Meezan' || p === 'UBL') ? 'PKR' : 'USD';
                                                setFundForm({ ...fundForm, platform: p, currency: c });
                                            }} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                                <option value="Meezan">Meezan Bank</option>
                                                <option value="UBL">UBL</option>
                                                <option value="Z2U">Z2U</option>
                                                <option value="PlayerUp">PlayerUp</option>
                                                <option value="G2G">G2G</option>
                                                <option value="RedotPay">RedotPay</option>
                                                <option value="Direct">Cash / Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Amount ({fundForm.currency})</label>
                                            <input type="number" required className="input-field" value={fundForm.amount} onChange={e => setFundForm({ ...fundForm, amount: e.target.value })} placeholder="e.g. 5000 or -50" style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Currency</label>
                                            <select className="input-field" value={fundForm.currency} onChange={e => setFundForm({ ...fundForm, currency: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                                <option value="USD">USD ($)</option>
                                                <option value="PKR">PKR (₨)</option>
                                            </select>
                                        </div>
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Description</label>
                                            <input type="text" className="input-field" placeholder="Reason for adjustment..." value={fundForm.description} onChange={e => setFundForm({ ...fundForm, description: e.target.value })} style={{ width: '100%' }} />
                                        </div>
                                        <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                            <button type="button" onClick={() => setShowAddFunds(false)} className="btn btn-outline">Cancel</button>
                                            <button type="submit" className="btn btn-primary">Save Transaction</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}

                    {/* PROMOS TAB */}
                    {activeTab === 'promos' && (
                        <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                            <div className="glass" style={{ flex: 1, padding: '2rem', borderRadius: '16px', minWidth: '300px' }}>
                                <h2 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>Create Promo Code</h2>
                                <form onSubmit={handlePromoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <input placeholder="Code (e.g. SUMMER20)" value={promoForm.code} onChange={e => setPromoForm({ ...promoForm, code: e.target.value })} className="input-field" required style={{ textTransform: 'uppercase' }} />
                                    <input type="number" placeholder="Discount %" value={promoForm.discount} onChange={e => setPromoForm({ ...promoForm, discount: e.target.value })} className="input-field" required min="1" max="100" />
                                    <button type="submit" className="btn btn-primary">Create Code</button>
                                </form>
                            </div>
                            <div style={{ flex: 1, minWidth: '300px' }}>
                                <h2 style={{ marginBottom: '1.5rem' }}>Active Codes</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {promoCodes.length === 0 ? <p style={{ color: '#888' }}>No active codes.</p> : promoCodes.map((code: any) => (
                                        <div key={code.id} className="card" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div><h4 style={{ color: '#00ff88', fontSize: '1.2rem' }}>{code.code}</h4><div style={{ fontSize: '0.9rem', color: '#ccc' }}>{code.discount}% Off</div></div>
                                            <button onClick={() => handleDeletePromo(code.id)} style={{ background: 'red', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* WEBSITE TAB */}
                    {activeTab === 'website' && (
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Website Sub-Navigation */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                borderBottom: '1px solid #333',
                                paddingBottom: '1rem',
                                overflowX: 'auto',
                                marginBottom: '1rem'
                            }}>
                                {['blogs', 'pages', 'services', 'projects', 'rentals', 'reviews', 'messages'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setWebsiteTab(t)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            background: websiteTab === t ? '#00ff88' : 'rgba(255,255,255,0.05)',
                                            color: websiteTab === t ? '#000' : '#888',
                                            borderRadius: '6px',
                                            border: 'none',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize'
                                        }}
                                    >
                                        {t === 'blogs' ? '📝 Blogs' :
                                            t === 'pages' ? '📄 Pages' :
                                                t === 'services' ? '🛠️ Services' :
                                                    t === 'projects' ? '🚀 Projects' :
                                                        t === 'rentals' ? '🏘️ Rentals' :
                                                            t === 'reviews' ? '⭐ Reviews' :
                                                                '📬 Messages'}
                                    </button>
                                ))}
                            </div>

                            {/* 1. BLOGS */}
                            {websiteTab === 'blogs' && (
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px', border: '1px solid rgba(0,255,136,0.1)' }}>
                                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>📝</span> Publish New Blog Post
                                        </h2>
                                        <form onSubmit={handleBlogSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Blog Title</label>
                                                <input placeholder="Enter catchy title..." value={blogForm.title} onChange={e => setBlogForm({ ...blogForm, title: e.target.value })} className="input-field" required />
                                            </div>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Category</label>
                                                <input placeholder="e.g. Technology, Lifestyle" value={blogForm.category} onChange={e => setBlogForm({ ...blogForm, category: e.target.value })} className="input-field" />
                                            </div>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Feature Image URL</label>
                                                <input placeholder="https://..." value={blogForm.image} onChange={e => setBlogForm({ ...blogForm, image: e.target.value })} className="input-field" />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Short Excerpt</label>
                                                <textarea placeholder="Brief summary of the post..." value={blogForm.excerpt} onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })} className="input-field" style={{ height: '80px' }} />
                                            </div>
                                            <div style={{ gridColumn: 'span 2' }}>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Full Content (Markdown)</label>
                                                <textarea placeholder="Write your post content here..." value={blogForm.content} onChange={e => setBlogForm({ ...blogForm, content: e.target.value })} className="input-field" style={{ height: '250px' }} required />
                                            </div>
                                            <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>Publish Post</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="glass" style={{ padding: '2rem', borderRadius: '20px' }}>
                                        <h3 style={{ marginBottom: '1rem', opacity: 0.8 }}>Existing Posts ({manualBlogs.length})</h3>
                                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                                            {manualBlogs.map((b: any) => (
                                                <div key={b.id} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h4 style={{ color: '#fff' }}>{b.title}</h4>
                                                        <span style={{ fontSize: '0.8rem', color: '#00ff88' }}>{b.category || 'Uncategorized'}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                                        <button onClick={() => handleDeleteBlog(b.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Delete</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {manualBlogs.length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No blog posts found.</p>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 2. PAGES */}
                            {websiteTab === 'pages' && (
                                <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                                    <h2 style={{ color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span>📄</span> Content Management System
                                    </h2>
                                    <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '2rem' }}>
                                        {['terms', 'privacy', 'about'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => { setPageKey(p); setPageContent(pages[p] || ''); }}
                                                style={{
                                                    padding: '0.8rem 1.5rem',
                                                    borderRadius: '10px',
                                                    border: '1px solid #333',
                                                    background: pageKey === p ? '#00ff88' : 'transparent',
                                                    color: pageKey === p ? '#000' : '#888',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    flex: 1
                                                }}
                                            >
                                                {p.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <label style={{ position: 'absolute', top: '-10px', left: '15px', background: '#000', padding: '0 5px', fontSize: '0.7rem', color: '#00ff88' }}>Content Editor</label>
                                        <textarea
                                            value={pageContent}
                                            onChange={e => setPageContent(e.target.value)}
                                            className="input-field"
                                            style={{ width: '100%', height: '500px', fontFamily: 'monospace', padding: '1.5rem', lineHeight: '1.6' }}
                                            placeholder={`Start writing content for ${pageKey} page...`}
                                        />
                                    </div>
                                    <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
                                        <button onClick={handlePageSave} className="btn btn-primary" style={{ padding: '0.8rem 3rem' }}>Update {pageKey} Page</button>
                                    </div>
                                </div>
                            )}

                            {/* 3. SERVICES */}
                            {websiteTab === 'services' && (
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>🛠️</span> Add New Service
                                        </h2>
                                        <form onSubmit={handleServiceSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Service Name</label>
                                                    <input placeholder="e.g. Modern Web Design" value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} className="input-field" required />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Icon</label>
                                                    <input placeholder="Emoji" value={serviceForm.icon} onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })} className="input-field" maxLength={2} />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Short Description</label>
                                                <textarea placeholder="Tell clients what this service covers..." value={serviceForm.desc} onChange={e => setServiceForm({ ...serviceForm, desc: e.target.value })} className="input-field" style={{ height: '80px' }} />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2.5rem' }}>Add Service</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {services.map((s: any) => (
                                            <div key={s.id} className="card" style={{ padding: '1.5rem', position: 'relative', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{s.icon || '🛠️'}</div>
                                                <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#fff' }}>{s.title}</h4>
                                                <p style={{ fontSize: '0.9rem', color: '#888', lineHeight: '1.5' }}>{s.desc}</p>
                                                <button onClick={() => handleDeleteService(s.id)} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ff4444', background: 'rgba(255,0,0,0.1)', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 4. PROJECTS */}
                            {websiteTab === 'projects' && (
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>🚀 Add Portfolio Project</h2>
                                        <form onSubmit={handleProjectSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Project Name</label>
                                                <input placeholder="Project Name" value={projectForm.title} onChange={e => setProjectForm({ ...projectForm, title: e.target.value })} className="input-field" required />
                                            </div>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Description / URL</label>
                                                <textarea placeholder="Give some context or a live link..." value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="input-field" style={{ height: '80px' }} />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button type="submit" className="btn btn-primary">Add Project</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="glass" style={{ padding: '1rem', borderRadius: '15px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ textAlign: 'left', color: '#00ff88', borderBottom: '1px solid #333' }}>
                                                    <th style={{ padding: '1rem' }}>Project</th>
                                                    <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {projects.map((p: any) => (
                                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '1rem' }}>
                                                            <div style={{ fontWeight: 'bold' }}>{p.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.description}</div>
                                                        </td>
                                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                            <button onClick={() => handleDeleteProject(p.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* 5. RENTALS */}
                            {websiteTab === 'rentals' && (
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>🏘️ Add Rental Asset</h2>
                                        <form onSubmit={handleRentalSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Domain / Name</label>
                                                <input placeholder="example.com" value={rentalForm.domain} onChange={e => setRentalForm({ ...rentalForm, domain: e.target.value })} className="input-field" required />
                                            </div>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Monthly Rent Price</label>
                                                <input placeholder="$99/mo" value={rentalForm.price} onChange={e => setRentalForm({ ...rentalForm, price: e.target.value })} className="input-field" />
                                            </div>
                                            <div style={{ gridColumn: 'span 2', textAlign: 'right' }}>
                                                <button type="submit" className="btn btn-primary">Add Asset</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {rentals.map((r: any) => (
                                            <div key={r.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <div style={{ fontWeight: 'bold', color: '#fff' }}>{r.domain}</div>
                                                    <div style={{ color: '#00ff88', fontSize: '0.9rem' }}>{r.price}</div>
                                                </div>
                                                <button onClick={() => handleDeleteRental(r.id)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 6. REVIEWS */}
                            {websiteTab === 'reviews' && (
                                <div style={{ display: 'grid', gap: '2rem' }}>
                                    <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                                        <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>⭐ Add Client Feedback</h2>
                                        <form onSubmit={handleReviewSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '1rem' }}>
                                                <div>
                                                    <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Client Name</label>
                                                    <input placeholder="e.g. John Doe" value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} className="input-field" required />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Rating</label>
                                                    <select
                                                        value={reviewForm.rating}
                                                        onChange={e => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                                                        className="input-field"
                                                        style={{ color: '#00ff88', fontWeight: 'bold' }}
                                                    >
                                                        {[5, 4, 3, 2, 1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem', display: 'block' }}>Review Content</label>
                                                <textarea placeholder="What did they say about your work?" value={reviewForm.review} onChange={e => setReviewForm({ ...reviewForm, review: e.target.value })} className="input-field" style={{ height: '100px' }} required />
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 3rem' }}>Add Review</button>
                                            </div>
                                        </form>
                                    </div>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {reviews.map((r: any) => (
                                            <div key={r.id} className="glass" style={{ padding: '1.5rem', borderRadius: '15px', position: 'relative' }}>
                                                <div style={{ color: '#ffcc00', marginBottom: '0.5rem', fontSize: '1.2rem' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                                <p style={{ fontStyle: 'italic', color: '#eee', marginBottom: '1rem', lineHeight: '1.5' }}>"{r.review}"</p>
                                                <div style={{ fontWeight: 'bold' }}>- {r.name}</div>
                                                <button onClick={() => handleDeleteReview(r.id)} style={{ position: 'absolute', top: '20px', right: '20px', color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 7. MESSAGES */}
                            {websiteTab === 'messages' && (
                                <div className="glass" style={{ padding: '2.5rem', borderRadius: '20px' }}>
                                    <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>📬 Website Inquiries</h2>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {messages.length === 0 ? <p style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Your inbox is clean. No messages!</p> : messages.map((m: any) => (
                                            <div key={m.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                                    <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{m.name}</strong>
                                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(m.createdAt).toLocaleString()}</span>
                                                </div>
                                                <div style={{ color: '#00ff88', fontSize: '0.9rem', marginBottom: '1rem' }}>{m.email}</div>
                                                <div style={{ color: '#ccc', lineHeight: '1.6', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>{m.message}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LEADS TAB */}
                    {activeTab === 'leads' && (
                        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h2 style={{ color: '#00ff88' }}>All Company Leads</h2>
                                <p style={{ color: '#666' }}>Full CRM Database</p>
                            </div>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                        <th style={{ padding: '1.5rem' }}>Lead Name</th>
                                        <th style={{ padding: '1.5rem' }}>Contact</th>
                                        <th style={{ padding: '1.5rem' }}>Value</th>
                                        <th style={{ padding: '1.5rem' }}>Status</th>
                                        <th style={{ padding: '1.5rem' }}>Owner</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leads.map((lead: any) => (
                                        <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{lead.name}</td>
                                            <td style={{ padding: '1.5rem', color: '#888' }}>{lead.contact}</td>
                                            <td style={{ padding: '1.5rem' }}>${lead.value}</td>
                                            <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,100,255,0.2)' }}>{lead.status}</span></td>
                                            <td style={{ padding: '1.5rem', color: '#aaa' }}>{lead.createdBy}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* PAYMENTS TAB (New Modern Layout) */}
                    {activeTab === 'payments' && (
                        <div className="FadeIn" style={{ display: 'flex', gap: '2rem', minHeight: '600px' }}>
                            {/* Inner Sidebar for Payments */}
                            <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <h3 style={{ color: '#fff', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Payment Methods</h3>
                                {['general', 'stripe', 'cryptomus', 'binance', 'manual'].map(sub => (
                                    <button
                                        key={sub}
                                        onClick={() => setSettings({ ...settings, activePaymentTab: sub })}
                                        style={{
                                            textAlign: 'left',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            background: settings.activePaymentTab === sub ? 'rgba(0,255,136,0.1)' : 'transparent',
                                            color: settings.activePaymentTab === sub ? '#00ff88' : '#888',
                                            border: 'none',
                                            fontWeight: settings.activePaymentTab === sub ? 'bold' : 'normal',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {sub === 'general' && '⚙️ General'}
                                        {sub === 'stripe' && '💳 Stripe'}
                                        {sub === 'cryptomus' && '🟠 Cryptomus'}
                                        {sub === 'binance' && '🟡 Binance Pay'}
                                        {sub === 'manual' && '🏦 Manual / Bank'}
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            <div style={{ flex: 1 }}>
                                <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h2 style={{ color: '#00ff88', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                                        {(settings.activePaymentTab && settings.activePaymentTab !== 'general') ? settings.activePaymentTab : 'General'} Configuration
                                    </h2>
                                    <p style={{ color: '#666', marginBottom: '2rem' }}>Update your payment gateway credentials securely.</p>

                                    <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                                        {(!settings.activePaymentTab || settings.activePaymentTab === 'general') && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                {/* Global Settings */}
                                                <div style={{ gridColumn: 'span 2' }}>
                                                    <h4 style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Global Shopping Rules</h4>
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Primary Site Currency</label>
                                                    <select className="input-field" value={settings.site_currency || 'USD'} onChange={e => setSettings({ ...settings, site_currency: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                                        <option value="USD">USD ($) - International</option>
                                                        <option value="PKR">PKR (₨) - Pakistan</option>
                                                        <option value="EUR">EUR (€) - Europe</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Admin Notification Email</label>
                                                    <input className="input-field" value={settings.admin_email || ''} onChange={e => setSettings({ ...settings, admin_email: e.target.value })} placeholder="alerts@officialum1.com" style={{ width: '100%' }} />
                                                </div>
                                                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid #333' }}>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={settings.allow_guest_checkout === 'true'} onChange={e => setSettings({ ...settings, allow_guest_checkout: e.target.checked ? 'true' : 'false' })} />
                                                        Allow Guest Checkout
                                                    </label>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}>
                                                        <input type="checkbox" checked={settings.allow_wallet_payment === 'true'} onChange={e => setSettings({ ...settings, allow_wallet_payment: e.target.checked ? 'true' : 'false' })} />
                                                        Allow Wallet Payments
                                                    </label>
                                                </div>

                                                {/* VIP SaaS Configuration */}
                                                <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
                                                    <h4 style={{ color: '#ffd700', borderBottom: '1px solid #222', paddingBottom: '0.5rem', marginBottom: '1rem' }}>SaaS Membership Discounts (%)</h4>
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Silver VIP Discount</label>
                                                    <input type="number" className="input-field" value={settings.discount_silver || '5'} onChange={e => setSettings({ ...settings, discount_silver: e.target.value })} style={{ width: '100%', borderColor: '#C0C0C033' }} />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Gold VIP Discount</label>
                                                    <input type="number" className="input-field" value={settings.discount_gold || '10'} onChange={e => setSettings({ ...settings, discount_gold: e.target.value })} style={{ width: '100%', borderColor: '#FFD70033' }} />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Diamond VIP Discount</label>
                                                    <input type="number" className="input-field" value={settings.discount_diamond || '15'} onChange={e => setSettings({ ...settings, discount_diamond: e.target.value })} style={{ width: '100%', borderColor: '#B9F2FF33' }} />
                                                </div>
                                            </div>
                                        )}

                                        {settings.activePaymentTab === 'stripe' && (
                                            <>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Stripe Publishable Key</label>
                                                    <input
                                                        className="input-field"
                                                        value={settings.stripePublic || ''}
                                                        onChange={e => setSettings({ ...settings, stripePublic: e.target.value })}
                                                        placeholder="pk_test_..."
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Stripe Secret Key</label>
                                                    <input
                                                        type="password"
                                                        className="input-field"
                                                        value={settings.stripeSecret || ''}
                                                        onChange={e => setSettings({ ...settings, stripeSecret: e.target.value })}
                                                        placeholder="sk_test_..."
                                                        style={{ width: '100%' }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {settings.activePaymentTab === 'cryptomus' && (
                                            <>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Cryptomus Merchant ID</label>
                                                    <input
                                                        className="input-field"
                                                        value={settings.cryptomusId || ''}
                                                        onChange={e => setSettings({ ...settings, cryptomusId: e.target.value })}
                                                        style={{ width: '100%', borderColor: '#fdd835' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Payment API Key</label>
                                                    <input
                                                        type="password"
                                                        className="input-field"
                                                        value={settings.cryptomusKey || ''}
                                                        onChange={e => setSettings({ ...settings, cryptomusKey: e.target.value })}
                                                        style={{ width: '100%', borderColor: '#fdd835' }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {settings.activePaymentTab === 'binance' && (
                                            <>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Binance API Key</label>
                                                    <input
                                                        className="input-field"
                                                        value={settings.binanceKey || ''}
                                                        onChange={e => setSettings({ ...settings, binanceKey: e.target.value })}
                                                        style={{ width: '100%', borderColor: '#FCD535' }}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Binance Secret Key</label>
                                                    <input
                                                        type="password"
                                                        className="input-field"
                                                        value={settings.binanceSecret || ''}
                                                        onChange={e => setSettings({ ...settings, binanceSecret: e.target.value })}
                                                        style={{ width: '100%', borderColor: '#FCD535' }}
                                                    />
                                                </div>
                                            </>
                                        )}

                                        {settings.activePaymentTab === 'manual' && (
                                            <div>
                                                <label style={{ color: '#ccc', display: 'block', marginBottom: '0.5rem' }}>Bank / Manual Transfer Instructions</label>
                                                <textarea
                                                    className="input-field h-32"
                                                    value={settings.manualPaymentInstructions || ''}
                                                    onChange={e => setSettings({ ...settings, manualPaymentInstructions: e.target.value })}
                                                    placeholder="Bank Name: ... IBAN: ..."
                                                    style={{ width: '100%', minHeight: '150px' }}
                                                />
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                            <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>Calculate & Save</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB (BUYERS) */}
                    {activeTab === 'users' && (
                        <div className="FadeIn">
                            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h2 style={{ color: '#00ff88' }}>Website Buyers</h2>
                                        <p style={{ color: '#666' }}>Manage your site customers ({users.filter((u: any) => (u.role === 'buyer' || u.role === 'user')).length} Total)</p>
                                    </div>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                            <th style={{ padding: '1.5rem' }}>Buyer Info</th>
                                            <th style={{ padding: '1.5rem' }}>Status / Tier</th>
                                            <th style={{ padding: '1.5rem' }}>Spent / Points</th>
                                            <th style={{ padding: '1.5rem' }}>Wallet Balance</th>
                                            <th style={{ padding: '1.5rem' }}>Affiliate Earned</th>
                                            <th style={{ padding: '1.5rem' }}>Joined</th>
                                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.filter((u: any) => (u.role === 'buyer' || u.role === 'user')).length === 0 ? (
                                            <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No buyers found.</td></tr>
                                        ) : users.filter((u: any) => (u.role === 'buyer' || u.role === 'user')).map((u: any) => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1.5rem' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{u.email}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace' }}>ID: {u.id}</div>
                                                </td>
                                                <td style={{ padding: '1.5rem' }}>
                                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                                        <span style={{
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '0.75rem',
                                                            background: u.is_verified ? 'rgba(0,180,100,0.1)' : 'rgba(255,100,0,0.1)',
                                                            color: u.is_verified ? '#00ff88' : '#ff9900',
                                                            border: u.is_verified ? '1px solid #00ff8833' : '1px solid #ff990033'
                                                        }}>
                                                            {u.is_verified ? 'VERIFIED' : 'PENDING'}
                                                        </span>
                                                        {u.membership && u.membership !== 'none' && (
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                background: 'rgba(255,215,0,0.15)',
                                                                color: '#ffd700',
                                                                border: '1px solid #ffd70055',
                                                                fontWeight: 'bold'
                                                            }}>
                                                                ★ {u.membership.toUpperCase()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1.5rem' }}>
                                                    <div style={{ color: '#00ff88', fontWeight: 'bold' }}>${Number(u.total_spent || 0).toFixed(2)}</div>
                                                    <div style={{ fontSize: '0.82rem', color: '#888' }}>{u.points || 0} pts</div>
                                                </td>
                                                <td style={{ padding: '1.5rem' }}>
                                                    <div style={{ color: '#00ff88', fontWeight: 'bold' }}>${Number(u.wallet_balance || 0).toFixed(2)}</div>
                                                </td>
                                                <td style={{ padding: '1.5rem' }}>
                                                    <div style={{ color: '#ffd700' }}>${Number(u.affiliate_balance || 0).toFixed(2)}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#666' }}>Ref: {u.referral_code}</div>
                                                </td>
                                                <td style={{ padding: '1.5rem', color: '#666' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUser(u);
                                                                setUserForm({ email: u.email, password: '', telegram: u.telegram || '', role: u.role });
                                                                setShowUserEdit(true);
                                                            }}
                                                            className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleResendUserEmail(u.id, u.email, 'resend_registration')}
                                                            className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#ffd700', borderColor: '#ffd70033' }}
                                                        >
                                                            Verify
                                                        </button>
                                                        <button
                                                            onClick={() => handleResendUserEmail(u.id, u.email, 'resend_forgot')}
                                                            className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#00d1ff', borderColor: '#00d1ff33' }}
                                                        >
                                                            Reset
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const amount = prompt(`Adjustment amount for ${u.email} (Positive to add, Negative to subtract):`);
                                                                if (amount && !isNaN(parseFloat(amount))) {
                                                                    const res = await fetch('/api/user/wallet', {
                                                                        method: 'POST',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ userId: u.id, amount: parseFloat(amount), source: 'Admin Adjustment' })
                                                                    });
                                                                    if (res.ok) {
                                                                        alert('Wallet Updated');
                                                                        fetchData();
                                                                    } else {
                                                                        alert('Failed to update wallet');
                                                                    }
                                                                }
                                                            }}
                                                            className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '0.8rem', color: '#00ff88', borderColor: '#00ff8833' }}
                                                        >
                                                            Wallet
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm(`Delete buyer ${u.email}?`)) {
                                                                    await fetch(`/api/admin/users?id=${u.id}`, { method: 'DELETE' });
                                                                    fetchData();
                                                                }
                                                            }}
                                                            style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* USER EDIT MODAL */}
                            {showUserEdit && selectedUser && (
                                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                                    <div className="glass" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                            <h3 style={{ color: '#00ff88' }}>Edit User profile</h3>
                                            <button onClick={() => setShowUserEdit(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem' }}>✕</button>
                                        </div>
                                        <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                                                <input className="input-field" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} style={{ width: '100%' }} required />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>New Password (Leave blank to keep current)</label>
                                                <input className="input-field" type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>Telegram</label>
                                                <input className="input-field" value={userForm.telegram} onChange={e => setUserForm({ ...userForm, telegram: e.target.value })} style={{ width: '100%' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>User Role</label>
                                                <select className="input-field" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                                    <option value="buyer">Buyer / Customer</option>
                                                    <option value="seller">Seller / Partner</option>
                                                    <option value="admin">System Admin</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', display: 'block' }}>Membership Tier</label>
                                                <select className="input-field" value={selectedUser.membership || 'none'} onChange={e => setSelectedUser({ ...selectedUser, membership: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                                    <option value="none">None (Standard)</option>
                                                    <option value="silver">Silver VIP</option>
                                                    <option value="gold">Gold VIP</option>
                                                    <option value="diamond">Diamond VIP</option>
                                                </select>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', marginTop: '1rem' }}>
                                                <p style={{ color: '#888', fontSize: '0.8rem', marginBottom: '0.5rem' }}>Creation Details:</p>
                                                <div style={{ fontSize: '0.85rem', color: '#eee' }}>Joined: {new Date(selectedUser.created_at).toLocaleString()}</div>
                                                <div style={{ fontSize: '0.85rem', color: '#eee' }}>Referral Code: {selectedUser.referral_code || 'None'}</div>
                                            </div>
                                            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Update User Profile</button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUPPORT TAB */}
                    {activeTab === 'support' && (
                        <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden', padding: '2rem' }}>
                            <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Support Tickets</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {tickets.length === 0 && <p style={{ color: '#666' }}>No tickets found.</p>}
                                {tickets.map(t => (
                                    <div key={t.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem', borderLeft: t.status === 'open' ? '4px solid #00ff88' : '4px solid #555' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', alignItems: 'center' }} onClick={() => setActiveTicketId(activeTicketId === t.id ? null : t.id)}>
                                            <div>
                                                <h4 style={{ color: '#fff', marginBottom: '0.2rem' }}>{t.subject}</h4>
                                                <div style={{ fontSize: '0.8rem', color: '#888' }}>User: {t.email} (ID: {t.user_id})</div>
                                            </div>
                                            <span style={{ padding: '4px 8px', borderRadius: '4px', background: t.status === 'open' ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.1)', color: t.status === 'open' ? '#00ff88' : '#aaa', fontSize: '0.8rem' }}>{t.status.toUpperCase()}</span>
                                        </div>

                                        {activeTicketId === t.id && (
                                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                                <div style={{ background: '#000', padding: '1rem', borderRadius: '8px', color: '#ccc', marginBottom: '1rem' }}>
                                                    {t.message}
                                                </div>
                                                {/* Replies */}
                                                <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {t.replies && t.replies.map((r: any, i: number) => (
                                                        <div key={i} style={{ alignSelf: r.sender === 'admin' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                                            <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '2px', textAlign: r.sender === 'admin' ? 'right' : 'left' }}>{r.sender === 'admin' ? 'You' : 'User'}</div>
                                                            <div style={{ background: r.sender === 'admin' ? '#00ff88' : '#333', color: r.sender === 'admin' ? '#000' : '#fff', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                                                {r.message}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <input placeholder="Type a reply..." value={replyMsg} onChange={e => setReplyMsg(e.target.value)} className="input-field" style={{ flex: 1 }} />
                                                    <button onClick={() => handleReplyTicket(t.id)} className="btn btn-primary">Send Reply</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'marketing' && (
                        <>
                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {/* Marketing Sub-Navigation */}
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    borderBottom: '1px solid #333',
                                    paddingBottom: '1rem',
                                    overflowX: 'auto',
                                    marginBottom: '1rem'
                                }}>
                                    {['all', 'Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'Telegram'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setMarketingTab(p)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                background: marketingTab === p ? '#00ff88' : 'rgba(255,255,255,0.05)',
                                                color: marketingTab === p ? '#000' : '#888',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                textTransform: 'capitalize'
                                            }}
                                        >
                                            {p === 'all' ? '🌐 All Feed' : p}
                                        </button>
                                    ))}
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <h2 style={{ color: '#00ff88' }}>{marketingTab === 'all' ? 'Social Media Hub' : `${marketingTab} Feed`}</h2>
                                        <button onClick={() => setShowAddPost(true)} className="btn btn-primary">+ Draft New Post</button>
                                    </div>

                                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                                        {(marketingTab === 'all' ? posts : posts.filter((p: any) => p.platform && p.platform.includes(marketingTab))).map((post: any) => (
                                            <div key={post.id} className="glass" style={{ padding: '2rem', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#00ff88', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>
                                                            {(post.author || 'S').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 'bold', color: '#fff' }}>{post.author || 'System Admin'}</div>
                                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>{new Date(post.createdAt).toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
                                                            {post.platform}
                                                        </span>
                                                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{post.status}</span>
                                                    </div>
                                                </div>

                                                <p style={{ color: '#eee', lineHeight: '1.6', fontSize: '1.05rem', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
                                                    {post.content}
                                                </p>

                                                <div style={{ display: 'flex', gap: '0.8rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.2rem' }}>
                                                    {(post.platform && (post.platform.includes('All') || post.platform.includes('Twitter'))) && (
                                                        <a
                                                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-outline"
                                                            style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderColor: '#1DA1F2', color: '#1DA1F2' }}
                                                        >
                                                            🐦 Tweet This
                                                        </a>
                                                    )}

                                                    <button
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.85rem', padding: '0.5rem 1.2rem', borderColor: '#444' }}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(post.content);
                                                            alert('Content copied to clipboard!');
                                                        }}
                                                    >
                                                        📋 Copy Content
                                                    </button>

                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Delete this post draft?')) {
                                                                await fetch(`/api/admin/marketing?id=${post.id}`, { method: 'DELETE' });
                                                                window.location.reload();
                                                            }
                                                        }}
                                                        style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '0.85rem' }}
                                                    >
                                                        Delete Draft
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {(marketingTab === 'all' ? posts : posts.filter((p: any) => p.platform && p.platform.includes(marketingTab))).length === 0 && (
                                            <div className="glass" style={{ padding: '4rem', textAlign: 'center', opacity: 0.6 }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                                                <p>No posts found for {marketingTab}.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {showAddPost && (
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.3)', marginTop: '2rem' }}>
                                    <h3>Draft Social Post</h3>
                                    <form onSubmit={handleAddPost} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                                {['All', 'Twitter', 'Facebook', 'Instagram', 'LinkedIn', 'Telegram'].map(p => (
                                                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px', border: newPost.platforms.includes(p) ? '1px solid #00ff88' : '1px solid transparent' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={newPost.platforms.includes(p)}
                                                            onChange={e => {
                                                                const current = newPost.platforms;
                                                                if (e.target.checked) setNewPost({ ...newPost, platforms: [...current, p] });
                                                                else setNewPost({ ...newPost, platforms: current.filter(x => x !== p) });
                                                            }}
                                                        />
                                                        <span style={{ color: newPost.platforms.includes(p) ? '#00ff88' : '#ccc', fontSize: '0.9rem' }}>
                                                            {p === 'All' ? 'All (Broadcast)' : p}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <textarea placeholder="Post Content (Description, Hashtags...)" className="input-field" style={{ height: '100px' }} value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} required />
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button type="submit" className="btn btn-primary">Save Draft</button>
                                            <button type="button" onClick={() => setShowAddPost(false)} className="btn btn-outline">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </>
                    )}
                    {/* TOOLS TAB (New) */}
                    {activeTab === 'tools' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                            {/* Backlink Service */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0,255,136,0.2)' }}>
                                <h2 style={{ color: '#00ff88', marginBottom: '1rem' }}>🔗 Backlink Authority Checker</h2>
                                <p style={{ color: '#888', marginBottom: '1.5rem' }}>Check DA/PA metrics for any domain using Moz API.</p>
                                <form onSubmit={handleBacklinkCheck} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <input placeholder="https://example.com" value={toolUrl} onChange={e => setToolUrl(e.target.value)} className="input-field" style={{ flex: 1 }} required />
                                    <button type="submit" className="btn btn-primary" disabled={toolLoading}>{toolLoading ? 'Scanning...' : 'Check'}</button>
                                </form>
                                {toolMetrics && (
                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '1rem' }}>
                                            <div><div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{toolMetrics.da}</div><div style={{ color: '#888', fontSize: '0.8rem' }}>Domain Auth</div></div>
                                            <div><div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{toolMetrics.pa}</div><div style={{ color: '#888', fontSize: '0.8rem' }}>Page Auth</div></div>
                                            <div><div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{toolMetrics.links}</div><div style={{ color: '#888', fontSize: '0.8rem' }}>Backlinks</div></div>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                            <strong>Analysis:</strong>
                                            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem' }}>
                                                {toolMetrics.details?.map((d: string, i: number) => <li key={i}>{d}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* AI Writer */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(138, 56, 255, 0.2)' }}>
                                <h2 style={{ color: '#ae68ff', marginBottom: '1rem' }}>✨ AI Content Generator</h2>
                                <p style={{ color: '#888', marginBottom: '1.5rem' }}>Generate SEO-optimized blog posts instantly.</p>
                                <form onSubmit={handleGenerateBlog} style={{ display: 'flex', gap: '1rem' }}>
                                    <input placeholder="Topic (e.g. Best Game Accounts)" value={blogTopic} onChange={e => setBlogTopic(e.target.value)} className="input-field" style={{ flex: 1 }} required />
                                    <button type="submit" className="btn btn-outline" style={{ color: '#ae68ff', borderColor: '#ae68ff' }} disabled={blogLoading}>{blogLoading ? 'Writing...' : 'Generate'}</button>
                                </form>
                            </div>

                            {/* Telegram Bot Setup */}
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px', border: '1px solid rgba(0, 136, 204, 0.2)' }}>
                                <h2 style={{ color: '#0088cc', marginBottom: '1rem' }}>🤖 Telegram Bot</h2>
                                <p style={{ color: '#888', marginBottom: '1.5rem' }}>Configure your bot for order notifications.</p>
                                <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#aaa' }}>Bot Token</label>
                                        <input type="password" value={settings.telegram_bot_token || settings.telegramToken || ''} onChange={e => setSettings({ ...settings, telegram_bot_token: e.target.value })} className="input-field" style={{ width: '100%' }} placeholder="1234:ABC..." />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#aaa' }}>Chat ID</label>
                                        <input type="text" value={settings.telegram_chat_id || settings.telegramChatId || ''} onChange={e => setSettings({ ...settings, telegram_chat_id: e.target.value })} className="input-field" style={{ width: '100%' }} placeholder="@channel" />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Save Configuration</button>
                                </form>
                            </div>

                        </div>
                    )}

                    {/* HR TAB */}
                    {activeTab === 'hr' && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ color: '#00ff88' }}>Administrative Staff & Admins</h2>
                                <button onClick={() => { setShowAddStaff(!showAddStaff); if (!showAddStaff) setEditingEmp(null); }} className="btn btn-primary">{showAddStaff ? 'Cancel' : '+ Add Staff'}</button>
                            </div>

                            {showAddStaff && (
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(0,255,136,0.2)' }}>
                                    <h3 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>{editingEmp ? 'Edit Staff Member' : 'Add New Staff Member'}</h3>
                                    <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Full Name</label><input type="text" required className="input-field" value={newEmp.name} onChange={e => setNewEmp({ ...newEmp, name: e.target.value })} style={{ width: '100%' }} /></div>
                                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Email Address</label><input type="email" required disabled={!!editingEmp} className="input-field" value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} style={{ width: '100%', opacity: editingEmp ? 0.6 : 1 }} /></div>
                                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Password {editingEmp && '(Leave empty to keep current)'}</label><input type="text" required={!editingEmp} className="input-field" value={newEmp.password} onChange={e => setNewEmp({ ...newEmp, password: e.target.value })} style={{ width: '100%' }} /></div>
                                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Position</label><input type="text" required className="input-field" value={newEmp.position} onChange={e => setNewEmp({ ...newEmp, position: e.target.value })} style={{ width: '100%' }} /></div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Department</label>
                                            <select className="input-field" value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                                <option value="" style={{ background: '#111' }}>Select Department</option>
                                                <option value="Development" style={{ background: '#111' }}>Development</option>
                                                <option value="Design" style={{ background: '#111' }}>Design</option>
                                                <option value="Marketing" style={{ background: '#111' }}>Marketing</option>
                                                <option value="Sales" style={{ background: '#111' }}>Sales</option>
                                                <option value="Support" style={{ background: '#111' }}>Support</option>
                                                <option value="Management" style={{ background: '#111' }}>Management</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Compensation Type</label>
                                            <select className="input-field" value={newEmp.compensationType} onChange={e => setNewEmp({ ...newEmp, compensationType: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333' }}>
                                                <option value="Fixed" style={{ background: '#111' }}>Fixed Salary</option>
                                                <option value="Commission" style={{ background: '#111' }}>Commission Based</option>
                                            </select>
                                        </div>

                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '1rem', color: '#00ff88', fontWeight: 'bold' }}>Access Permissions</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #222' }}>
                                                {[
                                                    { id: 'orders', label: '📦 Orders' },
                                                    { id: 'inventory', label: '📊 Stock' },
                                                    { id: 'website', label: '🌐 Website' },
                                                    { id: 'sales', label: '💸 Sales' },
                                                    { id: 'finance', label: '💰 Finance' },
                                                    { id: 'leads', label: '👥 Leads' },
                                                    { id: 'users', label: '👤 Buyers' },
                                                    { id: 'support', label: '🎫 Support' },
                                                    { id: 'marketing', label: '📢 Marketing' },
                                                    { id: 'tools', label: '🛠️ Tools' },
                                                    { id: 'hr', label: '👔 HR/Staff' },
                                                    { id: 'settings', label: '⚙️ Settings' }
                                                ].map(p => (
                                                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer', color: newEmp.permissions.includes(p.id) ? '#fff' : '#666' }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={newEmp.permissions.includes(p.id)}
                                                            onChange={e => {
                                                                const perms = e.target.checked
                                                                    ? [...newEmp.permissions, p.id]
                                                                    : newEmp.permissions.filter(x => x !== p.id);
                                                                setNewEmp({ ...newEmp, permissions: perms });
                                                            }}
                                                            style={{ width: '18px', height: '18px', accentColor: '#00ff88' }}
                                                        />
                                                        {p.label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: 'span 2' }}>
                                            {newEmp.compensationType === 'Fixed' ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Monthly Salary ($)</label>
                                                    <input type="number" required className="input-field" value={newEmp.salary} onChange={e => setNewEmp({ ...newEmp, salary: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Commission Rate (%)</label>
                                                    <input type="number" required className="input-field" value={newEmp.commissionRate} onChange={e => setNewEmp({ ...newEmp, commissionRate: e.target.value })} style={{ width: '100%' }} />
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ gridColumn: 'span 2' }}>
                                            <label style={{ display: 'block', marginBottom: '0.8rem', color: '#ccc' }}>Platform Access</label>
                                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                                {['Z2U', 'PlayerUp', 'G2G', 'Direct'].map(platform => (
                                                    <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                                        <input type="checkbox" checked={newEmp.allowedPlatforms.includes(platform)} onChange={e => { const current = newEmp.allowedPlatforms; if (e.target.checked) setNewEmp({ ...newEmp, allowedPlatforms: [...current, platform] }); else setNewEmp({ ...newEmp, allowedPlatforms: current.filter(p => p !== platform) }); }} />
                                                        {platform}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                            <button type="submit" className="btn btn-primary" style={{ width: '200px' }}>{editingEmp ? 'Save Changes' : 'Create Staff Account'}</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="glass" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                            <th style={{ padding: '1.5rem' }}>Name / Email</th>
                                            <th style={{ padding: '1.5rem' }}>Role</th>
                                            <th style={{ padding: '1.5rem' }}>Department</th>
                                            <th style={{ padding: '1.5rem' }}>Compensation</th>
                                            <th style={{ padding: '1.5rem' }}>Status</th>
                                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Internal Admins from Users Table */}
                                        {users.filter(u => u.role === 'admin').map((u: any) => (
                                            <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,255,136,0.02)' }}>
                                                <td style={{ padding: '1.5rem' }}><div style={{ fontWeight: 'bold' }}>System Admin</div><div style={{ fontSize: '0.85rem', color: '#888' }}>{u.email}</div></td>
                                                <td style={{ padding: '1.5rem' }}>Management / Owner</td>
                                                <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', background: 'rgba(0,180,100,0.1)', color: '#00ff88' }}>Core Admin</span></td>
                                                <td style={{ padding: '1.5rem' }}>${Number(u.wallet_balance || 0).toFixed(2)}</td>
                                                <td style={{ padding: '1.5rem' }}><span style={{ color: '#00ff88' }}>• ACTIVE</span></td>
                                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUser(u);
                                                            setUserForm({ email: u.email, password: '', telegram: u.telegram || '', role: u.role });
                                                            setShowUserEdit(true);
                                                        }}
                                                        className="btn btn-outline"
                                                        style={{ fontSize: '0.8rem', borderColor: '#4dacff', color: '#4dacff' }}
                                                    >
                                                        Edit Admin
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {/* Staff from Employees Table */}
                                        {employees.map((emp: any) => (
                                            <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1.5rem' }}><div style={{ fontWeight: 'bold' }}>{emp.name}</div><div style={{ fontSize: '0.85rem', color: '#888' }}>{emp.email}</div></td>
                                                <td style={{ padding: '1.5rem' }}>{emp.position}</td>
                                                <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', background: 'rgba(0,100,255,0.2)', color: '#4dacff' }}>{emp.department}</span></td>
                                                <td style={{ padding: '1.5rem' }}>{emp.compensationType === 'Commission' ? <span style={{ color: '#ffd700' }}>{emp.commissionRate}% Commission</span> : <span>${Number(emp.salary).toLocaleString()} /mo</span>}</td>
                                                <td style={{ padding: '1.5rem' }}><span style={{ color: emp.status === 'Active' ? '#00ff88' : '#ff4444' }}>• {emp.status}</span></td>
                                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => {
                                                                setEditingEmp(emp);
                                                                setNewEmp({
                                                                    name: emp.name,
                                                                    email: emp.email,
                                                                    password: '', // Hidden
                                                                    position: emp.position,
                                                                    department: emp.department,
                                                                    salary: emp.salary,
                                                                    commissionRate: emp.commissionRate,
                                                                    compensationType: emp.compensationType,
                                                                    allowedPlatforms: emp.allowedPlatforms || [],
                                                                    permissions: Array.isArray(emp.permissions) ? emp.permissions : (emp.permissions ? JSON.parse(emp.permissions) : [])
                                                                });
                                                                setShowAddStaff(true);
                                                            }}
                                                            className="btn btn-outline"
                                                            style={{ fontSize: '0.8rem', borderColor: '#4dacff', color: '#4dacff' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const newStatus = emp.status === 'Active' ? 'Suspended' : 'Active';
                                                                if (confirm(`Change status of ${emp.name} to ${newStatus}?`)) {
                                                                    await fetch('/api/hr/employees', {
                                                                        method: 'PATCH',
                                                                        headers: { 'Content-Type': 'application/json' },
                                                                        body: JSON.stringify({ id: emp.id, status: newStatus })
                                                                    });
                                                                    fetchData();
                                                                }
                                                            }}
                                                            className="btn btn-outline"
                                                            style={{ fontSize: '0.8rem', borderColor: emp.status === 'Active' ? '#ffaa00' : '#00ff88', color: emp.status === 'Active' ? '#ffaa00' : '#00ff88' }}
                                                        >
                                                            {emp.status === 'Active' ? 'Suspend' : 'Activate'}
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm(`Terminate and delete staff account for ${emp.name}? This cannot be undone.`)) {
                                                                    await fetch(`/api/hr/employees?id=${emp.id}`, { method: 'DELETE' });
                                                                    fetchData();
                                                                }
                                                            }}
                                                            style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer', fontSize: '1.2rem' }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {(employees.length === 0 && users.filter(u => u.role === 'admin').length === 0) && <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No administrative accounts found.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )
                    }

                    {/* KB TAB */}
                    {activeTab === 'kb' && (
                        <div className="FadeIn">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ color: '#00ff88' }}>📚 Knowledge Base & FAQ</h2>
                                <button onClick={() => setShowAddKb(!showAddKb)} className="btn btn-primary">{showAddKb ? 'Cancel' : '+ Add Article'}</button>
                            </div>

                            {showAddKb && (
                                <div className="glass" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(0,255,136,0.2)' }}>
                                    <h3 style={{ marginBottom: '1.5rem', color: '#00ff88' }}>Create New Article</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        await fetch('/api/kb', { method: 'POST', body: JSON.stringify({ ...kbForm, action: 'create' }) });
                                        setShowAddKb(false);
                                        fetchData();
                                    }} style={{ display: 'grid', gap: '1.5rem' }}>
                                        <div><label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Article Title</label><input type="text" required className="input-field" value={kbForm.title} onChange={e => setKbForm({ ...kbForm, title: e.target.value })} style={{ width: '100%' }} /></div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Category</label>
                                            <select className="input-field" value={kbForm.category} onChange={e => setKbForm({ ...kbForm, category: e.target.value })} style={{ width: '100%', background: '#111', color: '#fff' }}>
                                                <option value="General">General</option>
                                                <option value="Accounts">Accounts</option>
                                                <option value="Payments">Payments</option>
                                                <option value="Security">Security</option>
                                                <option value="Affiliate">Affiliate</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Content (Markdown Supported)</label>
                                            <textarea required className="input-field" value={kbForm.content} onChange={e => setKbForm({ ...kbForm, content: e.target.value })} style={{ width: '100%', height: '300px', fontFamily: 'monospace' }} />
                                        </div>
                                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                            <button type="submit" className="btn btn-primary">Publish Article</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <tr style={{ textAlign: 'left' }}>
                                            <th style={{ padding: '1.5rem' }}>Title</th>
                                            <th style={{ padding: '1.5rem' }}>Category</th>
                                            <th style={{ padding: '1.5rem' }}>Views</th>
                                            <th style={{ padding: '1.5rem' }}>Status</th>
                                            <th style={{ padding: '1.5rem' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kbArticles.map((kb: any) => (
                                            <tr key={kb.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1.5rem', fontWeight: 'bold' }}>{kb.title}</td>
                                                <td style={{ padding: '1.5rem' }}><span style={{ padding: '4px 10px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', fontSize: '0.8rem' }}>{kb.category}</span></td>
                                                <td style={{ padding: '1.5rem' }}>{kb.views || 0}</td>
                                                <td style={{ padding: '1.5rem' }}><span style={{ color: kb.is_published ? '#00ff88' : '#888' }}>{kb.is_published ? 'Published' : 'Draft'}</span></td>
                                                <td style={{ padding: '1.5rem' }}>
                                                    <button onClick={async () => { if (confirm('Delete?')) { await fetch('/api/kb', { method: 'DELETE', body: JSON.stringify({ id: kb.id }) }); fetchData(); } }} className="btn btn-outline" style={{ color: '#ff4444', borderColor: '#444', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {kbArticles.length === 0 && <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No articles found. Create your first guide!</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* LOGS TAB */}
                    {
                        activeTab === 'logs' && (
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
                                <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Security & Activity Logs</h2>
                                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#eee' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                            <th style={{ padding: '1rem' }}>Time</th>
                                            <th style={{ padding: '1rem' }}>User</th>
                                            <th style={{ padding: '1rem' }}>Action</th>
                                            <th style={{ padding: '1rem' }}>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs && logs.length > 0 ? logs.map((log: any) => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', color: '#888', fontSize: '0.85rem' }}>{log.date ? new Date(log.date).toLocaleString() : 'N/A'}</td>
                                                <td style={{ padding: '1rem' }}>{log.user}</td>
                                                <td style={{ padding: '1rem' }}><span style={{ color: '#00ff88', background: 'rgba(0,255,136,0.1)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{log.action}</span></td>
                                                <td style={{ padding: '1rem', color: '#ccc' }}>{log.details}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No logs recorded yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }

                    {/* SETTINGS TAB */}
                    {
                        activeTab === 'settings' && (
                            <div className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>

                                <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>Admin Security</h2>
                                <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '2rem' }}>
                                    <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Change Admin Credentials</h3>
                                    <form onSubmit={handleUpdateAdminProfile} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) auto', alignItems: 'end' }}>
                                        <div>
                                            <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>New Email (Optional)</label>
                                            <input type="email" name="email" placeholder="admin@example.com" className="input-field" style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <label style={{ color: '#aaa', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>New Password</label>
                                            <input type="password" name="password" placeholder="New Password" className="input-field" style={{ width: '100%' }} />
                                        </div>
                                        <div>
                                            <button type="submit" className="btn btn-primary" style={{ height: '42px' }}>Update Profile</button>
                                        </div>
                                    </form>
                                </div>

                                <h2 style={{ color: '#00ff88', marginBottom: '1.5rem' }}>API Integrations</h2>
                                <p style={{ color: '#888', marginBottom: '2rem' }}>Connect your social accounts to enable auto-posting. API Keys are stored securely.</p>

                                <form onSubmit={handleSaveSettings} style={{ display: 'grid', gap: '2rem' }}>
                                    {/* Twitter */}
                                    <div style={{ padding: '1.5rem', background: 'rgba(29, 161, 242, 0.1)', borderRadius: '12px' }}>
                                        <h3 style={{ color: '#1DA1F2', marginBottom: '1rem' }}>Twitter / X</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>API Key</label><input type="password" value={settings.twitter_api_key || ''} onChange={e => setSettings({ ...settings, twitter_api_key: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>API Secret</label><input type="password" value={settings.twitter_api_secret || ''} onChange={e => setSettings({ ...settings, twitter_api_secret: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Token</label><input type="password" value={settings.twitter_access_token || ''} onChange={e => setSettings({ ...settings, twitter_access_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Secret</label><input type="password" value={settings.twitter_access_secret || ''} onChange={e => setSettings({ ...settings, twitter_access_secret: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                        </div>
                                    </div>

                                    {/* Facebook */}
                                    <div style={{ padding: '1.5rem', background: 'rgba(24, 119, 242, 0.1)', borderRadius: '12px' }}>
                                        <h3 style={{ color: '#1877F2', marginBottom: '1rem' }}>Facebook Page</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Page ID</label><input type="text" value={settings.facebook_page_id || ''} onChange={e => setSettings({ ...settings, facebook_page_id: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Page Access Token</label><input type="password" value={settings.facebook_page_token || ''} onChange={e => setSettings({ ...settings, facebook_page_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                        </div>
                                    </div>

                                    {/* LinkedIn */}
                                    <div style={{ padding: '1.5rem', background: 'rgba(0, 119, 181, 0.1)', borderRadius: '12px' }}>
                                        <h3 style={{ color: '#0077b5', marginBottom: '1rem' }}>LinkedIn</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Person URN</label><input type="text" value={settings.linkedin_person_urn || ''} onChange={e => setSettings({ ...settings, linkedin_person_urn: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Access Token</label><input type="password" value={settings.linkedin_access_token || ''} onChange={e => setSettings({ ...settings, linkedin_access_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                        </div>
                                    </div>

                                    {/* Telegram */}
                                    <div style={{ padding: '1.5rem', background: 'rgba(0, 136, 204, 0.1)', borderRadius: '12px' }}>
                                        <h3 style={{ color: '#0088cc', marginBottom: '1rem' }}>Telegram Channel</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Bot Token</label><input type="password" value={settings.telegram_bot_token || ''} onChange={e => setSettings({ ...settings, telegram_bot_token: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Chat ID (e.g. @channelname)</label><input type="text" value={settings.telegram_chat_id || ''} onChange={e => setSettings({ ...settings, telegram_chat_id: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                        </div>
                                    </div>

                                    {/* Instagram */}
                                    <div style={{ padding: '1.5rem', background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', borderRadius: '12px' }}>
                                        <h3 style={{ color: '#fff', marginBottom: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Instagram Business</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                            <div><label style={{ display: 'block', fontSize: '0.8rem', color: '#eee' }}>IG User ID (Linked to FB Page)</label><input type="text" value={settings.instagram_user_id || ''} onChange={e => setSettings({ ...settings, instagram_user_id: e.target.value })} className="input-field" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#fff' }} /></div>
                                        </div>
                                    </div>

                                    {/* Referral System */}
                                    <div style={{ padding: '1.5rem', background: 'rgba(255, 215, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 215, 0, 0.1)' }}>
                                        <h3 style={{ color: '#ffd700', marginBottom: '1rem' }}>Referral & Affiliate System</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa' }}>Global Commission Rate (%)</label>
                                                <input
                                                    type="number"
                                                    placeholder="10"
                                                    value={settings.referral_commission_rate || ''}
                                                    onChange={e => setSettings({ ...settings, referral_commission_rate: e.target.value })}
                                                    className="input-field"
                                                    style={{ width: '100%' }}
                                                />
                                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>Percentage earch user gets from their referral's successful purchases.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RESTORED: Other Services */}
                                    <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                                        <h3 style={{ marginBottom: '1rem', color: '#fff' }}>External Services</h3>
                                        <div style={{ display: 'grid', gap: '1rem' }}>
                                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Moz Access ID (SEO)</label><input value={settings.mozId || ''} onChange={e => setSettings({ ...settings, mozId: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Moz Secret Key</label><input type="password" value={settings.mozKey || ''} onChange={e => setSettings({ ...settings, mozKey: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>

                                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Gemini API Key (AI Blog)</label><input type="password" value={settings.geminiKey || ''} onChange={e => setSettings({ ...settings, geminiKey: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>OpenAI API Key (AI Blog Backup)</label><input type="password" value={settings.openaiKey || ''} onChange={e => setSettings({ ...settings, openaiKey: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>

                                            <h4 style={{ color: '#aaa', marginTop: '1rem' }}>SMTP Email Server</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Host</label><input value={settings.smtpHost || ''} onChange={e => setSettings({ ...settings, smtpHost: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                                <div><label style={{ color: '#aaa', fontSize: '0.8rem' }}>User</label><input value={settings.smtpUser || ''} onChange={e => setSettings({ ...settings, smtpUser: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                                <div style={{ gridColumn: 'span 2' }}><label style={{ color: '#aaa', fontSize: '0.8rem' }}>Password</label><input type="password" value={settings.smtpPass || ''} onChange={e => setSettings({ ...settings, smtpPass: e.target.value })} className="input-field" style={{ width: '100%' }} /></div>
                                            </div>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>💾 Save Configuration</button>
                                </form>

                                {/* DANGER ZONE */}
                                <div style={{ marginTop: '3rem', padding: '2rem', border: '1px solid #ff4444', borderRadius: '16px', background: 'rgba(255, 68, 68, 0.05)' }}>
                                    <h3 style={{ color: '#ff4444', marginBottom: '1rem' }}>Danger Zone</h3>
                                    <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>This action will wipe all inventory, sales history, and social posts. It cannot be undone.</p>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            if (confirm('⚠️ ARE YOU SURE? This will DELETE ALL DATA forever.')) {
                                                if (confirm('Really? Click OK to confirm wiping your entire database.')) {
                                                    await fetch('/api/admin/reset', { method: 'POST' });
                                                    alert('System Reset Complete.');
                                                    window.location.reload();
                                                }
                                            }
                                        }}
                                        className="btn"
                                        style={{ background: '#ff4444', color: '#fff', border: 'none', padding: '1rem 2rem', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        🗑️ RESET SYSTEM / CLEAR ALL DATA
                                    </button>
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >

            {showBulkUpdateModal && (
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
            )}
            <Footer />
        </main >
    );
}
