import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';

class ReviewsManagementScreen extends StatefulWidget {
  const ReviewsManagementScreen({super.key});

  @override
  State<ReviewsManagementScreen> createState() => _ReviewsManagementScreenState();
}

class _ReviewsManagementScreenState extends State<ReviewsManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchTestimonials();
    });
  }

  @override
  Widget build(BuildContext context) {
    final reviews = context.watch<MainProvider>().testimonials;
    final isLoading = context.watch<MainProvider>().isLoadingContent;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('REVIEWS CENTER', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
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
            onPressed: () => context.read<MainProvider>().fetchTestimonials(),
            icon: const Icon(Icons.refresh, color: Color(0xFF00FF88)),
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : reviews.isEmpty
              ? const Center(child: Text('No reviews found', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: reviews.length,
                  itemBuilder: (context, index) {
                    final review = reviews[index];
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
                              Text(review.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              Row(
                                children: List.generate(5, (idx) => Icon(
                                  Icons.star, 
                                  size: 12, 
                                  color: idx < review.rating ? Colors.amber : Colors.grey.shade800
                                )),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(review.review, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.end,
                            children: [
                              TextButton.icon(
                                onPressed: () => _confirmDelete(review.id),
                                icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 16),
                                label: const Text('DELETE', style: TextStyle(color: Colors.redAccent, fontSize: 10)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }

  void _confirmDelete(String id) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('DELETE REVIEW', style: TextStyle(color: Colors.white, fontSize: 14)),
        content: const Text('Are you sure you want to remove this review?', style: TextStyle(color: Colors.white70, fontSize: 12)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          TextButton(
            onPressed: () async {
              final success = await context.read<MainProvider>().deleteItem('/testimonials', id);
              if (success && mounted) {
                Navigator.pop(context);
                context.read<MainProvider>().fetchTestimonials();
              }
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
