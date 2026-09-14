import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'app_shell.dart';
import 'login_screen.dart';

class AccountScreen extends StatelessWidget {
  final VoidCallback? onOpenAdminHub;
  const AccountScreen({super.key, this.onOpenAdminHub});

  void _openWhatsApp(BuildContext context) {
    Clipboard.setData(const ClipboardData(text: "+923237102924"));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: Color(0xFF25D366),
        content: Text("WhatsApp Official Support (+92 323 7102924) copied to clipboard!", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final isAuth = auth.isAuthenticated;
    final userEmail = (auth.user?['email'] ?? '').toString();
    final isAdmin = isAuth && (auth.user?['role'] == 'admin' || userEmail.toLowerCase().contains('admin') || userEmail.toLowerCase().contains('officialum1'));

    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      appBar: AppBar(
        title: const Text('ACCOUNT & 24/7 SUPPORT', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.w900, fontSize: 14)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => AppShell.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // User Status Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: isAuth ? [const Color(0xFF002817), const Color(0xFF111111)] : [const Color(0xFF161616), const Color(0xFF0D0D0D)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: isAuth ? const Color(0xFF00FF88).withValues(alpha: 0.3) : Colors.white10),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: isAuth ? const Color(0xFF00FF88) : Colors.white12,
                  child: Icon(
                    isAuth ? Icons.verified_user : Icons.person_outline,
                    size: 30,
                    color: isAuth ? Colors.black : Colors.white,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  isAuth ? userEmail : 'OfficialUM1 Client Guest',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 4),
                Text(
                  isAuth ? 'Verified OfficialUM1 Client Member' : 'Sign in to sync purchase history and instant delivery tokens',
                  style: const TextStyle(color: Colors.grey, fontSize: 11),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                if (!isAuth)
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00FF88),
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () {
                      Navigator.push(context, MaterialPageRoute(builder: (c) => const LoginScreen()));
                    },
                    child: const Text("SIGN IN / REGISTER", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1)),
                  )
                else
                  OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: const BorderSide(color: Colors.redAccent),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: () => auth.logout(),
                    child: const Text("LOGOUT SESSION", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text("24/7 PRIORITY SUPPORT CHANNELS", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          const SizedBox(height: 12),

          // WhatsApp Support Button
          GestureDetector(
            onTap: () => _openWhatsApp(context),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF111111),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF25D366).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: const Color(0xFF25D366).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.chat_bubble_outline, color: Color(0xFF25D366), size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("24/7 WhatsApp VIP Support Desk", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text("+92 323 7102924 • Instant replies for orders & quotes", style: TextStyle(color: Colors.grey, fontSize: 11)),
                      ],
                    ),
                  ),
                  const Icon(Icons.copy, size: 16, color: Color(0xFF25D366)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Official Email Desk
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: const Color(0xFF00FF88).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.email_outlined, color: Color(0xFF00FF88), size: 24),
                ),
                const SizedBox(width: 14),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Official Email Desk", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                      Text("hello@officialum1.com • 24/7 ticketing & billing", style: TextStyle(color: Color(0xFF00FF88), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),
          const Text("CORPORATE REGISTRATION", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("OfficialUM1 LLC", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                SizedBox(height: 4),
                Text("📍 1001 South Main Street, Suite 600, Kalispell, MT 59901, United States", style: TextStyle(color: Colors.grey, fontSize: 11)),
                SizedBox(height: 6),
                Text("Registered US digital agency, link outreach & software provider.", style: TextStyle(color: Colors.white54, fontSize: 10)),
              ],
            ),
          ),

          // Admin Access Panel (Store Owner / Admin)
          const SizedBox(height: 24),
          const Text("STORE OWNER & ADMINISTRATION", style: TextStyle(color: Color(0xFF00FF88), fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: onOpenAdminHub,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF002817), Color(0xFF111111)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.5)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.admin_panel_settings, color: Color(0xFF00FF88), size: 28),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Admin Command Center", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                        Text("Record sales, auto-delivery links, stock & CRM.", style: TextStyle(color: Color(0xFF00FF88), fontSize: 11)),
                      ],
                    ),
                  ),
                  Icon(Icons.arrow_forward_ios, size: 14, color: Color(0xFF00FF88)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
