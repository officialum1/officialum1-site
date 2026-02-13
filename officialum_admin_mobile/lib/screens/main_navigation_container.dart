import 'package:flutter/material.dart';
import 'dashboard_screen.dart';
import 'inventory_screen.dart';
import 'orders_screen.dart';
import 'g2g_hub_screen.dart';
import 'record_sale_screen.dart';
import 'automation_screen.dart';
import 'playerup_hub_screen.dart';
import 'generic_list_screen.dart';
import 'finance_screen.dart';
import 'catalog_screen.dart';
import 'support_tickets_screen.dart';
import 'user_management_screen.dart';
import 'payouts_screen.dart';
import 'intelligence_screen.dart';
import 'settings_screen.dart';

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
  int _selectedIndex = 0;
  String? _currentWebTitle;
  String? _currentWebUrl;

  // BASE URL for the web admin
  static const String baseUrl = 'https://officialum1.com/admin/inventory';

  Widget _getScreen() {
    switch (_selectedIndex) {
      case 0: return const DashboardScreen();
      case 1: return const InventoryScreen();
      case 2: return const OrdersScreen();
      case 3: return const G2GHubScreen();
      case 4: return const CatalogScreen();
      case 5: return const ReviewsManagementScreen(); // New
      case 6: return const GenericListScreen(module: 'Bundles', endpoint: '/admin/inventory');
      case 7: return const PlayerUpHubScreen();
      case 8: return const GenericListScreen(module: 'Z2U Center', endpoint: '/admin/z2u');
      case 9: return const PromosManagementScreen();
      case 10: return const GenericListScreen(module: 'Sales History', endpoint: '/admin/inventory?type=balance');
      case 11: return const LeadsManagementScreen(); // New
      case 12: return const UserManagementScreen(); 
      case 13: return const UserManagementScreen(); // Sellers filter can be added
      case 14: return const VerificationsManagementScreen(); // New
      case 15: return const SupportTicketsScreen();
      case 16: return const PayoutsScreen();
      case 18: return const IntelligenceScreen();
      case 20: return const KBManagementScreen();
      case 21: return const FinanceScreen();
      case 24: return const StaffManagementScreen();
      case 25: return const GenericListScreen(module: 'Logs', endpoint: '/admin/logs');
      case 26: return const SettingsScreen();
      case 27: return const RecordSaleScreen();
      case 28: return const AutomationScreen();
      case 29: return const WebsiteManagementScreen(); // Moved
      default: return const DashboardScreen();
    }
  }

  void _selectModule(int index, {String? title}) {
    setState(() {
      _selectedIndex = index;
    });
    Navigator.pop(context); // Close drawer
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: MainNavigationContainer.scaffoldKey,
      drawer: _buildDrawer(),
      body: _getScreen(),
    );
  }

  Widget _buildDrawer() {
    return Drawer(
      backgroundColor: const Color(0xFF0A0A0A),
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 20),
              alignment: Alignment.centerLeft,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                   const Text('ADMIN', style: TextStyle(color: Color(0xFF00FF88), fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.bold)),
                   const Text('WORKPLACE', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900, letterSpacing: -1)),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                children: [
                  _buildSectionHeader('STORE OPERATIONS'),
                  _buildDrawerItem('Catalog', Icons.shopping_basket_outlined, 4),
                  _buildDrawerItem('Reviews Center', Icons.star_outline, 5),
                  _buildDrawerItem('Stock', Icons.inventory_2_outlined, 1),
                  _buildDrawerItem('Orders', Icons.local_shipping_outlined, 2),
                  _buildDrawerItem('Bundles', Icons.inventory_outlined, 6),
                  _buildDrawerItem('G2G Center', Icons.sports_esports_outlined, 3),
                  _buildDrawerItem('PlayerUp Hub', Icons.trending_up, 7),
                  _buildDrawerItem('Z2U Hub', Icons.workspace_premium, 8),
                  _buildDrawerItem('Promos', Icons.label_important_outline, 9),
                  
                  const Divider(color: Colors.white12, height: 30),
                  
                  _buildSectionHeader('SALES & CRM'),
                  _buildDrawerItem('Record Sale', Icons.add_shopping_cart, 27),
                  _buildDrawerItem('Sales History', Icons.history, 10),
                  _buildDrawerItem('Leads / CRM', Icons.people_outline, 11),
                  _buildDrawerItem('Buyers', Icons.person_outline, 12),
                  _buildDrawerItem('Sellers', Icons.storefront_outlined, 13),
                  _buildDrawerItem('Verifications', Icons.verified_user_outlined, 14),
                  _buildDrawerItem('Support', Icons.support_agent, 15),

                  const Divider(color: Colors.white12, height: 30),

                  _buildSectionHeader('CONTENT & TOOLS'),
                  _buildDrawerItem('Website Hub', Icons.web, 29),
                  _buildDrawerItem('Auto-Bumping', Icons.auto_mode, 28),
                  _buildDrawerItem('Intelligence', Icons.insights, 18),
                  _buildDrawerItem('KB / FAQ', Icons.help_outline, 20),

                  const Divider(color: Colors.white12, height: 30),

                  _buildSectionHeader('ADMINISTRATION'),
                  _buildDrawerItem('Finance', Icons.account_balance_wallet_outlined, 21),
                  _buildDrawerItem('Payouts', Icons.monetization_on_outlined, 16),
                  _buildDrawerItem('Staff Hub', Icons.badge_outlined, 24),
                  _buildDrawerItem('Logs', Icons.list_alt, 25),
                  _buildDrawerItem('Settings', Icons.settings_outlined, 26),
                  
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
      child: Text(title, style: TextStyle(color: Colors.grey.shade600, fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildDrawerItem(String title, IconData icon, int index) {
    bool isSelected = _selectedIndex == index;
    return ListTile(
      onTap: () => _selectModule(index, title: title),
      dense: true,
      leading: Icon(icon, color: isSelected ? const Color(0xFF00FF88) : Colors.grey, size: 20),
      title: Text(title, style: TextStyle(color: isSelected ? Colors.white : Colors.grey, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      selectedTileColor: const Color(0xFF00FF88).withOpacity(0.1),
      selected: isSelected,
    );
  }
}

