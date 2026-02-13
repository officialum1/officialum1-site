import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';
import 'financial_transaction_screen.dart';

class FinanceScreen extends StatefulWidget {
  const FinanceScreen({super.key});

  @override
  State<FinanceScreen> createState() => _FinanceScreenState();
}

class _FinanceScreenState extends State<FinanceScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchStats();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MainProvider>();
    final stats = provider.stats ?? {};
    final wallets = stats['wallets'] as Map<String, dynamic>? ?? {};

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('FINANCE & WALLETS', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: () => provider.fetchStats(), icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: provider.isLoadingStats
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader('🇵🇰 PKR WALLETS'),
                  const SizedBox(height: 15),
                  _buildWalletCard('Meezan Bank', 'PKR ${wallets['meezan']?.toString() ?? '0'}', const Color(0xFF00FF88)),
                  _buildWalletCard('UBL / EasyPaisa / JazzCash', 'PKR ${wallets['ubl']?.toString() ?? '0'}', const Color(0xFF00FF88)),
                  
                  const SizedBox(height: 30),
                  _buildSectionHeader('🇺🇸 USD ACCOUNTS'),
                  const SizedBox(height: 15),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.3,
                    children: [
                      _buildMiniWallet('Z2U / Marketplace', '\$${wallets['z2u']?.toString() ?? '0.00'}', Colors.blue),
                      _buildMiniWallet('G2G / PlayerUp', '\$${wallets['g2g']?.toString() ?? '0.00'}', Colors.blue),
                      _buildMiniWallet('Binance (USDT)', '\$${wallets['binance']?.toString() ?? '0.00'}', Colors.orange),
                      _buildMiniWallet('RedotPay / Skrill', '\$${((wallets['redotpay'] ?? 0) + (wallets['skrill'] ?? 0)).toStringAsFixed(2)}', Colors.red),
                    ],
                  ),

                  const SizedBox(height: 40),
                  _buildSectionHeader('MONTHLY PERFORMANCE'),
                  const SizedBox(height: 15),
                  _buildStatRow('Current Month Revenue', '\$${stats['currentMonth']?['revenue']?.toString() ?? '0'}', Colors.white),
                  _buildStatRow('Current Month Profit', '\$${stats['currentMonth']?['profit']?.toString() ?? '0'}', const Color(0xFF00FF88)),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8.0),
                    child: Divider(color: Colors.white12),
                  ),
                  _buildStatRow('Last Month Revenue', '\$${stats['lastMonth']?['revenue']?.toString() ?? '0'}', Colors.white60),
                  _buildStatRow('Last Month Profit', '\$${stats['lastMonth']?['profit']?.toString() ?? '0'}', const Color(0xFF00FF88).withOpacity(0.6)),

                  const SizedBox(height: 40),
                  _buildSectionHeader('WORKSPACE ASSETS'),
                  const SizedBox(height: 15),
                  _buildStatRow('Stock Value (Assets)', '\$${stats['stockValue']?.toString() ?? '0'}', Colors.blue),
                  
                  const SizedBox(height: 40),
                  _buildSectionHeader('LIFETIME OVERVIEW'),
                  const SizedBox(height: 15),
                  _buildStatRow('Lifetime Revenue', '\$${stats['lifetime']?['revenue']?.toString() ?? '0'}', Colors.white38),
                  _buildStatRow('Lifetime Orders', '${stats['lifetime']?['orders']?.toString() ?? '0'}', Colors.white38),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (c) => const FinancialTransactionScreen())),
        backgroundColor: const Color(0xFF00FF88),
        child: const Icon(Icons.swap_horiz, color: Colors.black),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(title, style: const TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.bold));
  }

  Widget _buildWalletCard(String name, String balance, Color color) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(name, style: const TextStyle(color: Colors.grey, fontSize: 13)),
          Text(balance, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ],
      ),
    );
  }

  Widget _buildMiniWallet(String name, String balance, Color color) {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(name, style: const TextStyle(color: Colors.grey, fontSize: 10)),
          const SizedBox(height: 8),
          Text(balance, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value, Color color) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 14)),
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 18)),
        ],
      ),
    );
  }
}
