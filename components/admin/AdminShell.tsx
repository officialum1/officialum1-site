"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Store, Database, Package, Boxes, Star,
  TrendingUp, Users, UserCheck, UserPlus, ShieldCheck, HelpCircle, 
  Globe, Megaphone, Brain, Wrench, Rocket, 
  LineChart, CreditCard, Briefcase, FileText, Settings, 
  Search, Bell, RefreshCw, LogOut, Percent, BookOpen,
  Activity, Layout, CloudLightning, Gamepad2, ShoppingBag,
  Mail, FileEdit, Receipt, Sparkles
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "OVERVIEW & ANALYTICS",
    items: [
      { id: "sell", label: "Sales & Revenue", href: "/admin/sell", icon: TrendingUp },
      { id: "live_traffic", label: "Live Traffic", href: "/admin/live_traffic", icon: Activity },
      { id: "logs", label: "System Activity", href: "/admin/logs", icon: FileText },
    ]
  },
  {
    label: "STORE & CLIENT ORDERS",
    items: [
      { id: "orders", label: "Orders & Deliveries", href: "/admin/orders", icon: Package },
      { id: "catalog", label: "Services & Catalog", href: "/admin/catalog", icon: Store },
      { id: "stock", label: "Inventory Stock", href: "/admin/stock", icon: Database },
      { id: "bundles", label: "Service Bundles", href: "/admin/bundles", icon: Boxes },
      { id: "coupons", label: "Promo Codes", href: "/admin/coupons", icon: Percent },
    ]
  },
  {
    label: "CLIENT CRM & SUPPORT",
    items: [
      { id: "leads", label: "Inbound Leads", href: "/admin/leads", icon: Users },
      { id: "support", label: "Support Inbox", href: "/admin/support", icon: HelpCircle },
      { id: "reviews_hub", label: "Reviews & Ratings", href: "/admin/reviews_hub", icon: Star },
      { id: "verification", label: "KYC Verifications", href: "/admin/verification", icon: ShieldCheck },
    ]
  },
  {
    label: "MARKETING & SOCIAL HUB",
    items: [
      { id: "marketing", label: "Social Media Hub", href: "/admin/marketing", icon: Megaphone },
      { id: "newsletter", label: "Newsletter Broadcast", href: "/admin/newsletter", icon: Mail },
      { id: "intel", label: "Market Intelligence", href: "/admin/intel", icon: Brain },
    ]
  },
  {
    label: "WEBSITE & SEO ENGINE",
    items: [
      { id: "rankmath", label: "Rank Math & Knowledge Panel", href: "/admin/rankmath", icon: Sparkles },
      { id: "indexing", label: "1-Click Google Indexing", href: "/admin/indexing", icon: Rocket },
      { id: "blogs", label: "AI Blogs Manager", href: "/admin/blogs", icon: FileEdit },
      { id: "kb", label: "Knowledge Base", href: "/admin/kb", icon: BookOpen },
      { id: "documents", label: "Pages & Legal Documents", href: "/admin/documents", icon: FileText },
    ]
  },
  {
    label: "FINANCE & ADMINISTRATION",
    items: [
      { id: "finance", label: "Wallets & Accounts", href: "/admin/finance", icon: LineChart },
      { id: "payouts", label: "Payout Requests", href: "/admin/payouts", icon: Receipt },
      { id: "buyers", label: "User Database", href: "/admin/buyers", icon: UserCheck },
      { id: "hr", label: "Staff & Permissions", href: "/admin/hr", icon: Briefcase },
      { id: "settings", label: "System API Keys", href: "/admin/settings", icon: Settings },
    ]
  }
];

