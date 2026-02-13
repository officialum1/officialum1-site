import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../models/app_models.dart';

class PromosManagementScreen extends StatefulWidget {
  const PromosManagementScreen({super.key});

  @override
  State<PromosManagementScreen> createState() => _PromosManagementScreenState();
}

class _PromosManagementScreenState extends State<PromosManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => context.read<MainProvider>().fetchCoupons());
  }

  @override
  Widget build(BuildContext context) {
    final list = context.watch<MainProvider>().coupons;
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('PROMOS & COUPONS', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: Color(0xFF00FF88)),
            onPressed: () => _showAddCoupon(context),
          ),
        ],
      ),
      body: list.isEmpty
          ? const Center(child: Text('No promo codes found', style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final coupon = list[index];
                return _buildCouponCard(context, coupon);
              },
            ),
    );
  }

  Widget _buildCouponCard(BuildContext context, Coupon coupon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(coupon.code, style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold, fontSize: 18, letterSpacing: 2)),
              const SizedBox(height: 4),
              Text('Discount: ${coupon.discount}', style: const TextStyle(color: Colors.white70, fontSize: 14)),
              if (coupon.expiresAt != null)
                Text('Expires: ${coupon.expiresAt}', style: const TextStyle(color: Colors.white24, fontSize: 11)),
            ],
          ),
          IconButton(
            icon: const Icon(Icons.delete_sweep, color: Colors.redAccent),
            onPressed: () => _confirmDelete(context, coupon),
          ),
        ],
      ),
    );
  }

  void _showAddCoupon(BuildContext context) {
    final codeController = TextEditingController();
    final discountController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('NEW PROMO CODE', style: TextStyle(color: Colors.white, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: codeController, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(labelText: 'Code', labelStyle: TextStyle(color: Colors.white54))),
            TextField(controller: discountController, style: const TextStyle(color: Colors.white), decoration: const InputDecoration(labelText: 'Discount (e.g. 10% or 500)', labelStyle: TextStyle(color: Colors.white54))),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () async {
              final success = await context.read<MainProvider>().addContent('/promocodes', {
                'code': codeController.text,
                'discount': discountController.text,
              });
              if (success) Navigator.pop(context);
            },
            child: const Text('ACTIVATE', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, Coupon coupon) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('DELETE COUPON', style: TextStyle(color: Colors.white)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          TextButton(onPressed: () async {
            final success = await context.read<MainProvider>().deleteItem('/promocodes', coupon.id);
            if (success) Navigator.pop(context);
          }, child: const Text('DELETE', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
  }
}
