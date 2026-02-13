import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/main_provider.dart';
import '../providers/auth_provider.dart';
import 'record_sale_screen.dart';
import 'automation_screen.dart';
import 'main_navigation_container.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchStats();
    });
  }

  @override
  Widget build(BuildContext context) {
    final stats = context.watch<MainProvider>().stats;

    return Scaffold(
      appBar: AppBar(
        title: const Text('DASHBOARD', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            onPressed: () => context.read<AuthProvider>().logout(),
            icon: const Icon(Icons.logout, color: Colors.redAccent),
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => context.read<MainProvider>().fetchStats(),
        color: const Color(0xFF00FF88),
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            if (stats == null && !context.watch<MainProvider>().isLoadingStats)
              Container(
                margin: const EdgeInsets.only(bottom: 20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.red.withOpacity(0.2)),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.error_outline, color: Colors.redAccent),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Unable to connect to OfficialUM1 API. Please check your connection or login again.',
                        style: TextStyle(color: Colors.redAccent, fontSize: 13),
                      ),
                    ),
                  ],
                ),
              ),
                _buildStatCard(
                  title: 'TOTAL REVENUE',
                  value: '\$${stats?['totalRevenue'] is num ? (stats?['totalRevenue'] as num).toStringAsFixed(2) : stats?['totalRevenue']?.toString() ?? '0.00'}',
                  icon: Icons.payments,
                  color: Colors.white,
                ),
                const SizedBox(height: 10),
                if (stats?['timestamp'] != null)
                  Padding(
                    padding: const EdgeInsets.only(left: 10, bottom: 16),
                    child: Text(
                      'LAST SYNC: ${DateFormat('HH:mm:ss').format(DateTime.parse(stats!['timestamp']))}',
                      style: const TextStyle(color: Colors.white12, fontSize: 9, letterSpacing: 1),
                    ),
                  ),
                const SizedBox(height: 6),
                _buildStatCard(
              title: 'NET PROFIT 🛡️',
              value: '\$${stats?['totalProfit'] is num ? (stats?['totalProfit'] as num).toStringAsFixed(2) : stats?['totalProfit']?.toString() ?? '0.00'}',
              icon: Icons.shield,
              color: const Color(0xFF00FF88),
              isGradient: true,
            ),
            const SizedBox(height: 16),
            _buildStatCard(
              title: 'LIFETIME ORDERS',
              value: stats?['totalOrders']?.toString() ?? '0',
              icon: Icons.shopping_basket,
              color: const Color(0xFF00CCFF),
            ),
            const SizedBox(height: 32),
            const Text(
              'QUICK ACTIONS',
              style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 2),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildActionButton(
                    label: 'RECORD SALE',
                    icon: Icons.add_shopping_cart,
                    color: const Color(0xFF00FF88),
                    onTap: () {
                      // We need a way to navigate from here. 
                      // For now, let's assume MainNavigationContainer handles it via global state 
                      // or just push the screen directly.
                      Navigator.push(context, MaterialPageRoute(builder: (c) => const RecordSaleScreen()));
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildActionButton(
                    label: 'BUMP THREADS',
                    icon: Icons.rocket_launch,
                    color: const Color(0xFF00CCFF),
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (c) => const AutomationScreen()));
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            const Text(
              'QUICK TIPS',
              style: TextStyle(color: Colors.grey, fontSize: 12, letterSpacing: 2),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111111),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF00FF88).withOpacity(0.1)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lightbulb_outline, color: Color(0xFF00FF88)),
                  SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Check G2G Hub frequently for new orders that require manual fulfillment.',
                      style: TextStyle(fontSize: 13, color: Colors.white70),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({required String title, required String value, required IconData icon, required Color color, bool isGradient = false}) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
        gradient: isGradient ? LinearGradient(
          colors: [color.withOpacity(0.1), Colors.transparent],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ) : null,
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(color: color.withOpacity(0.6), fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(value, style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            ],
          )
        ],
      ),
    );
  }
  Widget _buildActionButton({required String label, required IconData icon, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(15),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(15),
          border: Border.all(color: color.withOpacity(0.1)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 8),
            Text(label, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
          ],
        ),
      ),
    );
  }
}
