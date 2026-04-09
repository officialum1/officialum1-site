import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../models/app_models.dart';

class KBManagementScreen extends StatefulWidget {
  const KBManagementScreen({super.key});

  @override
  State<KBManagementScreen> createState() => _KBManagementScreenState();
}

class _KBManagementScreenState extends State<KBManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => context.read<MainProvider>().fetchKB());
  }

  @override
  Widget build(BuildContext context) {
    final list = context.watch<MainProvider>().kbArticles;
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('KNOWLEDGE BASE', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: list.isEmpty
          ? const Center(child: Text('No KB articles found', style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (context, index) {
                final kb = list[index];
                return _buildKBCard(context, kb);
              },
            ),
    );
  }

  Widget _buildKBCard(BuildContext context, KBArticle kb) {
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
              Expanded(child: Text(kb.title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(4)),
                child: Text(kb.category, style: const TextStyle(color: Colors.white54, fontSize: 10)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(kb.content, style: const TextStyle(color: Colors.white38, fontSize: 12), maxLines: 3, overflow: TextOverflow.ellipsis),
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.centerRight,
            child: IconButton(
              icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
              onPressed: () => _confirmDelete(context, kb),
            ),
          )
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, KBArticle kb) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('DELETE ARTICLE', style: TextStyle(color: Colors.white)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          TextButton(onPressed: () async {
            final success = await context.read<MainProvider>().deleteItem('/kb', kb.id);
            if (success) Navigator.pop(context);
          }, child: const Text('DELETE', style: TextStyle(color: Colors.red))),
        ],
      ),
    );
  }
}
