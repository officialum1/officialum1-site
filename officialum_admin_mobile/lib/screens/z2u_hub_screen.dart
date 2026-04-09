import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';
import '../models/app_models.dart';
import '../services/api_service.dart';

class Z2UHubScreen extends StatefulWidget {
  const Z2UHubScreen({super.key});

  @override
  State<Z2UHubScreen> createState() => _Z2UHubScreenState();
}

class _Z2UHubScreenState extends State<Z2UHubScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchZ2UListings();
    });
  }

  Future<void> _fetchZ2UListings() async {
    // Note: Z2U listings are currently handled generically in some places, 
    // but we'll use a specific fetch here if the provider supports it.
    // For now, we'll hit the API directly to ensure specific data.
    context.read<MainProvider>().fetchZ2UListings();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MainProvider>();
    final listings = provider.z2uListings;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Z2U HUB', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 16)),
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
            onPressed: () => _showBatchActions(context),
            icon: const Icon(Icons.bolt, color: Colors.orangeAccent),
            tooltip: 'Satellite Bulk Controls',
          ),
          IconButton(
            onPressed: _fetchZ2UListings,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: provider.isLoadingZ2U
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : listings.isEmpty
              ? const Center(child: Text('No Z2U listings found', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: listings.length,
                  itemBuilder: (context, index) {
                    final item = listings[index];
                    return _buildListingCard(item);
                  },
                ),
    );
  }

  Widget _buildListingCard(Z2UListing item) {
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
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (item.status == 'Active' ? const Color(0xFF00FF88) : Colors.orange).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  item.status.toUpperCase(),
                  style: TextStyle(
                    color: item.status == 'Active' ? const Color(0xFF00FF88) : Colors.orange, 
                    fontWeight: FontWeight.bold, 
                    fontSize: 10,
                    letterSpacing: 1
                  ),
                ),
              ),
              Text(
                '\$${item.price}', 
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            item.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white70),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('STOCK', style: TextStyle(color: Colors.grey, fontSize: 9, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text(item.stock, style: const TextStyle(fontSize: 12, color: Colors.white)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('SYNCED', style: TextStyle(color: Colors.grey, fontSize: 9, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text(
                    DateFormat('MMM dd, HH:mm').format(DateTime.parse(item.lastSync)),
                    style: const TextStyle(fontSize: 10, color: Colors.grey)
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showBatchActions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF111111),
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Z2U SATELLITE BULK CONTROLS', style: TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 2, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            _buildActionButton(
              title: '🚀 BUMP (SORT) ALL',
              subtitle: 'Immediate platform sort/bump',
              icon: Icons.rocket_launch,
              color: const Color(0xFF00CCFF),
              onTap: () => _executeBatchAction(context, 'sort'),
            ),
            const SizedBox(height: 12),
            _buildActionButton(
              title: '📅 EXTEND DURATION',
              subtitle: 'Extend all active listing durations',
              icon: Icons.timer,
              color: const Color(0xFF00FF88),
              onTap: () => _executeBatchAction(context, 'extend'),
            ),
             const SizedBox(height: 12),
            _buildActionButton(
              title: '🗑️ BATCH DELETE ALL',
              subtitle: 'Remove selected from platform',
              icon: Icons.delete_forever,
              color: Colors.redAccent,
              onTap: () => _executeBatchAction(context, 'delete'),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildActionButton({required String title, required String subtitle, required IconData icon, required Color color, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: color.withOpacity(0.2)),
          borderRadius: BorderRadius.circular(12),
          color: color.withOpacity(0.05),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 28),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
                  Text(subtitle, style: const TextStyle(color: Colors.grey, fontSize: 11)),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
          ],
        ),
      ),
    );
  }

  void _executeBatchAction(BuildContext context, String type) async {
    Navigator.pop(context); // Close bottom sheet
    
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: Text('Confirm ${type.toUpperCase()}?', style: const TextStyle(color: Colors.white)),
        content: Text('Trigger satellite operation on all Z2U listings. Continue?', style: const TextStyle(color: Colors.grey)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('CANCEL')),
          TextButton(
            onPressed: () => Navigator.pop(context, true), 
            child: Text(type.toUpperCase(), style: TextStyle(color: type == 'delete' ? Colors.red : const Color(0xFF00CCFF)))
          ),
        ],
      ),
    );

    if (confirm != true) return;

    showDialog(context: context, barrierDismissible: false, builder: (c) => const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88))));
    
    try {
      final res = await ApiService().post('/admin/z2u', {
        'action': 'batch_action',
        'type': type,
      });
      
      Navigator.pop(context); // Close loader
      
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Z2U Satellite ${type.toUpperCase()} command dispatched!'),
          backgroundColor: const Color(0xFF00CCFF),
        ));
      } else {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to dispatch command.'), backgroundColor: Colors.red));
      }
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red));
    }
  }
}
