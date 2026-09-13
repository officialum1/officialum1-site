import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../services/api_service.dart';
import 'main_navigation_container.dart';

class ClientReviewsScreen extends StatefulWidget {
  const ClientReviewsScreen({super.key});

  @override
  State<ClientReviewsScreen> createState() => _ClientReviewsScreenState();
}

class _ClientReviewsScreenState extends State<ClientReviewsScreen> {
  final ApiService _api = ApiService();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchTestimonials();
    });
  }

  void _showAddReviewDialog() {
    final nameCtrl = TextEditingController();
    final reviewCtrl = TextEditingController();
    int rating = 5;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFF111111),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFF00FF88))),
          title: const Text("Write a Review", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Your Name or Brand",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Text("Rating: ", style: TextStyle(color: Colors.grey, fontSize: 12)),
                  ...List.generate(5, (idx) => IconButton(
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    icon: Icon(
                      Icons.star,
                      size: 24,
                      color: idx < rating ? Colors.amber : Colors.grey.shade700,
                    ),
                    onPressed: () => setDialogState(() => rating = idx + 1),
                  )),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: reviewCtrl,
                maxLines: 3,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Your Experience / Feedback",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
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
              onPressed: () async {
                if (nameCtrl.text.trim().isEmpty || reviewCtrl.text.trim().isEmpty) return;
                Navigator.pop(ctx);
                try {
                  await _api.post('/testimonials', {
                    'name': nameCtrl.text.trim(),
                    'rating': rating,
                    'review': reviewCtrl.text.trim(),
                  });
                  if (mounted) {
                    context.read<MainProvider>().fetchTestimonials();
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                      content: Text("Thank you! Your verified review has been submitted."),
                      backgroundColor: Color(0xFF00FF88),
                    ));
                  }
                } catch (e) {
                  // Error handling
                }
              },
              child: const Text("SUBMIT REVIEW", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final reviews = context.watch<MainProvider>().testimonials;
    final isLoading = context.watch<MainProvider>().isLoadingContent;

    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      appBar: AppBar(
        title: const Text('VERIFIED REVIEWS & PROOF', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.w900, fontSize: 14)),
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
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // Top Summary Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF161616), Color(0xFF0D0D0D)]),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white.withOpacity(0.08)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Row(
                            children: [
                              Text("4.9", style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                              SizedBox(width: 8),
                              Icon(Icons.star, color: Colors.amber, size: 28),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text("Over 5,000+ Verified Orders", style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF00FF88),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                        ),
                        onPressed: _showAddReviewDialog,
                        icon: const Icon(Icons.rate_review, size: 16, color: Colors.black),
                        label: const Text("ADD REVIEW", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                const Text("CUSTOMER TESTIMONIALS", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
                const SizedBox(height: 12),

                if (reviews.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(32),
                    alignment: Alignment.center,
                    child: const Text("No reviews found yet. Be the first to leave a review!", style: TextStyle(color: Colors.grey)),
                  )
                else
                  ...reviews.map((review) => Container(
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
                                size: 13,
                                color: idx < review.rating ? Colors.amber : Colors.grey.shade800,
                              )),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(review.review, style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            const Icon(Icons.verified, size: 12, color: Color(0xFF00FF88)),
                            const SizedBox(width: 4),
                            Text("Verified OfficialUM1 Client", style: TextStyle(color: Colors.grey.shade500, fontSize: 10)),
                          ],
                        ),
                      ],
                    ),
                  )),
              ],
            ),
    );
  }
}