export function AdminShell({
  title,
  subtitle,
  children,
  hideSidebar = false,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  hideSidebar?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = React.useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [permissions, setPermissions] = React.useState<string[]>([]);

  React.useEffect(() => {
    const rawUser = localStorage.getItem('buyer_user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        setUserData(parsed);
        
        // Pull user permissions
        const perms = parsed.permissions 
          ? (typeof parsed.permissions === 'string' ? JSON.parse(parsed.permissions) : parsed.permissions) 
          : ((parsed.role || '').toLowerCase() === 'admin' ? ['all'] : []);
        setPermissions(perms);
      } catch (e) {}
    }
  }, []);

  const hasPermission = (tabId: string) => {
    if (permissions.includes('all')) return true;
    return permissions.includes(tabId);
  };

  const handleLogout = () => {
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    localStorage.removeItem('buyer_user');
    router.push('/admin/login');
  };

  const handleSync = async () => {
    setIsSyncing(true);
    // Broadcast global sync event to trigger caching resets in current dynamic view
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('OFFICIALUM1_SYNC_TRIGGER'));
    }
    await new Promise(r => setTimeout(r, 1200));
    setIsSyncing(false);
  };

  const userName = userData?.name || userData?.email?.split('@')[0] || "Admin";
  const userInitial = userName.charAt(0).toUpperCase();
  const userRole = (userData?.role || "Admin").toUpperCase();

  return (
    <div className="flex min-h-screen" style={{ background: '#F6F7F3', color: '#182026' }}>
      
      {/* SIDEBAR */}
      {!hideSidebar && (
        <aside style={{
          width: '268px',
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          background: '#FFFFFF',
          borderRight: '1px solid #DDE7E4',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 50
        }}>
          {/* Logo Section */}
          <div style={{
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            padding: '0 20px',
            borderBottom: '1px solid #DDE7E4',
            flexShrink: 0
          }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#182026', letterSpacing: '-0.2px' }}>
              OfficialUM1
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: 800,
              background: '#E6F3F1',
              color: '#146C78',
              padding: '2px 6px',
              borderRadius: '4px',
              marginLeft: '8px',
              letterSpacing: '0.5px'
            }}>
              ADMIN
            </span>
          </div>

          {/* Nav Groups Scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 0' }}>
            {NAV_GROUPS.map((group) => {
              // Filter permitted items
              const items = group.items.filter(item => hasPermission(item.id));
              if (items.length === 0) return null;

              return (
                <div key={group.label} style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    color: '#80929A',
                    padding: '12px 16px 6px',
                  }}>
                    {group.label}
                  </div>
                  <div>
                    {items.map((item) => {
                      const Icon = item.icon;
                      // Exact active check or sub-route active check
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                      return (
                        <Link key={item.id} href={item.href} style={{ textDecoration: 'none' }}>
                          <div style={{
                            height: '38px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            margin: '1px 8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '13.5px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? '#146C78' : '#4F5F67',
                            background: isActive ? '#E6F3F1' : 'transparent',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          className={isActive ? "" : "hover:bg-[#F8FAF8] hover:text-[#182026]"}
                          >
                            <Icon size={16} style={{ opacity: isActive ? 1 : 0.7 }} />
                            <span>{item.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Auth Section */}
          <div style={{
            borderTop: '1px solid #DDE7E4',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#146C78',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '13px',
                fontWeight: 700,
                flexShrink: 0
              }}>
                {userInitial}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#182026',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {userName}
                </span>
                <span style={{
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#647680'
                }}>
                  {userRole}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              style={{
                border: 'none',
                background: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: '#80929A',
                transition: 'color 0.15s'
              }}
              className="hover:text-[#C0392B]"
              title="Log out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* MAIN FRAME */}
      <div style={{
        flex: 1,
        marginLeft: hideSidebar ? 0 : '268px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        
        {/* TOPBAR */}
        <header style={{
          minHeight: '64px',
          position: 'fixed',
          top: 0,
          right: 0,
          left: hideSidebar ? 0 : '268px',
          background: '#FFFFFF',
          borderBottom: '1px solid #DDE7E4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          zIndex: 40
        }}>
          {/* Title Segment */}
          <div style={{ display: 'grid', gap: '2px', minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#182026' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#647680', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {subtitle}
              </div>
            )}
          </div>

          {/* Utilities Block */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#80929A' }} />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '180px',
                  height: '32px',
                  background: '#F8FAF8',
                  border: '1px solid #DDE7E4',
                  borderRadius: '6px',
                  fontSize: '12px',
                  padding: '0 10px 0 30px',
                  color: '#182026',
                  outline: 'none'
                }}
                className="focus:border-[#146C78] focus:bg-white transition-all"
              />
            </div>

            {/* Notification bell */}
            <button style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#FFFFFF',
              border: '1px solid #DDE7E4',
              borderRadius: '6px',
              color: '#52636B',
              cursor: 'pointer'
            }}
            className="hover:bg-[#F8FAF8]"
            >
              <Bell size={15} />
            </button>

            {/* Sync Hub */}
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              style={{
                height: '32px',
                padding: '0 12px',
                background: '#FFFFFF',
                border: '1px solid #DDE7E4',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                color: '#182026',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              className="hover:bg-[#F8FAF8] active:bg-[#EEF5F3] disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
              Sync Hub
            </button>

            {/* Network Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#E6F3F1',
              color: '#146C78',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '20px',
              padding: '4px 10px',
              height: '24px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#146C78' }}></span>
              Live
            </div>
          </div>
        </header>

        {/* CONTENT ZONE */}
        <main style={{
          marginTop: '64px',
          padding: '24px',
          background: '#F6F7F3',
          flex: 1
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
