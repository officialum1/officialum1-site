import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../services/api_service.dart';

class G2GFulfillmentDialog extends StatefulWidget {
  final String orderId;
  const G2GFulfillmentDialog({super.key, required this.orderId});

  @override
  State<G2GFulfillmentDialog> createState() => _G2GFulfillmentDialogState();
}

class _G2GFulfillmentDialogState extends State<G2GFulfillmentDialog> {
  final _detailsController = TextEditingController();
  final _api = ApiService();
  bool _isLoading = false;

  Future<void> _submit() async {
    if (_detailsController.text.isEmpty) return;

    setState(() => _isLoading = true);
    try {
      final response = await _api.post('/admin/g2g', {
        'action': 'deliver_order',
        'orderId': widget.orderId,
        'details': _detailsController.text,
      });

      if (response.statusCode == 200) {
        if (mounted) {
          Navigator.pop(context, true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Order delivered successfully!'), backgroundColor: Colors.green),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Delivery failed. check details.'), backgroundColor: Colors.redAccent),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Connection error')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF111111),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'SHIP ACCOUNT',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 2),
            ),
            const SizedBox(height: 8),
            Text(
              'Direct shipment for Order #${widget.orderId}',
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 24),
            const Text('ACCOUNT DETAILS (Credentials)', style: TextStyle(fontSize: 10, color: Color(0xFF00CCFF), fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _detailsController,
              maxLines: 5,
              style: const TextStyle(fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Login:Password\nEmail:Password',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.1)),
                filled: true,
                fillColor: Colors.black,
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF00CCFF))),
              ),
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                Expanded(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('CANCEL', style: TextStyle(color: Colors.grey)),
                  ),
                ),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _submit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF00CCFF),
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: _isLoading 
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                      : const Text('CONFIRM SHIP', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
