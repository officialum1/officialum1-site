import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'main_navigation_container.dart';

class VerificationsManagementScreen extends StatefulWidget {
  const VerificationsManagementScreen({super.key});

  @override
  State<VerificationsManagementScreen> createState() => _VerificationsManagementScreenState();
}

class _VerificationsManagementScreenState extends State<VerificationsManagementScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List _requests = [];

  @override
  void initState() {
    super.initState();
    _fetchRequests();
  }

  Future<void> _fetchRequests() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/admin/verification');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() => _requests = data is List ? data : []);
      }
    } catch (e) {
      debugPrint('Error fetching verifications: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _updateStatus(String id, String status) async {
    try {
      final res = await _api.post('/admin/verification', {
        'id': id,
        'status': status,
      });
      if (res.statusCode == 200) {
        _fetchRequests();
      }
    } catch (e) {
      debugPrint('Error updating verification: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('KYC VERIFICATIONS', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: _fetchRequests, icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : _requests.isEmpty
              ? const Center(child: Text('No pending requests', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _requests.length,
                  itemBuilder: (context, index) {
                    final req = _requests[index];
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
                              Text(req['user_email'] ?? 'Unknown User', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: (req['status'] == 'pending' ? Colors.orange : Colors.green).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(5),
                                ),
                                child: Text(
                                  req['status'].toString().toUpperCase(),
                                  style: TextStyle(color: req['status'] == 'pending' ? Colors.orange : Colors.green, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          if (req['document_image'] != null)
                             const Text('Document image attached', style: TextStyle(color: Colors.grey, fontSize: 11)),
                          const SizedBox(height: 15),
                          if (req['status'] == 'pending')
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white),
                                    onPressed: () => _updateStatus(req['id'].toString(), 'approved'),
                                    child: const Text('APPROVE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent, foregroundColor: Colors.white),
                                    onPressed: () => _updateStatus(req['id'].toString(), 'rejected'),
                                    child: const Text('REJECT', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                                  ),
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
}
