import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'main_navigation_container.dart';
import 'guest_posting_screen.dart';

class NativeStoreScreen extends StatefulWidget {
  const NativeStoreScreen({super.key});

  @override
  State<NativeStoreScreen> createState() => _NativeStoreScreenState();
}

class _NativeStoreScreenState extends State<NativeStoreScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List _products = [];
  String _searchQuery = "";

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/products');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) setState(() => _products = data is List ? data : []);
      }
    } catch (e) {
      debugPrint("Error fetching products: $e");
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showPurchaseDialog(Map<String, dynamic> product) {
    final emailCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFF00FF88))),
        title: Text(product['name'] ?? 'Product', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Price: \$${product['price']}", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(product['description'] ?? 'Instant digital delivery with verified warranty.', style: const TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 16),
            TextField(
              controller: emailCtrl,
              keyboardType: TextInputType.emailAddress,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "Your Email Address (For Delivery Link)",
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                filled: true,
                fillColor: Colors.white.withOpacity(0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("CANCEL", style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () {
              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  backgroundColor: const Color(0xFF00FF88),
                  content: Text("Order initiated for ${product['name']}! Check your email for payment invoice.", style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                ),
              );
            },
            child: const Text("INSTANT ORDER", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _products.filter((p) {
      if (_searchQuery.isEmpty) return true;
      final name = (p['name'] ?? '').toString().toLowerCase();
      final desc = (p['description'] ?? '').toString().toLowerCase();
      final q = _searchQuery.toLowerCase();
      return name.contains(q) || desc.contains(q);
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('OFFICIALUM1 STORE', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.bold, fontSize: 15)),
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
            icon: const Icon(Icons.refresh, color: Color(0xFF00FF88)),
            onPressed: _fetchProducts,
          )
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchProducts,
        color: const Color(0xFF00FF88),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Search Bar
            TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: "Search digital products, accounts & services...",
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF00FF88), size: 20),
                filled: true,
                fillColor: const Color(0xFF111111),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.08))),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.white.withOpacity(0.08))),
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              ),
            ),
            const SizedBox(height: 16),

            // Quick Banner for Guest Posting
            GestureDetector(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (c) => const GuestPostingScreen()));
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(colors: [Color(0xFF00FF88), Color(0xFF00CCFF)]),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.rocket_launch, color: Colors.black, size: 28),
                    SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("DA60+ Authority Guest Posts", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 15)),
                          Text("Direct editorial access on 65,000+ vetted sites →", style: TextStyle(color: Colors.black87, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text("DIGITAL INVENTORY & PRODUCTS", style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                Text("${filtered.length} Items", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 11, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),

            if (_isLoading)
              const Center(child: Padding(padding: EdgeInsets.all(40), child: CircularProgressIndicator(color: Color(0xFF00FF88))))
            else if (filtered.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                alignment: Alignment.center,
                child: const Text("No products found in catalog.", style: TextStyle(color: Colors.grey)),
              )
            else
              ...filtered.map((prod) => Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF111111),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: const Color(0xFF00FF88).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.inventory_2, color: Color(0xFF00FF88), size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(prod['name'] ?? 'Digital Product', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 4),
                          Text(prod['description'] ?? 'Verified digital account with credentials warranty.', style: const TextStyle(color: Colors.grey, fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text("\$${prod['price'] ?? '0.00'}", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 16, fontWeight: FontWeight.w900)),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF00FF88),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                ),
                                onPressed: () => _showPurchaseDialog(prod),
                                child: const Text("BUY NOW", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
          ],
        ),
      ),
    );
  }
}

extension FilterExt on List {
  List filter(bool Function(dynamic) test) {
    return where(test).toList();
  }
}
