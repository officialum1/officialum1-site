import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'dart:convert';
import 'main_navigation_container.dart';

class GuestPostingScreen extends StatefulWidget {
  const GuestPostingScreen({super.key});

  @override
  State<GuestPostingScreen> createState() => _GuestPostingScreenState();
}

class _GuestPostingScreenState extends State<GuestPostingScreen> {
  final ApiService _api = ApiService();
  double _linksCount = 5;
  String _selectedTier = "Powerhouse (DA 60+)";
  double _tierPrice = 149.0;
  bool _isSubmitting = false;

  final List<Map<String, dynamic>> _packages = [
    {
      "name": "Starter Authority",
      "price": "\$499",
      "da": "DA 40+",
      "traffic": "5,000+ Monthly Traffic",
      "features": ["5x Verified DoFollow Posts", "Permanent Placement", "365-Day Free Warranty", "Zero PBNs Guarantee"],
      "color": Color(0xFF00CCFF),
      "badge": "Popular for Local SEO"
    },
    {
      "name": "Powerhouse Package",
      "price": "\$1,499",
      "da": "DA 60+ / DR 65+",
      "traffic": "25,000+ Monthly Traffic",
      "features": ["10x High-Traffic Authority Placements", "100% In-Content Contextual", "Permanent DoFollow Links", "Guaranteed Top 10 Impact", "365-Day Replacement Warranty"],
      "color": Color(0xFF00FF88),
      "badge": "⭐ BEST SELLER"
    },
    {
      "name": "Curated Niche Edits",
      "price": "\$599",
      "da": "Aged Articles",
      "traffic": "Established Google Rank",
      "features": ["5x Contextual Link Insertions", "Existing Indexed Authority", "48-72h Fast Turnaround", "Zero Footprint"],
      "color": Color(0xFFFFB800),
      "badge": "Fast Ranking Boost"
    },
    {
      "name": "Enterprise Authority",
      "price": "\$2,499",
      "da": "DA 70+ Elite",
      "traffic": "50,000+ Monthly Traffic",
      "features": ["15x Premium Tier-1 Publications", "Forbes / TechCrunch Network", "Dedicated Link Building Strategist", "Comprehensive Live Link Report"],
      "color": Color(0xFF9D00FF),
      "badge": "Agency & Enterprise"
    }
  ];

