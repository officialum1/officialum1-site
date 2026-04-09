import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'main_navigation_container.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final ApiService _api = ApiService();
  bool _isLoading = true;
  Map<String, dynamic> _settings = {};

  @override
  void initState() {
    super.initState();
    _fetchSettings();
  }

  Future<void> _fetchSettings() async {
    setState(() => _isLoading = true);
    try {
      final res = await _api.get('/admin/inventory?action=get_settings');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() => _settings = data);
      }
    } catch (e) {
      debugPrint('Error fetching settings: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('ADMIN SETTINGS', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF00FF88)))
          : ListView(
              padding: const EdgeInsets.all(20),
              children: [
                _buildSection('SYSTEM STATUS'),
                _buildSettingTile('Maintenance Mode', _settings['maintenance_mode'] == 'on', (v) {}),
                _buildSettingTile('Public Registration', _settings['allow_registration'] == 'on', (v) {}),
                
                const SizedBox(height: 30),
                _buildSection('PAYMENT GATEWAYS'),
                _buildSettingTile('Stripe Payments', true, (v) {}),
                _buildSettingTile('Crypto (Binance)', true, (v) {}),
                _buildSettingTile('Wallet System', true, (v) {}),

                const SizedBox(height: 50),
                Center(
                  child: Text(
                    'APP VERSION 1.2.0 (STABLE)',
                    style: TextStyle(color: Colors.white.withOpacity(0.1), fontSize: 10, letterSpacing: 1),
                  ),
                ),
                const SizedBox(height: 10),
                Center(
                  child: Text(
                    'CONNECTED TO OFFICIALUM1 API',
                    style: TextStyle(color: Colors.white.withOpacity(0.05), fontSize: 8, letterSpacing: 2),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildSection(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 15, left: 5),
      child: Text(title, style: const TextStyle(color: Color(0xFF00FF88), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1)),
    );
  }

  Widget _buildSettingTile(String title, bool value, Function(bool) onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14)),
        trailing: Switch(
          value: value, 
          onChanged: onChanged,
          activeColor: const Color(0xFF00FF88),
        ),
      ),
    );
  }
}
