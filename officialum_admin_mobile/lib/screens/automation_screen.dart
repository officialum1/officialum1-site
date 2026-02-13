import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:workmanager/workmanager.dart';
import '../providers/main_provider.dart';

class AutomationScreen extends StatefulWidget {
  const AutomationScreen({super.key});

  @override
  State<AutomationScreen> createState() => _AutomationScreenState();
}

class _AutomationScreenState extends State<AutomationScreen> {
  bool _isAutoBumpEnabled = false;
  static const String bumpTask = "com.officialum1.bump_threads";

  @override
  void initState() {
    super.initState();
    // In a real app, you'd check if the task is already scheduled
  }

  void _toggleAutoBump(bool value) {
    setState(() => _isAutoBumpEnabled = value);
    if (value) {
      Workmanager().registerPeriodicTask(
        "1", 
        bumpTask,
        frequency: const Duration(hours: 1), // Android minimum is 15 mins
        constraints: Constraints(networkType: NetworkType.connected),
      );
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Auto-Bump scheduled (every 1 hour)')));
    } else {
      Workmanager().cancelByUniqueName("1");
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Auto-Bump disabled')));
    }
  }

  Future<void> _manualBump() async {
    showDialog(context: context, barrierDismissible: false, builder: (c) => const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88))));
    
    final result = await context.read<MainProvider>().bumpThreads();
    
    Navigator.pop(context); // Close loader
    
    if (result['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Successfully bumped ${result['bumped']} threads!'),
        backgroundColor: Colors.green,
      ));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('Error: ${result['error'] ?? 'Unknown error'}'),
        backgroundColor: Colors.red,
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('AUTOMATION & BUMPING', style: TextStyle(fontSize: 14, letterSpacing: 2, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.black,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => Scaffold.of(context).openDrawer(),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          _buildFeatureCard(
            title: 'PLAYERUP AUTO-BUMP',
            description: 'Run threads in the background. Threads will be bumped periodically even if the app is closed.',
            icon: Icons.auto_mode,
            trailing: Switch(
              value: _isAutoBumpEnabled,
              activeColor: const Color(0xFF00FF88),
              onChanged: _toggleAutoBump,
            ),
          ),
          const SizedBox(height: 20),
          _buildFeatureCard(
            title: 'MANUAL BUMP ALL',
            description: 'Instantly trigger a bump for all your PlayerUp listings right now.',
            icon: Icons.rocket_launch,
            onTap: _manualBump,
          ),
          const SizedBox(height: 40),
          const Text(
            'SYSTEM STATUS',
            style: TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 15),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Column(
              children: [
                _buildStatusRow('Background Service', 'ACTIVE', Colors.green),
                const Divider(height: 30, color: Colors.white10),
                _buildStatusRow('Workmanager', 'READY', Colors.green),
                const Divider(height: 30, color: Colors.white10),
                _buildStatusRow('Last Sync', 'JUST NOW', Colors.white54),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({required String title, required String description, required IconData icon, Widget? trailing, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF111111),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF00FF88).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: const Color(0xFF00FF88), size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  const SizedBox(height: 4),
                  Text(description, style: TextStyle(color: Colors.grey.shade600, fontSize: 11)),
                ],
              ),
            ),
            if (trailing != null) trailing,
          ],
        ),
      ),
    );
  }

  Widget _buildStatusRow(String label, String value, Color color) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        Text(value, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }
}
