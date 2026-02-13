import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../providers/auth_provider.dart';

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
            _buildStatCard(
              title: 'TOTAL REVENUE',
              value: '\$${stats?['totalRevenue']?.toString() ?? '0'}',
              icon: Icons.payments,
              color: Colors.white,
            ),
            const SizedBox(height: 16),
            _buildStatCard(
              title: 'NET PROFIT 🛡️',
              value: '\$${stats?['totalProfit']?.toString() ?? '0'}',
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
}
