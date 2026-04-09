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
        title: const Text('FINANCE DASHBOARD', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
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
                  // --- ROI & PROFITABILITY ---
                  _buildSectionHeader('📈 ROI & PROFITABILITY'),
                  const SizedBox(height: 15),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [const Color(0xFF00FF88).withOpacity(0.1), Colors.transparent]),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: const Color(0xFF00FF88).withOpacity(0.2)),
                    ),
                    child: Column(
                      children: [
                        _buildStatRow('Net Profit', '\$${stats['lifetime']?['profit']?.toStringAsFixed(2) ?? '0.00'}', const Color(0xFF00FF88), large: true),
                        const SizedBox(height: 10),
                        _buildStatRow('Profit Margin', '${_calculateMargin(stats)}%', Colors.white, large: false),
                        _buildStatRow('Asset Value (Stock)', '\$${stats['stockValue']?.toString() ?? '0'}', Colors.blue, large: false),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),
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
                    childAspectRatio: 1.4,
                    children: [
                      _buildMiniWallet('Z2U / Marketplace', '\$${wallets['z2u']?.toStringAsFixed(2) ?? '0.00'}', Colors.blue),
                      _buildMiniWallet('G2G / PlayerUp', '\$${wallets['g2g']?.toStringAsFixed(2) ?? '0.00'}', Colors.blue),
                      _buildMiniWallet('Binance (USDT)', '\$${wallets['binance']?.toStringAsFixed(2) ?? '0.00'}', Colors.orange),
                      _buildMiniWallet('RedotPay / Skrill', '\$${((wallets['redotpay'] ?? 0) + (wallets['skrill'] ?? 0)).toStringAsFixed(2)}', Colors.red),
                    ],
                  ),

                  const SizedBox(height: 40),
                  _buildSectionHeader('🗓️ MONTHLY NET PROFIT'),
                  const SizedBox(height: 15),
                  _buildListSection(stats['monthlyBreakdown'] as List? ?? [], 'month', 'profit', isCurrency: true),

                  const SizedBox(height: 40),
                  _buildSectionHeader('💎 PROFIT PER PRODUCT'),
                  const SizedBox(height: 15),
                  _buildListSection(stats['productProfit'] as List? ?? [], 'name', 'profit', isCurrency: true),

                  const SizedBox(height: 40),
                  _buildSectionHeader('🔥 TOP SELLING (VOLUME)'),
                  const SizedBox(height: 15),
                  _buildListSection(stats['productVolume'] as List? ?? [], 'name', 'count', isCurrency: false),

                  const SizedBox(height: 40),
                  _buildSectionHeader('📋 RECENT TRANSACTIONS'),
                  const SizedBox(height: 15),
                  _buildTransactionList(stats['recentTransactions'] as List? ?? []),
                  
                  const SizedBox(height: 50),
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

  String _calculateMargin(Map<String, dynamic> stats) {
    double rev = (stats['lifetime']?['revenue'] ?? 0).toDouble();
    double prof = (stats['lifetime']?['profit'] ?? 0).toDouble();
    if (rev == 0) return '0';
    return ((prof / rev) * 100).toStringAsFixed(1);
  }

  Widget _buildSectionHeader(String title) {
    return Text(title, style: const TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.bold));
  }

  Widget _buildListSection(List data, String labelKey, String valueKey, {bool isCurrency = true}) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: data.take(5).map((item) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(item[labelKey].toString(), style: const TextStyle(color: Colors.white70, fontSize: 13))),
                Text(
                  isCurrency ? '\$${item[valueKey].toString()}' : item[valueKey].toString(),
                  style: TextStyle(
                    color: isCurrency ? const Color(0xFF00FF88) : Colors.orange,
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildTransactionList(List transactions) {
    return Column(
      children: transactions.take(10).map((t) {
        final double amt = (t['amount'] ?? 0).toDouble();
        final type = t['type'] ?? 'sale';
        final bool isOut = ['expense', 'purchase', 'payout', 'transfer_out'].contains(type);

        return Container(
          margin: const EdgeInsets.only(bottom: 10),
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            color: const Color(0xFF111111),
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: isOut ? Colors.red.withOpacity(0.1) : const Color(0xFF00FF88).withOpacity(0.1), shape: BoxShape.circle),
                child: Icon(isOut ? Icons.arrow_upward : Icons.arrow_downward, size: 18, color: isOut ? Colors.red : const Color(0xFF00FF88)),
              ),
              const SizedBox(width: 15),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(t['description'] ?? 'Transaction', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                    Text('${t['platform']} • ${t['date'].toString().split('T')[0]}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                  ],
                ),
              ),
              Text(
                '${isOut ? '-' : '+'}${t['currency'] == 'PKR' ? '₨' : '\$'}${amt.toStringAsFixed(0)}',
                style: TextStyle(color: isOut ? Colors.red : const Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 15),
              ),
            ],
          ),
        );
      }).toList(),
    );
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
          Text(name, style: const TextStyle(color: Colors.grey, fontSize: 9, letterSpacing: 0.5)),
          const SizedBox(height: 8),
          Text(balance, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value, Color color, {bool large = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(color: Colors.white70, fontSize: large ? 16 : 13)),
          Text(value, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: large ? 24 : 16)),
        ],
      ),
    );
  }
}
