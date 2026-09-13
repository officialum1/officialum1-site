import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'dashboard_screen.dart';
import 'inventory_screen.dart';
import 'orders_screen.dart';
import 'record_sale_screen.dart';
import 'automation_screen.dart';
import 'generic_list_screen.dart';
import 'finance_screen.dart';
import 'catalog_screen.dart';
import 'support_tickets_screen.dart';
import 'user_management_screen.dart';
import 'payouts_screen.dart';
import 'intelligence_screen.dart';
import 'settings_screen.dart';
import 'web_module_screen.dart';
import 'login_screen.dart';
import 'guest_posting_screen.dart';
import 'native_store_screen.dart';
import 'client_orders_screen.dart';
import 'client_reviews_screen.dart';
import 'client_account_screen.dart';

import 'website_management_screen.dart';
import 'promos_management_screen.dart';
import 'kb_management_screen.dart';
import 'staff_management_screen.dart';
import 'leads_management_screen.dart';
import 'reviews_management_screen.dart';
import 'verifications_management_screen.dart';

class MainNavigationContainer extends StatefulWidget {
  static final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  const MainNavigationContainer({super.key});

  @override
  State<MainNavigationContainer> createState() => _MainNavigationContainerState();
}

class _MainNavigationContainerState extends State<MainNavigationContainer> {
  int _currentBottomIndex = 0; // 0: Store, 1: Guest Post, 2: Tracking, 3: Reviews, 4: Support
  int _drawerModuleIndex = -1; // -1 means use bottom nav, >=0 means drawer override
  String? _currentWebTitle;
  String? _currentWebUrl;

  Widget _getScreen(bool isAuthenticated) {
    // If user clicked an external web link from the drawer
    if (_currentWebUrl != null) {
      return WebModuleScreen(
        title: _currentWebTitle ?? "Marketplace", 
        url: _currentWebUrl!,
      );
    }

    // If an admin drawer module is selected
    if (_drawerModuleIndex >= 0) {
      if (!isAuthenticated && _drawerModuleIndex != 100) return const LoginScreen();

      switch (_drawerModuleIndex) {
        case 0: return const DashboardScreen();
        case 1: return const InventoryScreen();
        case 2: return const OrdersScreen();
        case 4: return const CatalogScreen();
        case 5: return const ReviewsManagementScreen();
        case 6: return const GenericListScreen(module: 'Bundles', endpoint: '/admin/inventory');
        case 9: return const PromosManagementScreen();
        case 10: return const GenericListScreen(module: 'Sales History', endpoint: '/admin/inventory?type=balance');
        case 11: return const LeadsManagementScreen();
        case 12: return const UserManagementScreen(); 
        case 13: return const UserManagementScreen();
        case 14: return const VerificationsManagementScreen();
        case 15: return const SupportTicketsScreen();
        case 16: return const PayoutsScreen();
        case 17: return const FinanceScreen();
        case 18: return const IntelligenceScreen();
        case 19: return const KBManagementScreen();
        case 20: return const StaffManagementScreen();
        case 21: return const WebsiteManagementScreen();
        case 22: return const RecordSaleScreen();
        case 23: return const AutomationScreen();
        case 24: return const SettingsScreen();
        case 25: return const GenericListScreen(module: 'Logs', endpoint: '/admin/logs');
        case 100: return const LoginScreen();
        default: return const NativeStoreScreen();
      }
    }

    // 100% Client-First Bottom Navigation (Store, Guest Post, Tracking, Reviews, Support)
    switch (_currentBottomIndex) {
      case 0:
        return const NativeStoreScreen();
      case 1:
        return const GuestPostingScreen();
      case 2:
        return const ClientOrdersScreen();
      case 3:
        return const ClientReviewsScreen();
      case 4:
        return ClientAccountScreen(
          onOpenAdminHub: () {
            setState(() {
              _drawerModuleIndex = 0; // open overview dashboard
            });
          },
        );
      default:
        return const NativeStoreScreen();
    }
  }

  void _selectBottomTab(int index) {
    setState(() {
      _currentBottomIndex = index;
      _drawerModuleIndex = -1;
      _currentWebUrl = null;
    });
  }

  void _selectModule(int index, {String? title}) {
    setState(() {
      _drawerModuleIndex = index;
      _currentWebUrl = null;
    });
    Navigator.pop(context);
  }

