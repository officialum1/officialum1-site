import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'package:intl/intl.dart';
import 'main_navigation_container.dart';

class GenericListScreen extends StatefulWidget {
  final String module;
  final String endpoint;

  const GenericListScreen({super.key, required this.module, required this.endpoint});

  @override
  State<GenericListScreen> createState() => _GenericListScreenState();
}

class _GenericListScreenState extends State<GenericListScreen> {
  List _items = [];
  bool _isLoading = true;
  final ApiService _api = ApiService();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  @override
  void didUpdateWidget(GenericListScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.endpoint != widget.endpoint) {
      _fetchData();
    }
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get(widget.endpoint);
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _items = data is List ? data : (data['data'] ?? []);
        });
      }
    } catch (e) {
      debugPrint('Error fetching ${widget.module}: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text('${widget.module.toUpperCase()} HUB', style: const TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: _fetchData, icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : _items.isEmpty
              ? Center(child: Text('No ${widget.module} found', style: const TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _items.length,
                  itemBuilder: (context, index) {
                    final item = _items[index];
                    return _buildItemCard(item);
                  },
                ),
    );
  }

  Widget _buildItemCard(Map<String, dynamic> item) {
    // Determine title and subtitle based on common fields
    String title = item['name'] ?? item['title'] ?? item['email'] ?? item['description'] ?? 'No Title';
    String subtitle = item['phone'] ?? item['category'] ?? item['status'] ?? item['date'] ?? '';
    String thirdRow = item['message'] ?? item['product_name'] ?? item['amount']?.toString() ?? '';

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
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (item['status'] != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getStatusColor(item['status']).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(5),
                  ),
                  child: Text(
                    item['status'].toString().toUpperCase(),
                    style: TextStyle(color: _getStatusColor(item['status']), fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          if (subtitle.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 12)),
          ],
          if (thirdRow.isNotEmpty) ...[
            const SizedBox(height: 8),
            Text(thirdRow, style: const TextStyle(color: Color(0xFF00FF88), fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ],
      ),
    );
  }

  Color _getStatusColor(dynamic status) {
    status = status.toString().toLowerCase();
    if (status.contains('active') || status.contains('paid') || status.contains('verified')) return const Color(0xFF00FF88);
    if (status.contains('pending') || status.contains('away')) return Colors.orange;
    if (status.contains('inactive') || status.contains('failed')) return Colors.red;
    return Colors.blue;
  }
}
