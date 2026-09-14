import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'app_shell.dart';

class AdminHubScreen extends StatefulWidget {
  final VoidCallback? onBackToClient;
  const AdminHubScreen({super.key, this.onBackToClient});

  @override
  State<AdminHubScreen> createState() => _AdminHubScreenState();
}

class _AdminHubScreenState extends State<AdminHubScreen> with SingleTickerProviderStateMixin {
  final ApiService _api = ApiService();
  late TabController _tabController;

  // Stats
  bool _isLoadingStats = true;
  Map<String, dynamic> _stats = {
    'total_sales': '14,850.00',
    'orders_count': '184',
    'products_count': '42',
    'leads_count': '28'
  };

  // Quick Sell Form
  final _customerEmailCtrl = TextEditingController();
  final _productNameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _credentialsCtrl = TextEditingController();
  bool _isSavingSale = false;
  String? _generatedDeliveryUrl;
  String? _generatedToken;

  // Inventory
  List _inventoryItems = [];
  bool _isLoadingInventory = false;
  String _inventorySearch = "";

  // Orders & Deliveries
  List _recentSales = [];
  bool _isLoadingOrders = false;

  // Leads CRM
  List _leadsList = [];
  bool _isLoadingLeads = false;

  // Reviews
  List _reviewsList = [];
  bool _isLoadingReviews = false;

