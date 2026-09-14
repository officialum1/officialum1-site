import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'app_shell.dart';

class AdminHubScreen extends StatefulWidget {
  final VoidCallback? onBackToClient;
  const AdminHubScreen({super.key, this.onBackToClient});

  @override
  State<AdminHubScreen> createState() => _AdminHubScreenState();
}

class _AdminHubScreenState extends State<AdminHubScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = false;

  // Record Sale Form
  final _customerEmailCtrl = TextEditingController();
  final _productNameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _credentialsCtrl = TextEditingController();
  String? _generatedDeliveryUrl;

  Future<void> _recordSale() async {
    if (_productNameCtrl.text.trim().isEmpty || _amountCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please provide product name and sale amount.")),
      );
      return;
    }

    setState(() => _isLoading = true);
    try {
      final res = await _api.post('/admin/inventory', {
        'action': 'record_sale',
        'product_name': _productNameCtrl.text.trim(),
        'buyer_email': _customerEmailCtrl.text.trim(),
        'sale_price': double.tryParse(_amountCtrl.text.trim()) ?? 0.0,
        'credentials': _credentialsCtrl.text.trim(),
      });

      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final token = data['delivery_token'] ?? data['token'] ?? 'del_${DateTime.now().millisecondsSinceEpoch}';
        final deliveryUrl = "https://officialum1.com/delivery/$token";

        setState(() {
          _generatedDeliveryUrl = deliveryUrl;
        });

        // Automatically copy to clipboard!
        Clipboard.setData(ClipboardData(text: deliveryUrl));

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF00FF88),
              duration: const Duration(seconds: 5),
              content: Text(
                "Sale recorded! Delivery link automatically copied to clipboard:\n$deliveryUrl",
                style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          );
        }
      }
    } catch (e) {
      debugPrint("Error recording sale: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      appBar: AppBar(
        title: const Text('ADMIN COMMAND CENTER', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF00FF88))),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF00FF88)),
          onPressed: widget.onBackToClient ?? () => AppShell.scaffoldKey.currentState?.openDrawer(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.flash_on, color: Color(0xFF00FF88), size: 20),
                    SizedBox(width: 8),
                    Text("Instant Sale & Auto-Delivery Generator", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                ),
                const SizedBox(height: 6),
                const Text("Record a sale to instantly generate and copy the /delivery/[token] secure link to clipboard.", style: TextStyle(color: Colors.grey, fontSize: 11)),
                const SizedBox(height: 16),

                TextField(
                  controller: _productNameCtrl,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: "Product / Service Name",
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                    filled: true,
                    fillColor: Colors.white.withValues(alpha: 0.05),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 10),

                TextField(
                  controller: _amountCtrl,
                  keyboardType: TextInputType.number,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: "Sale Amount (\$ USD)",
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                    filled: true,
                    fillColor: Colors.white.withValues(alpha: 0.05),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 10),

                TextField(
                  controller: _customerEmailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: "Buyer Email Address",
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                    filled: true,
                    fillColor: Colors.white.withValues(alpha: 0.05),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 10),

                TextField(
                  controller: _credentialsCtrl,
                  maxLines: 2,
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: "Credentials / Login / Fulfillment Data",
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                    filled: true,
                    fillColor: Colors.white.withValues(alpha: 0.05),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
                const SizedBox(height: 16),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00FF88),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: _isLoading ? null : _recordSale,
                    child: _isLoading
                        ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                        : const Text("RECORD SALE & COPY DELIVERY LINK", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1)),
                  ),
                ),

                if (_generatedDeliveryUrl != null) ...[
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(10), border: Border.all(color: const Color(0xFF00FF88))),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("DELIVERY LINK (COPIED TO CLIPBOARD)", style: TextStyle(color: Color(0xFF00FF88), fontSize: 9, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        SelectableText(_generatedDeliveryUrl!, style: const TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
