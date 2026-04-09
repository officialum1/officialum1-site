import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';
import '../models/app_models.dart';

class PayoutsScreen extends StatefulWidget {
  const PayoutsScreen({super.key});

  @override
  State<PayoutsScreen> createState() => _PayoutsScreenState();
}

class _PayoutsScreenState extends State<PayoutsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchPayouts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MainProvider>();
    final payouts = provider.payouts;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('PAYOUT REQUESTS', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: () => provider.fetchPayouts(), icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: provider.isLoadingProducts // Reuse loading state or add new one
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : payouts.isEmpty
              ? const Center(child: Text('No payout requests', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: payouts.length,
                  itemBuilder: (context, index) {
                    final payout = payouts[index];
                    return _buildPayoutCard(payout);
                  },
                ),
    );
  }

  Widget _buildPayoutCard(Payout payout) {
    Color statusColor = payout.status.toLowerCase() == 'pending' ? Colors.orange : (payout.status.toLowerCase() == 'approved' ? Colors.green : Colors.red);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                payout.userEmail,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Text(
                  payout.status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('REQUESTED AMOUNT', style: TextStyle(color: Colors.grey, fontSize: 9, letterSpacing: 1)),
                  Text('\$${payout.amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF00FF88))),
                ],
              ),
              if (payout.status.toLowerCase() == 'pending')
                Row(
                  children: [
                    IconButton(
                      onPressed: () => _handleAction(payout.id, 'approve'),
                      icon: const Icon(Icons.check_circle, color: Colors.green),
                    ),
                    IconButton(
                      onPressed: () => _handleAction(payout.id, 'reject'),
                      icon: const Icon(Icons.cancel, color: Colors.red),
                    ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'VIA ${payout.method.toUpperCase()} • ${payout.date != '' ? DateFormat('MMM dd').format(DateTime.parse(payout.date)) : 'Today'}',
            style: const TextStyle(color: Colors.white24, fontSize: 10),
          ),
        ],
      ),
    );
  }

  Future<void> _handleAction(String id, String action) async {
    final provider = context.read<MainProvider>();
    bool ok = await provider.processPayout(id, action);
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Payout $action' 'd' ' successfully!')));
    }
  }
}
