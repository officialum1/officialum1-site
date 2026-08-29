import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../services/api_service.dart';

class WebFulfillmentDialog extends StatefulWidget {
  final String orderId;
  const WebFulfillmentDialog({super.key, required this.orderId});

  @override
  State<WebFulfillmentDialog> createState() => _WebFulfillmentDialogState();
}

class _WebFulfillmentDialogState extends State<WebFulfillmentDialog> {
  final _credsController = TextEditingController();
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF111111),
      title: const Text('DELIVER ORDER', style: TextStyle(color: Colors.white, fontSize: 16)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _credsController,
            maxLines: 4,
            style: const TextStyle(color: Colors.white, fontSize: 13),
            decoration: InputDecoration(
              hintText: 'Enter login credentials or delivery details...',
              hintStyle: const TextStyle(color: Colors.grey),
              enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
              focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00FF88))),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
        ElevatedButton(
          onPressed: _isLoading ? null : _submit,
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88), foregroundColor: Colors.black),
          child: _isLoading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)) : const Text('SEND DELIVERY'),
        ),
      ],
    );
  }

  Future<void> _submit() async {
    if (_credsController.text.isEmpty) return;
    setState(() => _isLoading = true);
    try {
      final res = await ApiService().post('/admin/orders', {
        'orderId': widget.orderId,
        'credentials': _credsController.text,
      });
      if (res.statusCode == 200) {
        if (mounted) {
          context.read<MainProvider>().fetchOrders();
          Navigator.pop(context, true);
        }
      }
    } catch (e) {
      debugPrint('Fulfillment Error: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }
}
