import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import 'main_navigation_container.dart';
import '../models/app_models.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchAppUsers();
    });
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<MainProvider>();
    final users = provider.appUsers;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('USER MANAGEMENT', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(onPressed: () => provider.fetchAppUsers(), icon: const Icon(Icons.refresh, color: Color(0xFF00FF88))),
        ],
      ),
      body: provider.isLoadingProducts // Reuse loading state
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : users.isEmpty
              ? const Center(child: Text('No users found', style: TextStyle(color: Colors.grey)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: users.length,
                  itemBuilder: (context, index) {
                    final user = users[index];
                    return _buildUserCard(user);
                  },
                ),
    );
  }

  Widget _buildUserCard(AppUser user) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: user.isBanned ? Colors.red : const Color(0xFF00FF88),
            child: Text(user.email[0].toUpperCase(), style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.email,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  user.role.toUpperCase(),
                  style: TextStyle(color: Colors.grey.shade600, fontSize: 10, letterSpacing: 1),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('\$${user.walletBalance.toStringAsFixed(2)}', style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold)),
              IconButton(
                onPressed: () => _toggleBan(user),
                icon: Icon(
                  user.isBanned ? Icons.lock_open : Icons.block,
                  color: user.isBanned ? Colors.green : Colors.red,
                  size: 20,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _toggleBan(AppUser user) async {
    final action = user.isBanned ? 'unban' : 'ban';
    final ok = await context.read<MainProvider>().manageUser(user.id, action);
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('User ${action}ned successfully!')));
    }
  }
}
