import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';
import '../models/app_models.dart';
import '../services/api_service.dart';

class PlayerUpHubScreen extends StatefulWidget {
  const PlayerUpHubScreen({super.key});

  @override
  State<PlayerUpHubScreen> createState() => _PlayerUpHubScreenState();
}

class _PlayerUpHubScreenState extends State<PlayerUpHubScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchPlayerUpListings();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MainProvider>();
    final listings = provider.playerUpListings;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('PLAYERUP LISTINGS', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 16)),
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
            onPressed: () async {
              showDialog(context: context, barrierDismissible: false, builder: (c) => const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88))));
              try {
                final res = await ApiService().post('/admin/playerup', {'action': 'cloud_fetch'});
                Navigator.pop(context); // Close loader
                if (res.statusCode == 200) {
                   provider.fetchPlayerUpListings();
                   ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Synced listings with PlayerUp!'), backgroundColor: Color(0xFF00FF88)));
                }
              } catch (e) {
                Navigator.pop(context);
              }
            }, 
            icon: const Icon(Icons.cloud_download, color: Color(0xFF00FF88))
          ),
          IconButton(
            onPressed: () => provider.fetchPlayerUpListings(),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: provider.isLoadingPlayerUp
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : listings.isEmpty
              ? const Center(child: Text('No PlayerUp listings found', style: TextStyle(color: Colors.grey)))
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

  Widget _buildListingCard(PlayerUpListing item) {
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
              if (item.autoBump)
                const Icon(Icons.bolt, color: Colors.yellow, size: 16),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            item.title,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('LAST BUMPED', style: TextStyle(color: Colors.grey, fontSize: 9, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text(
                    item.lastBumped != null 
                      ? DateFormat('MMM dd, HH:mm').format(DateTime.parse(item.lastBumped!))
                      : 'Never', 
                    style: const TextStyle(fontSize: 12, color: Colors.white70)
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  const Text('PLATFORM', style: TextStyle(color: Colors.grey, fontSize: 9, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text(item.platform, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF00CCFF))),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
