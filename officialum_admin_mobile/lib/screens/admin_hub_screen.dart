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
    'total_sales': '0.00',
    'orders_count': '0',
    'products_count': '0',
    'leads_count': '0'
  };

  // Record Sale Form
  final _customerEmailCtrl = TextEditingController();
  final _productNameCtrl = TextEditingController();
  final _amountCtrl = TextEditingController();
  final _credentialsCtrl = TextEditingController();
  bool _isSavingSale = false;
  String? _generatedDeliveryUrl;

  // Inventory
  List _inventoryItems = [];
  bool _isLoadingInventory = false;

  // Leads CRM
  List _leadsList = [];
  bool _isLoadingLeads = false;

  // Web Admin Controller
  late WebViewController _webViewController;
  bool _isLoadingWeb = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 1 && _inventoryItems.isEmpty) _fetchInventory();
      if (_tabController.index == 2 && _leadsList.isEmpty) _fetchLeads();
    });

    _initWebController();
    _fetchStats();
    _fetchInventory();
  }

  void _initWebController() {
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF050505))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) => setState(() => _isLoadingWeb = true),
          onPageFinished: (url) => setState(() => _isLoadingWeb = false),
        ),
      )
      ..loadRequest(Uri.parse("https://officialum1.com/admin"));
  }

  Future<void> _fetchStats() async {
    setState(() => _isLoadingStats = true);
    try {
      final res = await _api.get('/admin/stats');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) setState(() => _stats = data is Map<String, dynamic> ? data : _stats);
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
                "Sale recorded! Delivery link copied to clipboard:\n$deliveryUrl",
                style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          );
        }
      }
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

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFF00FF88))),
        title: const Text("Add New Product", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
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
                labelText: "Price (\$ USD)",
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
                labelText: "Description",
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
              if (nameCtrl.text.trim().isEmpty || priceCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              try {
                await _api.post('/products', {
                  'name': nameCtrl.text.trim(),
                  'price': double.tryParse(priceCtrl.text.trim()) ?? 0.0,
                  'description': descCtrl.text.trim(),
                });
                _fetchInventory();
              } catch (e) {
                // Ignore
              }
            },
            child: const Text("SAVE PRODUCT", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
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
        title: const Text('ADMIN COMMAND PANEL', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.w900, fontSize: 13, color: Color(0xFF00FF88))),
        backgroundColor: const Color(0xFF0A0A0A),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF00FF88)),
          onPressed: widget.onBackToClient ?? () => AppShell.scaffoldKey.currentState?.openDrawer(),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF00FF88),
          labelColor: const Color(0xFF00FF88),
          unselectedLabelColor: Colors.grey,
          labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 0.5),
          tabs: const [
            Tab(icon: Icon(Icons.flash_on, size: 18), text: 'SELL & LINK'),
            Tab(icon: Icon(Icons.inventory_2, size: 18), text: 'STOCK'),
            Tab(icon: Icon(Icons.contact_mail, size: 18), text: 'CRM LEADS'),
            Tab(icon: Icon(Icons.language, size: 18), text: 'WEB PORTAL'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: QUICK SELL & DELIVERY LINK
          _buildQuickSellTab(),

          // TAB 2: INVENTORY STOCK
          _buildInventoryTab(),

          // TAB 3: CRM LEADS
          _buildLeadsTab(),

          // TAB 4: WEB ADMIN PORTAL
          _buildWebPortalTab(),
        ],
      ),
    );
  }

  Widget _buildQuickSellTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Live Analytics Strip
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF111111),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              Column(
                children: [
                  Text("\$${_stats['total_sales'] ?? '0.00'}", style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 2),
                  const Text("Gross Revenue", style: TextStyle(color: Colors.grey, fontSize: 9)),
                ],
              ),
              Container(width: 1, height: 30, color: Colors.white12),
              Column(
                children: [
                  Text("${_stats['orders_count'] ?? '0'}", style: const TextStyle(color: Color(0xFF00CCFF), fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 2),
                  const Text("Total Orders", style: TextStyle(color: Colors.grey, fontSize: 9)),
                ],
              ),
              Container(width: 1, height: 30, color: Colors.white12),
              Column(
                children: [
                  Text("${_inventoryItems.length}", style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.w900, fontSize: 16)),
                  const SizedBox(height: 2),
                  const Text("Stock Items", style: TextStyle(color: Colors.grey, fontSize: 9)),
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
                  Text("Instant Sale & Auto-Delivery Generator", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                ],
              ),
              const SizedBox(height: 6),
              const Text("Record a sale to automatically generate and copy the /delivery/[token] secure link to clipboard.", style: TextStyle(color: Colors.grey, fontSize: 11)),
              const SizedBox(height: 16),

              TextField(
                controller: _productNameCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Product / Account Name",
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
                  labelText: "Credentials / Account Login Data",
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
    );
  }

  Widget _buildInventoryTab() {
    return Scaffold(
      backgroundColor: Colors.transparent,
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF00FF88),
        onPressed: _showAddProductDialog,
        icon: const Icon(Icons.add, color: Colors.black),
        label: const Text("NEW PRODUCT", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
      ),
      body: _isLoadingInventory
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _inventoryItems.length,
              itemBuilder: (ctx, i) {
                final item = _inventoryItems[i];
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
                      Text("\$${item['price'] ?? '0.00'}", style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 15)),
                    ],
                  ),
                );
              },
            ),
    );
  }

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
                            Text(lead['service'] ?? 'Quote', style: const TextStyle(color: Colors.white70, fontSize: 10, fontWeight: FontWeight.bold)),
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
