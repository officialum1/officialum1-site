import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';
import '../models/app_models.dart';
import '../widgets/g2g_fulfillment_dialog.dart';
import '../services/api_service.dart';

class G2GHubScreen extends StatefulWidget {
  const G2GHubScreen({super.key});

  @override
  State<G2GHubScreen> createState() => _G2GHubScreenState();
}

class _G2GHubScreenState extends State<G2GHubScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchG2GOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MainProvider>();
    final orders = provider.g2gOrders;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('G2G DELIVERY HUB', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 16)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00CCFF)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            onPressed: () async {
              showDialog(context: context, barrierDismissible: false, builder: (c) => const Center(child: CircularProgressIndicator()));
              try {
                final res = await ApiService().get('/admin/g2g?action=sync_offers');
                Navigator.pop(context); // Close loader
                if (res.statusCode == 200) {
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Synced with G2G!')));
                }
              } catch (e) {
                Navigator.pop(context);
              }
            }, 
            icon: const Icon(Icons.sync, color: Color(0xFF00CCFF))
          ),
          IconButton(
            onPressed: () => provider.fetchG2GOrders(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: provider.isLoadingG2G
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00CCFF)))
          : orders.isEmpty
              ? const Center(child: Text('No active G2G orders'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: orders.length,
                  itemBuilder: (context, index) {
                    final order = orders[index];
                    return _buildG2GCard(order);
                  },
                ),
    );
  }

  Widget _buildG2GCard(G2GOrder order) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF00CCFF).withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00CCFF).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'G2G #${order.orderId}',
                  style: const TextStyle(color: Color(0xFF00CCFF), fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
              Text(
                DateFormat('HH:mm, MMM dd').format(DateTime.parse(order.updatedAt)),
                style: TextStyle(color: Colors.grey.shade600, fontSize: 10),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            order.productName,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ORDER AMOUNT', style: TextStyle(color: Colors.grey, fontSize: 9, letterSpacing: 1)),
                  Text('\$${order.amount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ],
              ),
              ElevatedButton(
                onPressed: () async {
                  final success = await showDialog<bool>(
                    context: context,
                    builder: (context) => G2GFulfillmentDialog(orderId: order.orderId),
                  );
                  if (success == true) {
                    if (mounted) context.read<MainProvider>().fetchG2GOrders();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00CCFF),
                  foregroundColor: Colors.black,
                  minimumSize: const Size(100, 40),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('SHIP NOW', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
