import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'app_shell.dart';

class GuestPostingScreen extends StatefulWidget {
  const GuestPostingScreen({super.key});

  @override
  State<GuestPostingScreen> createState() => _GuestPostingScreenState();
}

class _GuestPostingScreenState extends State<GuestPostingScreen> {
  final ApiService _api = ApiService();

  // Interactive ROI Calculator State
  double _linksCount = 5;
  double _currentDA = 45;

  final List<Map<String, dynamic>> _tiers = [
    {
      "name": "Starter Authority",
      "price": "\$499",
      "da": "DA 40-50+",
      "traffic": "5,000+ Visits",
      "features": ["3 High-Authority Placements", "100% DoFollow In-Content", "48h Fast Editorial Approval", "365-Day Replacement Warranty"],
      "popular": false
    },
    {
      "name": "Growth Pro",
      "price": "\$899",
      "da": "DA 55-65+",
      "traffic": "15,000+ Visits",
      "features": ["6 High-Authority Placements", "Guaranteed Indexed Links", "Custom Editorial Writing Included", "Zero PBN / Pure Editorial Sites"],
      "popular": true
    },
    {
      "name": "Enterprise Dominance",
      "price": "\$1,499",
      "da": "DA 65-75+",
      "traffic": "50,000+ Visits",
      "features": ["10 Top-Tier Placements", "Tier-1 Media Outlets", "Dedicated SEO Account Manager", "White-Label Client Reports"],
      "popular": false
    },
    {
      "name": "Custom Agency Retainer",
      "price": "\$2,499+",
      "da": "DA 70-85+",
      "traffic": "100,000+ Visits",
      "features": ["20+ Custom Links Monthly", "Niche Edits & Broken Link Rebuilds", "Competitor Gap Link Hijacking", "Direct API Reporting Access"],
      "popular": false
    }
  ];

  void _showQuoteDialog(String tierName) {
    final domainCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF00FF88)),
        ),
        title: Text("Request $tierName", style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text("We will send you a vetted domain shortlist & sample URLs within 2 hours.", style: TextStyle(color: Colors.grey, fontSize: 11)),
              const SizedBox(height: 14),
              TextField(
                controller: domainCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Your Website / Target Domain",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: emailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Work Email",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: notesCtrl,
                maxLines: 2,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  labelText: "Target Keywords / Niche Notes (Optional)",
                  labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
                  filled: true,
                  fillColor: Colors.white.withValues(alpha: 0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text("CANCEL", style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () async {
              if (emailCtrl.text.trim().isEmpty) return;
              Navigator.pop(ctx);
              try {
                await _api.post('/leads', {
                  'email': emailCtrl.text.trim(),
                  'domain': domainCtrl.text.trim(),
                  'service': 'Guest Posting ($tierName)',
                  'notes': notesCtrl.text.trim(),
                  'source': 'Flutter Mobile App'
                });
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      backgroundColor: Color(0xFF00FF88),
                      content: Text("Quote request received! We'll send publisher options to your email.", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                    ),
                  );
                }
              } catch (e) {
                // Fallback
              }
            },
            child: const Text("SUBMIT REQUEST", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Projected ROI calculations
    final projectedTrafficMultiplier = (1.5 + (_linksCount * 0.45)).toStringAsFixed(1);
    final projectedKeywords = (_linksCount * 18).toInt();
    final estimatedValue = (_linksCount * 320).toInt();

    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      appBar: AppBar(
        title: const Text('AUTHORITY GUEST POSTING', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.w900, fontSize: 14)),
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
          // Hero Header Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF002213), Color(0xFF081410)]),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFF00FF88).withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20)),
                      child: const Text("65,000+ VETTED PUBLISHERS", style: TextStyle(color: Color(0xFF00FF88), fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Text("Pure Editorial Guest Posts & In-Content Niche Edits", style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                const SizedBox(height: 6),
                const Text("Rank your money pages into Google Top 3 with permanent DoFollow links on genuine high-traffic blogs.", style: TextStyle(color: Colors.white70, fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Interactive ROI Calculator Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.calculate_outlined, color: Color(0xFF00FF88), size: 20),
                    SizedBox(width: 8),
                    Text("Interactive Link Impact Calculator", style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 14),

                // Sliders
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Target Link Volume:", style: TextStyle(color: Colors.grey, fontSize: 11)),
                    Text("${_linksCount.toInt()} High-DA Placements", style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
                Slider(
                  value: _linksCount,
                  min: 1,
                  max: 25,
                  divisions: 24,
                  activeColor: const Color(0xFF00FF88),
                  inactiveColor: Colors.white10,
                  onChanged: (val) => setState(() => _linksCount = val),
                ),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Minimum Domain Authority:", style: TextStyle(color: Colors.grey, fontSize: 11)),
                    Text("DA ${_currentDA.toInt()}+", style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
                Slider(
                  value: _currentDA,
                  min: 30,
                  max: 80,
                  divisions: 10,
                  activeColor: const Color(0xFF00FF88),
                  inactiveColor: Colors.white10,
                  onChanged: (val) => setState(() => _currentDA = val),
                ),

                // Projected Outcome Box
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF00FF88).withValues(alpha: 0.2)),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      Column(
                        children: [
                          Text("${projectedTrafficMultiplier}x", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 18, fontWeight: FontWeight.w900)),
                          const Text("Organic Growth", style: TextStyle(color: Colors.grey, fontSize: 9)),
                        ],
                      ),
                      Column(
                        children: [
                          Text("+$projectedKeywords", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 18, fontWeight: FontWeight.w900)),
                          const Text("Top 10 Keywords", style: TextStyle(color: Colors.grey, fontSize: 9)),
                        ],
                      ),
                      Column(
                        children: [
                          Text("\$$estimatedValue", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 18, fontWeight: FontWeight.w900)),
                          const Text("Est. Value", style: TextStyle(color: Colors.grey, fontSize: 9)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text("PUBLISHER TIERS & PACKAGES", style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          const SizedBox(height: 12),

          // Tiers List
          ..._tiers.map((tier) => Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: tier['popular'] ? const Color(0xFF00FF88) : Colors.white.withValues(alpha: 0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (tier['popular'])
                  Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                    decoration: BoxDecoration(color: const Color(0xFF00FF88), borderRadius: BorderRadius.circular(20)),
                    child: const Text("MOST POPULAR CHOICE", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 9)),
                  ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(tier['name'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                    Text(tier['price'], style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.w900, fontSize: 20)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text("Metrics: ${tier['da']} • ${tier['traffic']}", style: const TextStyle(color: Colors.grey, fontSize: 11)),
                  ],
                ),
                const Divider(color: Colors.white12, height: 20),
                ...((tier['features'] as List).map((f) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, size: 14, color: Color(0xFF00FF88)),
                      const SizedBox(width: 8),
                      Expanded(child: Text(f, style: const TextStyle(color: Colors.white70, fontSize: 11))),
                    ],
                  ),
                ))),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: tier['popular'] ? const Color(0xFF00FF88) : Colors.white.withValues(alpha: 0.08),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () => _showQuoteDialog(tier['name']),
                    child: Text(
                      "ORDER THIS PACKAGE",
                      style: TextStyle(
                        color: tier['popular'] ? Colors.black : Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 11,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