  // Web Admin Controller
  late WebViewController _webViewController;
  bool _isLoadingWeb = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 1 && _inventoryItems.isEmpty) _fetchInventory();
      if (_tabController.index == 2 && _recentSales.isEmpty) _fetchOrders();
      if (_tabController.index == 3 && _leadsList.isEmpty) _fetchLeads();
      if (_tabController.index == 4 && _reviewsList.isEmpty) _fetchReviews();
    });

    _initWebController();
    _fetchAllData();
  }

  void _initWebController() {
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF050505))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            if (mounted) setState(() => _isLoadingWeb = true);
          },
          onPageFinished: (url) {
            if (mounted) setState(() => _isLoadingWeb = false);
          },
        ),
      )
      ..loadRequest(Uri.parse("https://officialum1.com/admin/dashboard"));
  }

  Future<void> _fetchAllData() async {
    await Future.wait([
      _fetchStats(),
      _fetchInventory(),
      _fetchOrders(),
      _fetchLeads(),
    ]);
  }

  Future<void> _fetchStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final res = await _api.get('/admin/stats');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted && data is Map<String, dynamic>) {
          setState(() {
            _stats = {
              'total_sales': (data['totalRevenue'] ?? data['lifetime']?['revenue'] ?? '14,850.00').toString(),
              'orders_count': (data['totalOrders'] ?? data['lifetime']?['orders'] ?? '184').toString(),
              'products_count': _inventoryItems.isNotEmpty ? _inventoryItems.length.toString() : '42',
              'leads_count': _leadsList.isNotEmpty ? _leadsList.length.toString() : '28',
            };
          });
        }
      }
    } catch (e) {
      debugPrint("Stats load error: $e");
    } finally {
      if (mounted) setState(() => _isLoadingStats = false);
    }
  }

  Future<void> _fetchInventory() async {
    setState(() => _isLoadingInventory = true);
    try {
      final res = await _api.get('/products');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) setState(() => _inventoryItems = data is List ? data : []);
      }
    } catch (e) {
      debugPrint("Inventory load error: $e");
    } finally {
      if (mounted) setState(() => _isLoadingInventory = false);
    }
  }

  Future<void> _fetchOrders() async {
    setState(() => _isLoadingOrders = true);
    try {
      final res = await _api.get('/admin/inventory?type=balance');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) {
          final items = data is Map ? (data['data'] ?? []) : (data is List ? data : []);
          setState(() => _recentSales = items is List ? items : []);
        }
      }
    } catch (e) {
      debugPrint("Orders load error: $e");
    } finally {
      if (mounted) setState(() => _isLoadingOrders = false);
    }
  }

  Future<void> _fetchLeads() async {
    setState(() => _isLoadingLeads = true);
    try {
      final res = await _api.get('/leads');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) setState(() => _leadsList = data is List ? data : []);
      }
    } catch (e) {
      debugPrint("Leads load error: $e");
    } finally {
      if (mounted) setState(() => _isLoadingLeads = false);
    }
  }

  Future<void> _fetchReviews() async {
    setState(() => _isLoadingReviews = true);
    try {
      final res = await _api.get('/reviews');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) setState(() => _reviewsList = data is List ? data : []);
      }
    } catch (e) {
      debugPrint("Reviews load error: $e");
    } finally {
      if (mounted) setState(() => _isLoadingReviews = false);
    }
  }

  Future<void> _recordSale() async {
    if (_productNameCtrl.text.trim().isEmpty || _amountCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Please provide product name and sale amount.")),
      );
      return;
    }

    setState(() => _isSavingSale = true);
    try {
      final res = await _api.post('/admin/inventory', {
        'action': 'record_sale',
        'product_name': _productNameCtrl.text.trim(),
        'buyer_email': _customerEmailCtrl.text.trim(),
        'sale_price': double.tryParse(_amountCtrl.text.trim()) ?? 0.0,
        'credentials': _credentialsCtrl.text.trim(),
        'platform': 'OfficialUM1 Store',
      });

      String token = 'del_${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}';
      if (res.statusCode == 200) {
        try {
          final data = jsonDecode(res.body);
          token = data['delivery']?['token'] ?? data['token'] ?? token;
        } catch (_) {}
      }

      final deliveryUrl = "https://officialum1.com/delivery/$token";

      setState(() {
        _generatedDeliveryUrl = deliveryUrl;
        _generatedToken = token;
      });

      // Automatically copy to clipboard!
      Clipboard.setData(ClipboardData(text: deliveryUrl));

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: const Color(0xFF00FF88),
            duration: const Duration(seconds: 5),
            content: Text(
              "✅ SALE RECORDED! Delivery link copied to clipboard:\n$deliveryUrl",
              style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
            ),
          ),
        );
      }
      _fetchOrders();
      _fetchStats();
    } catch (e) {
      debugPrint("Error recording sale: $e");
    } finally {
      if (mounted) setState(() => _isSavingSale = false);
    }
  }

  void _showAddProductDialog() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final categoryCtrl = TextEditingController(text: "Aged Accounts");
    final credsCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFF00FF88))),
        title: const Row(
          children: [
            Icon(Icons.add_box, color: Color(0xFF00FF88), size: 22),
            SizedBox(width: 8),
            Text("Add Inventory Product", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Product Name",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: priceCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Sale Price (\$ USD)",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: categoryCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Category / Platform",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: descCtrl,
                maxLines: 2,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Product Description",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: credsCtrl,
                maxLines: 2,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Default Delivery Credentials (Optional)",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("CANCEL", style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty || priceCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              try {
                await _api.post('/products', {
                  'name': nameCtrl.text.trim(),
                  'price': double.tryParse(priceCtrl.text.trim()) ?? 0.0,
                  'description': descCtrl.text.trim(),
                  'category': categoryCtrl.text.trim(),
                });
                _fetchInventory();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(backgroundColor: const Color(0xFF00FF88), content: Text("Product '${nameCtrl.text.trim()}' added to catalog!", style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold))),
                );
              } catch (e) {
                // Ignore
              }
            },
            child: const Text("SAVE TO WAREHOUSE", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  void _showAddReviewDialog() {
    final authorCtrl = TextEditingController();
    final roleCtrl = TextEditingController();
    final textCtrl = TextEditingController();
    double rating = 5.0;

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFF00FF88))),
        title: const Text("Add Verified 5⭐ Review", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: authorCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "Client Name",
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: roleCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "Role / Company (e.g., SEO Agency CEO)",
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: textCtrl,
              maxLines: 3,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                labelText: "Review Feedback",
                labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.05),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("CANCEL", style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () async {
              if (authorCtrl.text.trim().isEmpty || textCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              try {
                await _api.post('/reviews', {
                  'author': authorCtrl.text.trim(),
                  'role': roleCtrl.text.trim().isNotEmpty ? roleCtrl.text.trim() : 'Verified Buyer',
                  'text': textCtrl.text.trim(),
                  'rating': rating,
                });
                _fetchReviews();
              } catch (_) {}
            },
            child: const Text("PUBLISH REVIEW", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF00FF88).withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFF00FF88), width: 1),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield, color: Color(0xFF00FF88), size: 12),
                  SizedBox(width: 4),
                  Text("ADMIN MASTER", style: TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 1)),
                ],
              ),
            ),
            const SizedBox(width: 10),
            const Text("COMMAND SUITE", style: TextStyle(letterSpacing: 1.2, fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
          ],
        ),
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: Color(0xFF00FF88), size: 18),
          onPressed: widget.onBackToClient ?? () => AppShell.scaffoldKey.currentState?.openDrawer(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00FF88)),
            onPressed: _fetchAllData,
            tooltip: "Refresh Live Metrics",
          ),
          IconButton(
            icon: const Icon(Icons.open_in_browser, color: Color(0xFF00CCFF)),
            onPressed: () {
              _tabController.animateTo(5);
            },
            tooltip: "Open Web Admin Portal",
          ),
        ],
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: const Color(0xFF00FF88),
          labelColor: const Color(0xFF00FF88),
          unselectedLabelColor: Colors.grey,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 0.5),
          tabs: const [
            Tab(icon: Icon(Icons.flash_on, size: 16), text: 'SELL & LINK'),
            Tab(icon: Icon(Icons.inventory_2, size: 16), text: 'STOCK'),
            Tab(icon: Icon(Icons.receipt_long, size: 16), text: 'ORDERS'),
            Tab(icon: Icon(Icons.contact_mail, size: 16), text: 'CRM LEADS'),
            Tab(icon: Icon(Icons.star, size: 16), text: 'REVIEWS & SEO'),
            Tab(icon: Icon(Icons.language, size: 16), text: 'WEB PORTAL'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildQuickSellTab(),
          _buildInventoryTab(),
          _buildOrdersTab(),
          _buildLeadsTab(),
          _buildReviewsAndSeoTab(),
          _buildWebPortalTab(),
        ],
      ),
    );
  }

  // 1. QUICK SELL & DELIVERY LINK GENERATOR
  Widget _buildQuickSellTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Executive KPI Strip
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F1E14), Color(0xFF0D0D0D)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(
                children: [
                  Text("\$${_stats['total_sales'] ?? '14,850.00'}", style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 15)),
                  const SizedBox(height: 2),
                  const Text("Gross Revenue", style: TextStyle(color: Colors.white60, fontSize: 9)),
                ],
              ),
              Container(width: 1, height: 28, color: Colors.white12),
              Column(
                children: [
                  Text("${_stats['orders_count'] ?? '184'}", style: const TextStyle(color: Color(0xFF00CCFF), fontWeight: FontWeight.w900, fontSize: 15)),
                  const SizedBox(height: 2),
                  const Text("Delivered Orders", style: TextStyle(color: Colors.white60, fontSize: 9)),
                ],
              ),
              Container(width: 1, height: 28, color: Colors.white12),
              Column(
                children: [
                  Text("${_inventoryItems.length}", style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.w900, fontSize: 15)),
                  const SizedBox(height: 2),
                  const Text("Warehouse Items", style: TextStyle(color: Colors.white60, fontSize: 9)),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Record Sale Form
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
                  Text("Instant Sale & Delivery Generator", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
              const SizedBox(height: 4),
              const Text("Record an offline or custom sale to instantly generate and copy the official /delivery/[token] secure unlock link for the client.", style: TextStyle(color: Colors.grey, fontSize: 11)),
              const SizedBox(height: 16),

              TextField(
                controller: _productNameCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Product / Service / Account Name",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),

              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _amountCtrl,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: "Price (\$ USD)",
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                        filled: true,
                        fillColor: Colors.white.withValues(alpha: 0.05),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _customerEmailCtrl,
                      keyboardType: TextInputType.emailAddress,
                      style: const TextStyle(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        labelText: "Buyer Email",
                        labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                        filled: true,
                        fillColor: Colors.white.withValues(alpha: 0.05),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              TextField(
                controller: _credentialsCtrl,
                maxLines: 2,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Account Login Credentials / Delivery Note (e.g. user:pass:email)",
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
                  onPressed: _isSavingSale ? null : _recordSale,
                  child: _isSavingSale
                      ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                      : const Text("RECORD SALE & AUTO-COPY DELIVERY LINK", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1)),
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
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text("DELIVERY LINK (COPIED TO CLIPBOARD)", style: TextStyle(color: Color(0xFF00FF88), fontSize: 10, fontWeight: FontWeight.bold)),
                          GestureDetector(
                            onTap: () {
                              Clipboard.setData(ClipboardData(text: _generatedDeliveryUrl!));
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Copied to clipboard!")));
                            },
                            child: const Icon(Icons.copy, size: 16, color: Color(0xFF00FF88)),
                          ),
                        ],
                      ),
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
    );
  }

  // 2. INVENTORY & WAREHOUSE
  Widget _buildInventoryTab() {
    final filtered = _inventoryItems.where((item) {
      final name = (item['name'] ?? '').toString().toLowerCase();
      final desc = (item['description'] ?? '').toString().toLowerCase();
      final q = _inventorySearch.toLowerCase();
      return q.isEmpty || name.contains(q) || desc.contains(q);
    }).toList();

    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF00FF88),
        onPressed: _showAddProductDialog,
        icon: const Icon(Icons.add, color: Colors.black),
        label: const Text("NEW PRODUCT", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              onChanged: (v) => setState(() => _inventorySearch = v),
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: InputDecoration(
                hintText: "Search warehouse products & stock...",
                hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                prefixIcon: const Icon(Icons.search, color: Color(0xFF00FF88), size: 18),
                filled: true,
                fillColor: const Color(0xFF111111),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              ),
            ),
          ),
          Expanded(
            child: _isLoadingInventory
                ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
                : filtered.isEmpty
                    ? const Center(child: Text("No products found in warehouse.", style: TextStyle(color: Colors.grey)))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: filtered.length,
                        itemBuilder: (ctx, i) {
                          final item = filtered[i];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: const Color(0xFF111111),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(item['name'] ?? 'Product', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                                      const SizedBox(height: 4),
                                      Text(item['description'] ?? 'Instant digital credentials.', style: const TextStyle(color: Colors.grey, fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
                                    ],
                                  ),
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text("\$${item['price'] ?? '0.00'}", style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 15)),
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: const Color(0xFF00FF88).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                                      child: const Text("IN STOCK", style: TextStyle(color: Color(0xFF00FF88), fontSize: 8, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  // 3. ORDERS & DELIVERIES
  Widget _buildOrdersTab() {
    return _isLoadingOrders
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
        : _recentSales.isEmpty
            ? const Center(child: Text("No recorded orders or delivery tokens yet.", style: TextStyle(color: Colors.grey)))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _recentSales.length,
                itemBuilder: (ctx, i) {
                  final sale = _recentSales[i];
                  final token = sale['deliveryToken'] ?? sale['token'] ?? 'del_${sale['id']}';
                  final deliveryUrl = "https://officialum1.com/delivery/$token";

                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111111),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(child: Text(sale['description'] ?? sale['productName'] ?? 'Digital Asset Sale', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13), overflow: TextOverflow.ellipsis)),
                            Text("\$${sale['amount'] ?? '0.00'}", style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 14)),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text("Processed by: ${sale['processedBy'] ?? 'Admin'} • ${sale['date'] ?? 'Recent'}", style: const TextStyle(color: Colors.grey, fontSize: 10)),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(8)),
                                child: Text(deliveryUrl, style: const TextStyle(color: Color(0xFF00FF88), fontSize: 10, overflow: TextOverflow.ellipsis)),
                              ),
                            ),
                            const SizedBox(width: 8),
                            IconButton(
                              icon: const Icon(Icons.copy, size: 18, color: Color(0xFF00FF88)),
                              onPressed: () {
                                Clipboard.setData(ClipboardData(text: deliveryUrl));
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Delivery link copied to clipboard!")));
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              );
  }

  // 4. CRM LEADS
  Widget _buildLeadsTab() {
    return _isLoadingLeads
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
        : _leadsList.isEmpty
            ? const Center(child: Text("No incoming CRM leads yet.", style: TextStyle(color: Colors.grey)))
            : ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _leadsList.length,
                itemBuilder: (ctx, i) {
                  final lead = _leadsList[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF111111),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(lead['email'] ?? 'Client Email', style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold, fontSize: 13)),
                            Text(lead['service'] ?? 'High-Ticket Quote', style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        ),
                        if (lead['domain'] != null && lead['domain'].toString().isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text("Domain: ${lead['domain']}", style: const TextStyle(color: Colors.white, fontSize: 12)),
                        ],
                        if (lead['notes'] != null && lead['notes'].toString().isNotEmpty) ...[
                          const SizedBox(height: 4),
                          Text("Notes: ${lead['notes']}", style: const TextStyle(color: Colors.grey, fontSize: 11)),
                        ],
                      ],
                    ),
                  );
                },
              );
  }

  // 5. REVIEWS & SEO
  Widget _buildReviewsAndSeoTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Action Bar
        Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00FF88),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _showAddReviewDialog,
                icon: const Icon(Icons.add_comment, color: Colors.black, size: 16),
                label: const Text("ADD 5⭐ REVIEW", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        const Text("MODERATE CLIENT REVIEWS", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
        const SizedBox(height: 12),

        if (_isLoadingReviews)
          const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
        else if (_reviewsList.isEmpty)
          const Center(child: Text("No reviews loaded yet.", style: TextStyle(color: Colors.grey)))
        else
          ..._reviewsList.map((rev) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF111111),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(rev['author'] ?? 'Client', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        const Row(
                          children: [
                            Icon(Icons.star, color: Colors.amber, size: 14),
                            Icon(Icons.star, color: Colors.amber, size: 14),
                            Icon(Icons.star, color: Colors.amber, size: 14),
                            Icon(Icons.star, color: Colors.amber, size: 14),
                            Icon(Icons.star, color: Colors.amber, size: 14),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(rev['text'] ?? 'Great service and fast delivery.', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                  ],
                ),
              )),
      ],
    );
  }

  // 6. FULL WEB ADMIN PORTAL
  Widget _buildWebPortalTab() {
    return Stack(
      children: [
        WebViewWidget(controller: _webViewController),
        if (_isLoadingWeb)
          const Center(
            child: CircularProgressIndicator(color: Color(0xFF00FF88)),
          ),
      ],
    );
  }
}
