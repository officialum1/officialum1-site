import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';
import '../models/app_models.dart';

class SupportTicketsScreen extends StatefulWidget {
  const SupportTicketsScreen({super.key});

  @override
  State<SupportTicketsScreen> createState() => _SupportTicketsScreenState();
}

class _SupportTicketsScreenState extends State<SupportTicketsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchTickets();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MainProvider>();
    final tickets = provider.tickets;

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
          IconButton(onPressed: () => provider.fetchTickets(), icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: provider.isLoadingProducts // Reuse
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : tickets.isEmpty
              ? const Center(child: Text('No active tickets', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: tickets.length,
                  itemBuilder: (context, index) {
                    final ticket = tickets[index];
                    return _buildTicketCard(ticket);
                  },
                ),
    );
  }

  Widget _buildTicketCard(Ticket ticket) {
    Color statusColor = ticket.status.toLowerCase() == 'open' ? Colors.green : Colors.grey;

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
                ticket.subject,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                ticket.status.toUpperCase(),
                style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            ticket.userEmail,
            style: const TextStyle(color: Colors.grey, fontSize: 11),
          ),
          const SizedBox(height: 12),
          Text(
            ticket.message,
            style: const TextStyle(color: Colors.white70, fontSize: 13),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const Divider(height: 24, color: Colors.white10),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => _showReplyDialog(ticket),
                child: const Text('REPLY', style: TextStyle(color: Color(0xFF00FF88))),
              ),
              if (ticket.status.toLowerCase() == 'open')
                TextButton(
                  onPressed: () => _resolveTicket(ticket.id),
                  child: const Text('RESOLVE', style: TextStyle(color: Colors.blue)),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _resolveTicket(String id) async {
    final ok = await context.read<MainProvider>().resolveTicket(id, 'resolved');
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ticket resolved!')));
    }
  }

  void _showReplyDialog(Ticket ticket) {
    // Basic reply dialog placeholder
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('Reply to Ticket', style: TextStyle(color: Colors.white, fontSize: 15)),
        content: const TextField(
          style: TextStyle(color: Colors.white),
          decoration: InputDecoration(hintText: 'Enter your message...', hintStyle: TextStyle(color: Colors.grey)),
          maxLines: 3,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          ElevatedButton(
            onPressed: () {
              _resolveTicket(ticket.id); // Placeholder for actually sending reply
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88), foregroundColor: Colors.black),
            child: const Text('SEND'),
          ),
        ],
      ),
    );
  }
}
