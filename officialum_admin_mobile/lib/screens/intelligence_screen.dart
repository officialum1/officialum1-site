import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'main_navigation_container.dart';

class IntelligenceScreen extends StatefulWidget {
  const IntelligenceScreen({super.key});

  @override
  State<IntelligenceScreen> createState() => _IntelligenceScreenState();
}

class _IntelligenceScreenState extends State<IntelligenceScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List _logs = [];

  @override
  void initState() {
    super.initState();
    _fetchIntelligence();
  }

  Future<void> _fetchIntelligence() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/admin/inventory?action=get_activity');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() => _logs = data);
      }
    } catch (e) {
      debugPrint('Error fetching intelligence: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('DATA INTELLIGENCE', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: _fetchIntelligence, icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : _logs.isEmpty
              ? const Center(child: Text('No activity data found', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _logs.length,
                  itemBuilder: (context, index) {
                    final log = _logs[index];
                    return _buildActivityCard(log);
                  },
                ),
    );
  }

  Widget _buildActivityCard(Map<String, dynamic> log) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.03)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: const Color(0xFF00FF88).withOpacity(0.1), shape: BoxShape.circle),
            child: const Icon(Icons.insights, color: Color(0xFF00FF88), size: 16),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  log['action']?.toUpperCase() ?? 'ACTION',
                  style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 1),
                ),
                const SizedBox(height: 4),
                Text(
                  log['description'] ?? 'No description provided',
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                ),
                const SizedBox(height: 6),
                Text(
                  log['date'] ?? '',
                  style: const TextStyle(color: Colors.white24, fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
