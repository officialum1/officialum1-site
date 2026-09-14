import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'store_screen.dart';
import 'guest_posting_screen.dart';
import 'tracking_screen.dart';
import 'reviews_screen.dart';
import 'account_screen.dart';
import 'admin_hub_screen.dart';
import 'login_screen.dart';

class AppShell extends StatefulWidget {
  static final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  const AppShell({super.key});

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  int _currentIndex = 0; // 0: Store, 1: Guest Post, 2: Tracking, 3: Reviews, 4: Support
  bool _showAdminHub = false;

  void _onTabSelected(int index) {
    setState(() {
      _currentIndex = index;
      _showAdminHub = false;
    });
  }

  Widget _buildBody() {
    if (_showAdminHub) {
      return AdminHubScreen(
        onBackToClient: () {
          setState(() => _showAdminHub = false);
        },
      );
    }

    switch (_currentIndex) {
      case 0:
        return StoreScreen(onNavigateTab: (idx) => _onTabSelected(idx));
      case 1:
        return const GuestPostingScreen();
      case 2:
        return const TrackingScreen();
      case 3:
        return const ReviewsScreen();
      case 4:
        return AccountScreen(
          onOpenAdminHub: () {
            setState(() => _showAdminHub = true);
          },
        );
      default:
        return StoreScreen(onNavigateTab: (idx) => _onTabSelected(idx));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isAuth = auth.isAuthenticated;
    final userEmail = (auth.user?['email'] ?? '').toString();
    final isAdmin = isAuth && (auth.user?['role'] == 'admin' || userEmail.toLowerCase().contains('admin') || userEmail.toLowerCase().contains('officialum1'));

    return Scaffold(
      key: AppShell.scaffoldKey,
      drawer: _buildDrawer(auth, isAdmin),
      body: _buildBody(),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF0A0A0A),
          border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.08), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _showAdminHub ? 4 : _currentIndex,
          onTap: _onTabSelected,
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

  Widget _buildDrawer(AuthProvider auth, bool isAdmin) {
    final isAuth = auth.isAuthenticated;

    return Drawer(
      backgroundColor: const Color(0xFF0A0A0A),
      child: SafeArea(
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: const Color(0xFF00FF88).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                        child: const Icon(Icons.hub_outlined, color: Color(0xFF00FF88), size: 24),
                      ),
                      const SizedBox(width: 12),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('OfficialUM1', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                          Text('Global Digital Agency', style: TextStyle(color: Color(0xFF00FF88), fontSize: 9, letterSpacing: 1, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  if (!isAuth)
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
                        color: Colors.white.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.3)),
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
                  _buildSectionHeader('OFFICIAL ECOSYSTEM'),
                  _buildDrawerNav('🛍️ Digital Store & Products', Icons.storefront_outlined, 0),
                  _buildDrawerNav('🚀 DA60+ Guest Posting', Icons.rocket_launch_outlined, 1),
                  _buildDrawerNav('📦 Instant Delivery Tracker', Icons.receipt_long_outlined, 2),
                  _buildDrawerNav('⭐ 4.9 Verified Reviews', Icons.star_outline, 3),
                  _buildDrawerNav('👤 Account & 24/7 Support', Icons.person_outline, 4),

                  const Divider(color: Colors.white12, height: 26),
                  _buildSectionHeader('STORE OWNER & ADMINISTRATION'),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF00FF88).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.3)),
                    ),
                    child: ListTile(
                      onTap: () {
                        Navigator.pop(context);
                        setState(() => _showAdminHub = true);
                      },
                      dense: true,
                      leading: const Icon(Icons.admin_panel_settings, color: Color(0xFF00FF88), size: 22),
                      title: const Text('ADMIN COMMAND CENTER', style: TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 12, letterSpacing: 0.5)),
                      subtitle: const Text('⚡ Sell & Link • 📦 Stock • 👥 CRM • 🌐 Portal', style: TextStyle(color: Colors.white70, fontSize: 9)),
                      trailing: const Icon(Icons.arrow_forward_ios, color: Color(0xFF00FF88), size: 12),
                    ),
                  ),

                  if (isAuth) ...[
                    const Divider(color: Colors.white12, height: 26),
                    ListTile(
                      onTap: () {
                        Navigator.pop(context);
                        auth.logout();
                      },
                      leading: const Icon(Icons.logout, color: Colors.redAccent, size: 18),
                      title: const Text('LOGOUT SESSION', style: TextStyle(color: Colors.redAccent, fontSize: 11, fontWeight: FontWeight.bold)),
                    ),
                  ],

                  const SizedBox(height: 40),
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

  Widget _buildDrawerNav(String title, IconData icon, int index) {
    final isSelected = !_showAdminHub && _currentIndex == index;
    return ListTile(
      onTap: () {
        Navigator.pop(context);
        _onTabSelected(index);
      },
      dense: true,
      leading: Icon(icon, color: isSelected ? const Color(0xFF00FF88) : Colors.grey, size: 18),
      title: Text(title, style: TextStyle(color: isSelected ? Colors.white : Colors.grey, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal, fontSize: 12)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      selectedTileColor: const Color(0xFF00FF88).withValues(alpha: 0.1),
      selected: isSelected,
    );
  }
}
