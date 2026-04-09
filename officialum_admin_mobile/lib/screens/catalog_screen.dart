import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'main_navigation_container.dart';

class CatalogScreen extends StatefulWidget {
  const CatalogScreen({super.key});

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List _catalog = [];

  @override
  void initState() {
    super.initState();
    _fetchCatalog();
  }

  Future<void> _fetchCatalog() async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/products'); // Unified endpoint
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        if (mounted) setState(() => _catalog = data);
      }
    } catch (e) {
      debugPrint('Error fetching catalog: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _deleteProduct(String id) async {
    final res = await _api.post('/admin/inventory', {'action': 'delete_product', 'id': id});
    if (res.statusCode == 200) {
      _fetchCatalog();
    }
  }

  void _showAddProductDialog() {
    final nameCtrl = TextEditingController();
    final priceCtrl = TextEditingController();
    final platformCtrl = TextEditingController(text: 'Website');
    final stockCtrl = TextEditingController(text: '1');
    final imageCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('ADD TO CATALOG', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildField(nameCtrl, 'Product Name'),
              _buildField(priceCtrl, 'Price (\$)'),
              _buildField(platformCtrl, 'Platform'),
              _buildField(stockCtrl, 'Initial Stock'),
              _buildField(imageCtrl, 'Image URL'),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () async {
              final res = await _api.post('/products', {
                'name': nameCtrl.text,
                'price': priceCtrl.text,
                'platform': platformCtrl.text,
                'stock': stockCtrl.text,
                'image': imageCtrl.text,
              });
              if (res.statusCode == 200) {
                if (mounted) Navigator.pop(context);
                _fetchCatalog();
              }
            },
            child: const Text('ADD', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }

  Widget _buildField(TextEditingController ctrl, String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextField(
        controller: ctrl,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
          enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white12)),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('SHOP CATALOG', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: _fetchCatalog, icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
          IconButton(onPressed: _showAddProductDialog, icon: const Icon(Icons.add, color: Color(0xFF00FF88))),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : _catalog.isEmpty
              ? const Center(child: Text('Catalog is empty', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _catalog.length,
                  itemBuilder: (context, index) {
                    final item = _catalog[index];
                    return _buildProductCard(item);
                  },
                ),
    );
  }

  Widget _buildProductCard(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.black26,
              borderRadius: BorderRadius.circular(10),
              image: item['image'] != null && item['image'].toString().startsWith('http')
                ? DecorationImage(image: NetworkImage(item['image']), fit: BoxFit.cover)
                : null,
            ),
            child: (item['image'] == null || !item['image'].toString().startsWith('http')) 
              ? const Icon(Icons.shopping_bag, color: Colors.grey, size: 20) 
              : null,
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'] ?? 'No Name',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  item['platform'] ?? 'Website',
                  style: const TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 0.5),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      '\$${item['price']}',
                      style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 13),
                    ),
                    const Spacer(),
                    Text('STOCK: ${item['stock']}', style: const TextStyle(color: Colors.white38, fontSize: 10)),
                    const SizedBox(width: 10),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 18),
                      onPressed: () => _deleteProduct(item['id'].toString()),
                    )
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

