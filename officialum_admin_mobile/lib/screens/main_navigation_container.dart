import 'package:flutter/material.dart';
import 'dashboard_screen.dart';
import 'inventory_screen.dart';
import 'orders_screen.dart';
import 'g2g_hub_screen.dart';
import 'web_module_screen.dart';

import 'record_sale_screen.dart';
import 'automation_screen.dart';

class MainNavigationContainer extends StatefulWidget {
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
    if (_selectedIndex == 0) return const DashboardScreen();
    if (_selectedIndex == 1) return const InventoryScreen();
    if (_selectedIndex == 2) return const OrdersScreen();
    if (_selectedIndex == 3) return const G2GHubScreen();
    if (_selectedIndex == 27) return const RecordSaleScreen();
    if (_selectedIndex == 28) return const AutomationScreen();
    
    if (_currentWebUrl != null) {
      return WebModuleScreen(
        key: ValueKey(_currentWebUrl),
        title: _currentWebTitle ?? 'Module',
        url: _currentWebUrl!,
      );
    }
    
    return const DashboardScreen();
  }

  void _selectModule(int index, {String? title, String? url}) {
    setState(() {
      _selectedIndex = index;
      if (index >= 4) {
        _currentWebTitle = title;
        _currentWebUrl = url;
      } else {
        _currentWebTitle = null;
        _currentWebUrl = null;
      }
    });
    Navigator.pop(context); // Close drawer
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                  _buildDrawerItem('Catalog', Icons.shopping_basket_outlined, 4, url: '$baseUrl?tab=catalog'),
                  _buildDrawerItem('Reviews Center', Icons.star_outline, 5, url: '$baseUrl?tab=reviews_hub'),
                  _buildDrawerItem('Stock', Icons.inventory_2_outlined, 1),
                  _buildDrawerItem('Orders', Icons.local_shipping_outlined, 2),
                  _buildDrawerItem('Bundles', Icons.inventory_outlined, 6, url: '$baseUrl?tab=bundle'),
                  _buildDrawerItem('G2G Center', Icons.sports_esports_outlined, 3),
                  _buildDrawerItem('PlayerUp', Icons.trending_up, 7, url: '$baseUrl?tab=playerup'),
                  _buildDrawerItem('Z2U Hub', Icons.workspace_premium, 8, url: '$baseUrl?tab=z2u'),
                  _buildDrawerItem('Promos', Icons.label_important_outline, 9, url: '$baseUrl?tab=promos'),
                  
                  const Divider(color: Colors.white12, height: 30),
                  
                  _buildSectionHeader('SALES & CRM'),
                  _buildDrawerItem('Record Sale', Icons.add_shopping_cart, 27),
                  _buildDrawerItem('Sales History', Icons.history, 10, url: '$baseUrl?tab=sell'),
                  _buildDrawerItem('Leads', Icons.people_outline, 11, url: '$baseUrl?tab=leads'),
                  _buildDrawerItem('Buyers', Icons.person_outline, 12, url: '$baseUrl?tab=users'),
                  _buildDrawerItem('Sellers', Icons.storefront_outlined, 13, url: '$baseUrl?tab=sellers'),
                  _buildDrawerItem('Verifications', Icons.verified_user_outlined, 14, url: '$baseUrl?tab=verifications'),
                  _buildDrawerItem('Support', Icons.support_agent, 15, url: '$baseUrl?tab=support'),

                  const Divider(color: Colors.white12, height: 30),

                  _buildSectionHeader('CONTENT & TOOLS'),
                  _buildDrawerItem('Website', Icons.language, 16, url: 'https://officialum1.com'),
                  _buildDrawerItem('Auto-Bumping', Icons.auto_mode, 28),
                  _buildDrawerItem('PlayerUp Threads', Icons.trending_up, 7, url: '$baseUrl?tab=playerup'),
                  _buildDrawerItem('Intelligence', Icons.insights, 18, url: '$baseUrl?tab=intel'),
                  _buildDrawerItem('Tools', Icons.build_outlined, 19, url: '$baseUrl?tab=tools'),
                  _buildDrawerItem('KB/FAQ', Icons.help_outline, 20, url: '$baseUrl?tab=kb'),

                  const Divider(color: Colors.white12, height: 30),

                  _buildSectionHeader('ADMINISTRATION'),
                  _buildDrawerItem('Finance', Icons.account_balance_wallet_outlined, 21, url: '$baseUrl?tab=finance'),
                  _buildDrawerItem('Docs', Icons.description_outlined, 22, url: '$baseUrl?tab=documents'),
                  _buildDrawerItem('Payments', Icons.payment_outlined, 23, url: '$baseUrl?tab=payments'),
                  _buildDrawerItem('Staff', Icons.badge_outlined, 24, url: '$baseUrl?tab=hr'),
                  _buildDrawerItem('Logs', Icons.list_alt, 25, url: '$baseUrl?tab=logs'),
                  _buildDrawerItem('Settings', Icons.settings_outlined, 26, url: '$baseUrl?tab=settings'),
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

  Widget _buildDrawerItem(String title, IconData icon, int index, {String? url}) {
    bool isSelected = _selectedIndex == index;
    return ListTile(
      onTap: () => _selectModule(index, title: title, url: url),
      dense: true,
      leading: Icon(icon, color: isSelected ? const Color(0xFF00FF88) : Colors.grey, size: 20),
      title: Text(title, style: TextStyle(color: isSelected ? Colors.white : Colors.grey, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      selectedTileColor: const Color(0xFF00FF88).withOpacity(0.1),
      selected: isSelected,
    );
  }
}