  void _showQuoteModal(String packageName, String price) {
    final domainCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final anchorCtrl = TextEditingController();
    final targetUrlCtrl = TextEditingController();
    final nicheCtrl = TextEditingController(text: "General / Technology");

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          backgroundColor: const Color(0xFF111111),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFF00FF88), width: 1),
          ),
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("BOOK $packageName", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 16, fontWeight: FontWeight.w900)),
              Text("Package Price: $price", style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildModalField(domainCtrl, "Your Website / Domain (e.g. yoursite.com)"),
                _buildModalField(emailCtrl, "Work Email (For Placement Reports)", keyboardType: TextInputType.emailAddress),
                _buildModalField(nicheCtrl, "Industry / Niche"),
                _buildModalField(targetUrlCtrl, "Target Money Page URL (Optional)"),
                _buildModalField(anchorCtrl, "Desired Anchor Text (Optional)"),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text("CANCEL", style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00FF88),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              ),
              onPressed: _isSubmitting ? null : () async {
                if (domainCtrl.text.trim().isEmpty || emailCtrl.text.trim().isEmpty) {
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Domain and Email are required!")));
                  return;
                }

                setModalState(() => _isSubmitting = true);
                try {
                  final res = await _api.post('/leads', {
                    'action': 'guest_post_quote',
                    'packageName': packageName,
                    'price': price,
                    'domain': domainCtrl.text.trim(),
                    'email': emailCtrl.text.trim(),
                    'niche': nicheCtrl.text.trim(),
                    'targetUrl': targetUrlCtrl.text.trim(),
                    'anchorText': anchorCtrl.text.trim(),
                    'budget': price.replaceAll(RegExp(r'[^0-9]'), ''),
                    'placements': _linksCount.toInt().toString(),
                  });

                  if (res.statusCode == 200) {
                    Navigator.pop(ctx);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: Color(0xFF00FF88),
                        content: Text("🎉 Quote Request Submitted! We will email you sample live link placements within 2 hours.", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                      ),
                    );
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Failed to submit quote. Please try again.")));
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error: $e")));
                } finally {
                  setModalState(() => _isSubmitting = false);
                }
              },
              child: _isSubmitting 
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2))
                : const Text("CONFIRM & SUBMIT", style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildModalField(TextEditingController ctrl, String label, {TextInputType keyboardType = TextInputType.text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: ctrl,
        keyboardType: keyboardType,
        style: const TextStyle(color: Colors.white, fontSize: 13),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.grey, fontSize: 11),
          filled: true,
          fillColor: Colors.white.withOpacity(0.05),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF00FF88))),
          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    double estimatedTotal = _linksCount * _tierPrice;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AUTHORITY GUEST POSTING', style: TextStyle(letterSpacing: 1.5, fontWeight: FontWeight.bold, fontSize: 15)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Top Header Banner
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [const Color(0xFF00FF88).withOpacity(0.15), const Color(0xFF00CCFF).withOpacity(0.05)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF00FF88).withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: const Color(0xFF00FF88), borderRadius: BorderRadius.circular(20)),
                      child: const Text("65,000+ VETTED SITES", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 10)),
                    ),
                    const SizedBox(width: 8),
                    const Text("365-Day Free Warranty", style: TextStyle(color: Color(0xFF00FF88), fontSize: 11, fontWeight: FontWeight.bold)),
                  ],
                ),
                const SizedBox(height: 12),
                const Text("High DA60+ Editorial Backlinks", style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: Colors.white)),
                const SizedBox(height: 6),
                const Text("Manual editorial outreach. Zero PBNs. Permanent DoFollow links with 5k to 50k+ monthly organic Google traffic.", style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Interactive Link ROI Calculator Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.calculate_outlined, color: Color(0xFF00FF88), size: 20),
                    SizedBox(width: 8),
                    Text("LIVE LINK CALCULATOR", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1)),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Select Metric Tier:", style: TextStyle(color: Colors.grey, fontSize: 12)),
                    DropdownButton<String>(
                      value: _selectedTier,
                      dropdownColor: const Color(0xFF1A1A1A),
                      style: const TextStyle(color: Color(0xFF00FF88), fontWeight: FontWeight.bold, fontSize: 12),
                      underline: const SizedBox(),
                      items: const [
                        DropdownMenuItem(value: "Starter (DA 40+)", child: Text("DA 40+ (\$99/link)")),
                        DropdownMenuItem(value: "Powerhouse (DA 60+)", child: Text("DA 60+ (\$149/link)")),
                        DropdownMenuItem(value: "Elite Tier (DA 70+)", child: Text("DA 70+ (\$249/link)")),
                      ],
                      onChanged: (val) {
                        if (val == null) return;
                        setState(() {
                          _selectedTier = val;
                          if (val.contains("40+")) _tierPrice = 99.0;
                          else if (val.contains("60+")) _tierPrice = 149.0;
                          else _tierPrice = 249.0;
                        });
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text("Number of Placements:", style: TextStyle(color: Colors.grey, fontSize: 12)),
                    Text("${_linksCount.toInt()} Links", style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15)),
                  ],
                ),
                Slider(
                  value: _linksCount,
                  min: 1,
                  max: 30,
                  divisions: 29,
                  activeColor: const Color(0xFF00FF88),
                  inactiveColor: Colors.white12,
                  onChanged: (val) => setState(() => _linksCount = val),
                ),
                const Divider(color: Colors.white12, height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text("ESTIMATED INVESTMENT", style: TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 1)),
                        Text("\$${estimatedTotal.toStringAsFixed(0)}", style: const TextStyle(color: Color(0xFF00FF88), fontSize: 24, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00FF88),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      ),
                      onPressed: () => _showQuoteModal("Custom ${_linksCount.toInt()}x $_selectedTier", "\$${estimatedTotal.toStringAsFixed(0)}"),
                      child: const Text("GET SHORTLIST", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 12)),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 28),
          const Text("FEATURED AUTHORITY PACKAGES", style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 1.5)),
          const SizedBox(height: 12),

          // Package Cards Grid
          ..._packages.map((pkg) => Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF111111),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: (pkg['color'] as Color).withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: (pkg['color'] as Color).withOpacity(0.15), borderRadius: BorderRadius.circular(20), border: Border.all(color: (pkg['color'] as Color).withOpacity(0.4))),
                      child: Text(pkg['badge'], style: TextStyle(color: pkg['color'], fontWeight: FontWeight.w900, fontSize: 10)),
                    ),
                    Text(pkg['price'], style: TextStyle(color: pkg['color'], fontSize: 24, fontWeight: FontWeight.w900)),
                  ],
                ),
                const SizedBox(height: 12),
                Text(pkg['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                Text("${pkg['da']} • ${pkg['traffic']}", style: const TextStyle(color: Colors.grey, fontSize: 12)),
                const Divider(color: Colors.white12, height: 24),
                ...((pkg['features'] as List<String>).map((feat) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Icon(Icons.check_circle, color: pkg['color'], size: 14),
                      const SizedBox(width: 8),
                      Expanded(child: Text(feat, style: const TextStyle(color: Colors.white70, fontSize: 12))),
                    ],
                  ),
                ))),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: pkg['color'],
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    onPressed: () => _showQuoteModal(pkg['name'], pkg['price']),
                    child: const Text("ORDER / INQUIRE NOW", style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
                  ),
                ),
              ],
            ),
          )),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}