  void _selectWebModule(String title, String url) {
    setState(() {
      _drawerModuleIndex = -1;
      _currentWebTitle = title;
      _currentWebUrl = url;
    });
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    
    return Scaffold(
      key: MainNavigationContainer.scaffoldKey,
      drawer: _buildDrawer(auth),
      body: _getScreen(auth.isAuthenticated),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0A0A0A),
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _drawerModuleIndex == -1 ? _currentBottomIndex : 0,
          onTap: _selectBottomTab,
          type: BottomNavigationBarType.fixed,
          backgroundColor: const Color(0xFF0A0A0A),
          selectedItemColor: const Color(0xFF00FF88),
          unselectedItemColor: Colors.grey.shade600,
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 0.5),
          unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal, fontSize: 9),
          elevation: 0,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.storefront_outlined),
              activeIcon: Icon(Icons.storefront, color: Color(0xFF00FF88)),
              label: 'STORE',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.rocket_launch_outlined),
              activeIcon: Icon(Icons.rocket_launch, color: Color(0xFF00FF88)),
              label: 'GUEST POST',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.receipt_long_outlined),
              activeIcon: Icon(Icons.receipt_long, color: Color(0xFF00FF88)),
              label: 'TRACKING',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.star_outline),
              activeIcon: Icon(Icons.star, color: Color(0xFF00FF88)),
              label: 'REVIEWS',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline),
              activeIcon: Icon(Icons.person, color: Color(0xFF00FF88)),
              label: 'SUPPORT',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawer(AuthProvider auth) {
    return Drawer(
      backgroundColor: const Color(0xFF0A0A0A),
      child: SafeArea(
        child: Column(
          children: [
            // Prominent Member Header
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.05))),
              ),
              child: Column(
                children: [
                   Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: const Color(0xFF00FF88).withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.hub_outlined, color: Color(0xFF00FF88), size: 24),
                      ),
                      const SizedBox(width: 12),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('OfficialUM1', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                          Text('Global Ecosystem', style: TextStyle(color: Color(0xFF00FF88), fontSize: 9, letterSpacing: 1, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  
                  if (!auth.isAuthenticated)
                    GestureDetector(
                      onTap: () {
                        Navigator.pop(context);
                        Navigator.push(context, MaterialPageRoute(builder: (c) => const LoginScreen()));
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 15),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(colors: [Color(0xFF00FF88), Color(0xFF00CCFF)]),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.login_rounded, color: Colors.black, size: 18),
                            SizedBox(width: 8),
                            Text('MEMBER SIGN IN / REGISTER', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1)),
                          ],
                        ),
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 15),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF00FF88).withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const CircleAvatar(radius: 12, backgroundColor: Color(0xFF00FF88), child: Icon(Icons.person, size: 14, color: Colors.black)),
                          const SizedBox(width: 10),
                          Expanded(child: Text(auth.user?['email'] ?? 'Member', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, overflow: TextOverflow.ellipsis))),
                          const Icon(Icons.verified, color: Color(0xFF00FF88), size: 14),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                children: [
                  _buildSectionHeader('AUTHORITY LINK BUILDING & GUEST POSTS'),
                  _buildWebItem('🔥 DA60+ Guest Posting', Icons.rocket_launch_outlined, 'https://officialum1.com/services/guest-posting'),
                  _buildWebItem('⚡ Contextual Niche Edits', Icons.link_rounded, 'https://officialum1.com/services/niche-edits'),
                  _buildWebItem('📰 Press Release Wire', Icons.newspaper_outlined, 'https://officialum1.com/services/press-release-distribution'),
                  _buildWebItem('📍 Local Citations (8 Countries)', Icons.location_on_outlined, 'https://officialum1.com/services/local-citations'),
                  _buildWebItem('💎 Web3 & Crypto Links', Icons.currency_bitcoin, 'https://officialum1.com/services/crypto-guest-posting'),
                  
                  const SizedBox(height: 15),
                  _buildSectionHeader('DIGITAL STORE & MARKETPLACE'),
                  _buildWebItem('🛍️ Digital Store & Inventory', Icons.storefront_outlined, 'https://officialum1.com/store'),
                  _buildWebItem('📦 Explore Products', Icons.shopping_bag_outlined, 'https://officialum1.com/shop'),
                  _buildWebItem('🎁 Bundle Offers', Icons.auto_awesome_motion, 'https://officialum1.com/bundles'),
                  _buildWebItem('⭐ Verified Reviews', Icons.star_border, 'https://officialum1.com/reviews'),
                  _buildWebItem('🛠️ All Services Catalog', Icons.miscellaneous_services, 'https://officialum1.com/services'),
                  
                  const SizedBox(height: 15),
                  _buildSectionHeader('CLIENT SERVICES & ORDERS'),
                  _buildWebItem('👤 Client Dashboard', Icons.account_circle_outlined, 'https://officialum1.com/dashboard'),
                  _buildWebItem('🛒 Instant Checkout', Icons.shopping_cart_checkout, 'https://officialum1.com/checkout'),
                  _buildWebItem('📜 My Purchases & Deliveries', Icons.history_edu, 'https://officialum1.com/my-orders'),
                  _buildWebItem('💰 Referral Program', Icons.card_giftcard, 'https://officialum1.com/refer'),
                  
                  const Divider(color: Colors.white12, height: 30),
                  
                  if (auth.isAuthenticated && (auth.user?['role'] == 'admin' || (auth.user?['email'] ?? '').toString().toLowerCase().contains('admin') || (auth.user?['email'] ?? '').toString().toLowerCase().contains('officialum1'))) ...[
                    _buildSectionHeader('ADMIN COMMAND PANEL'),
                    _buildDrawerItem('Overview Dashboard', Icons.speed, 0),
                    _buildDrawerItem('⚡ Record Sale & Auto-Link', Icons.flash_on_outlined, 22),
                    _buildDrawerItem('Catalog Management', Icons.category_outlined, 4),
                    _buildDrawerItem('Inventory Stock Pool', Icons.inventory_2_outlined, 1),
                    _buildDrawerItem('Order Fulfilment', Icons.local_shipping_outlined, 2),
                    
                    const SizedBox(height: 15),
                    _buildSectionHeader('SUPPORT & CRM'),
                    _buildDrawerItem('Client Tickets', Icons.support_agent, 15),
                    _buildDrawerItem('Leads & Quotes CRM', Icons.contact_mail_outlined, 11),
                    _buildDrawerItem('KYC Verifications', Icons.fact_check_outlined, 14),
                    _buildDrawerItem('Knowledge Base', Icons.menu_book_outlined, 19),
                    _buildDrawerItem('Reviews Management', Icons.rate_review_outlined, 5),
                    
                    const SizedBox(height: 15),
                    _buildSectionHeader('FINANCE & OPERATIONS'),
                    _buildDrawerItem('Finance Dashboard', Icons.monetization_on_outlined, 17),
                    _buildDrawerItem('Payouts & Withdrawals', Icons.account_balance_wallet_outlined, 16),
                    _buildDrawerItem('Staff & HR Management', Icons.people_outline, 20),
                    _buildDrawerItem('Market Intelligence', Icons.insights_outlined, 18),
                    _buildDrawerItem('Automation & Outreach', Icons.smart_toy_outlined, 23),
                    _buildWebItem('📄 Official Invoices & Docs', Icons.description_outlined, 'https://officialum1.com/admin/documents'),
                    _buildDrawerItem('Activity Audit Logs', Icons.list_alt, 25),
                    _buildDrawerItem('Settings Hub', Icons.settings_outlined, 24),
                    
                    const Divider(color: Colors.white12, height: 30),
                  ],

                  if (auth.isAuthenticated)
                    ListTile(
                      onTap: () => auth.logout(),
                      leading: const Icon(Icons.logout, color: Colors.redAccent, size: 18),
                      title: const Text('LOGOUT SESSION', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  
                  const SizedBox(height: 50),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 15, top: 10, bottom: 8),
      child: Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 9, letterSpacing: 1, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildDrawerItem(String title, IconData icon, int index) {
    bool isSelected = _drawerModuleIndex == index && _currentWebUrl == null;
    return ListTile(
      onTap: () => _selectModule(index, title: title),
      dense: true,
      leading: Icon(icon, color: isSelected ? const Color(0xFF00FF88) : Colors.grey, size: 18),
      title: Text(title.toUpperCase(), style: TextStyle(color: isSelected ? Colors.white : Colors.grey, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 12, letterSpacing: 0.5)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      selectedTileColor: const Color(0xFF00FF88).withOpacity(0.1),
      selected: isSelected,
    );
  }

  Widget _buildWebItem(String title, IconData icon, String url) {
    bool isSelected = _currentWebUrl == url;
    return ListTile(
      onTap: () => _selectWebModule(title, url),
      dense: true,
      leading: Icon(icon, color: isSelected ? const Color(0xFF00FF88) : Colors.grey, size: 18),
      title: Text(title, style: TextStyle(color: isSelected ? Colors.white : Colors.grey, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      selectedTileColor: const Color(0xFF00FF88).withOpacity(0.1),
      selected: isSelected,
    );
  }
}
