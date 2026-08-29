import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';

class LeadsManagementScreen extends StatefulWidget {
  const LeadsManagementScreen({super.key});

  @override
  State<LeadsManagementScreen> createState() => _LeadsManagementScreenState();
}

class _LeadsManagementScreenState extends State<LeadsManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchLeads();
    });
  }

  @override
  Widget build(BuildContext context) {
    final leads = context.watch<MainProvider>().leads;
    final isLoading = context.watch<MainProvider>().isLoadingContent;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('LEADS / CRM', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
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
            onPressed: () => context.read<MainProvider>().fetchLeads(),
            icon: const Icon(Icons.refresh, color: Color(0xFF00FF88)),
          ),
        ],
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : leads.isEmpty
              ? const Center(child: Text('No leads found', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: leads.length,
                  itemBuilder: (context, index) {
                    final lead = leads[index];
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
                                child: Text(lead.email, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              ),
                              Text(lead.date.split('T')[0], style: const TextStyle(color: Colors.grey, fontSize: 10)),
                            ],
                          ),
                          if (lead.phone != null && lead.phone!.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                const Icon(Icons.phone, color: Color(0xFF00FF88), size: 12),
                                const SizedBox(width: 5),
                                Text(lead.phone!, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                              ],
                            ),
                          ],
                          if (lead.source != null) ...[
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Text(
                                lead.source!.toUpperCase(),
                                style: const TextStyle(color: Colors.blue, fontSize: 9, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddLeadDialog(context),
        backgroundColor: const Color(0xFF00FF88),
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  void _showAddLeadDialog(BuildContext context) {
    final emailCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final sourceCtrl = TextEditingController(text: 'Manual');

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('ADD NEW LEAD', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: emailCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(labelText: 'EMAIL', labelStyle: TextStyle(color: Colors.grey, fontSize: 10)),
            ),
            TextField(
              controller: phoneCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(labelText: 'PHONE', labelStyle: TextStyle(color: Colors.grey, fontSize: 10)),
            ),
            TextField(
              controller: sourceCtrl,
              style: const TextStyle(color: Colors.white, fontSize: 13),
              decoration: const InputDecoration(labelText: 'SOURCE', labelStyle: TextStyle(color: Colors.grey, fontSize: 10)),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () async {
              final success = await context.read<MainProvider>().addContent('/leads', {
                'email': emailCtrl.text,
                'phone': phoneCtrl.text,
                'source': sourceCtrl.text,
              });
              if (success && mounted) Navigator.pop(context);
            },
            child: const Text('SAVE', style: TextStyle(color: Colors.black)),
          ),
        ],
      ),
    );
  }
}
