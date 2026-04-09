import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'main_navigation_container.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  List _tickets = [];

  @override
  void initState() {
    super.initState();
    _fetchTickets();
  }

  Future<void> _fetchTickets() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/admin/inventory?action=get_tickets');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() => _tickets = data);
      }
    } catch (e) {
      debugPrint('Error fetching tickets: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('SUPPORT TICKETS', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: _fetchTickets, icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : _tickets.isEmpty
              ? const Center(child: Text('No support tickets', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _tickets.length,
                  itemBuilder: (context, index) {
                    final ticket = _tickets[index];
                    return _buildTicketCard(ticket);
                  },
                ),
    );
  }

  Widget _buildTicketCard(Map<String, dynamic> ticket) {
    String status = ticket['status'] ?? 'Open';
    Color statusColor = status.toLowerCase() == 'open' ? Colors.green : Colors.grey;

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
              Text(
                'TICKET #${ticket['id'] ?? '??'}',
                style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 1),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            ticket['subject'] ?? 'No Subject',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 6),
          Text(
            ticket['user_email'] ?? 'Unknown User',
            style: const TextStyle(color: Colors.white54, fontSize: 12),
          ),
          const SizedBox(height: 12),
          Text(
            ticket['message'] ?? '',
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(color: Colors.grey, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
