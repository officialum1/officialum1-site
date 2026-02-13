import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';

import 'package:flutter/services.dart';

class RecordSaleScreen extends StatefulWidget {
  const RecordSaleScreen({super.key});

  @override
  State<RecordSaleScreen> createState() => _RecordSaleScreenState();
}

class _RecordSaleScreenState extends State<RecordSaleScreen> {
  final _formKey = GlobalKey<FormState>();
  String _mode = 'single';
  String _platform = 'Z2U';
  String? _selectedInventoryId;
  String _productName = '';
  String _quantity = '1';
  bool _isSubmitting = false;

  final List<String> _platforms = ['Z2U', 'G2G', 'Direct', 'PlayerUp', 'Binance', 'RedotPay', 'Skrill', 'Reddit', 'Other'];
  String? _paymentReceived;

  final Map<String, List<String>> _bankOptions = {
    'Direct': ['Meezan', 'UBL', 'EasyPaisa', 'JazzCash', 'RedotPay', 'Binance', 'Skrill', 'Cash'],
  };

  final _priceController = TextEditingController();
  final _descController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchInventory();
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isSubmitting = true);

    final response = await context.read<MainProvider>().recordSale({
      'mode': _mode,
      'platform': _platform == 'Direct' && _paymentReceived != null ? _paymentReceived : _platform,
      'paymentReceived': _paymentReceived,
      'inventoryId': _mode == 'single' ? _selectedInventoryId : null,
      'productName': _mode == 'bulk' ? _productName : null,
      'quantity': _quantity,
      'salePrice': _priceController.text,
      'description': _descController.text,
      'staffName': 'Admin',
    });

    setState(() => _isSubmitting = false);

    if (response != null && response['success'] == true) {
      final token = response['delivery']?['token'];
      final deliveryUrl = token != null ? 'https://officialum1.com/delivery/$token' : null;

      _showSuccessDialog(deliveryUrl);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to record sale.'), backgroundColor: Colors.red));
    }
  }

  void _showSuccessDialog(String? url) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Column(
          children: [
             const Icon(Icons.check_circle, color: Color(0xFF00FF88), size: 50),
             const SizedBox(height: 10),
             const Text('SALE RECORDED', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 1)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('The sale has been successfully saved to history and stock updated.', 
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 13)
            ),
            if (url != null) ...[
              const SizedBox(height: 20),
              const Text('DELIVERY LINK', style: TextStyle(color: Color(0xFF00FF88), fontSize: 10, fontWeight: FontWeight.bold)),
              const SizedBox(height: 10),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(10)),
                child: Text(url, style: const TextStyle(color: Colors.white70, fontSize: 11)),
              ),
            ]
          ],
        ),
        actions: [
          if (url != null)
            TextButton(
              onPressed: () {
                Clipboard.setData(ClipboardData(text: url));
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Link copied to clipboard!')));
              },
              child: const Text('COPY LINK', style: TextStyle(color: Color(0xFF00FF88))),
            ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back to dashboard
            },
            child: const Text('DONE', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final inventory = context.watch<MainProvider>().inventory.where((i) => i.status == 'In Stock').toList();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('RECORD NEW SALE', style: TextStyle(fontSize: 14, letterSpacing: 2, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('SALE MODE', style: TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 1)),
              const SizedBox(height: 10),
              Row(
                children: [
                  _modeButton('Single Item', 'single'),
                  const SizedBox(width: 10),
                  _modeButton('Bulk Sale', 'bulk'),
                ],
              ),
              const SizedBox(height: 25),
              
              _buildLabel('PLATFORM'),
              DropdownButtonFormField<String>(
                value: _platform,
                dropdownColor: const Color(0xFF1A1A1A),
                decoration: _inputDecoration(''),
                items: _platforms.map((p) => DropdownMenuItem(value: p, child: Text(p, style: const TextStyle(color: Colors.white)))).toList(),
                onChanged: (v) => setState(() => _platform = v!),
              ),
              const SizedBox(height: 20),
              
              if (_platform == 'Direct') ...[
                _buildLabel('PAYMENT RECEIVED TO'),
                DropdownButtonFormField<String>(
                  value: _paymentReceived,
                  dropdownColor: const Color(0xFF1A1A1A),
                  decoration: _inputDecoration('Select Bank/Wallet...'),
                  items: _bankOptions['Direct']!.map((p) => DropdownMenuItem(value: p, child: Text(p, style: const TextStyle(color: Colors.white)))).toList(),
                  onChanged: (v) => setState(() => _paymentReceived = v),
                  validator: (v) => _platform == 'Direct' && v == null ? 'Required' : null,
                ),
                const SizedBox(height: 20),
              ],

              if (_mode == 'single') ...[
                _buildLabel('SELECT ITEM FROM STOCK'),
                DropdownButtonFormField<String>(
                  value: _selectedInventoryId,
                  dropdownColor: const Color(0xFF1A1A1A),
                  decoration: _inputDecoration('Select an item...'),
                  items: inventory.map((i) => DropdownMenuItem(
                    value: i.id, 
                    child: Text('${i.name} (ID: ${i.id.length > 4 ? i.id.substring(i.id.length - 4) : i.id})', style: const TextStyle(color: Colors.white, fontSize: 12))
                  )).toList(),
                  onChanged: (v) {
                    final item = inventory.firstWhere((i) => i.id == v);
                    setState(() {
                      _selectedInventoryId = v;
                      _descController.text = item.name;
                      _platform = item.platform;
                      _priceController.text = item.purchasePrice.toString();
                    });
                  },
                  validator: (v) => _mode == 'single' && v == null ? 'Please select an item' : null,
                ),
              ] else ...[
                _buildLabel('PRODUCT NAME'),
                TextFormField(
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration('e.g. Netflix Premium'),
                  onChanged: (v) {
                    _productName = v;
                    _descController.text = 'Bulk: $_quantity x $v';
                  },
                  validator: (v) => _mode == 'bulk' && v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 20),
                _buildLabel('QUANTITY'),
                TextFormField(
                  style: const TextStyle(color: Colors.white),
                  keyboardType: TextInputType.number,
                  decoration: _inputDecoration('1'),
                  initialValue: '1',
                  onChanged: (v) {
                    _quantity = v;
                    _descController.text = 'Bulk: $v x $_productName';
                  },
                  validator: (v) => _mode == 'bulk' && v!.isEmpty ? 'Required' : null,
                ),
              ],

              const SizedBox(height: 20),
              _buildLabel('SALE PRICE (USD)'),
              TextFormField(
                controller: _priceController,
                style: const TextStyle(color: Colors.white),
                keyboardType: TextInputType.number,
                decoration: _inputDecoration('0.00'),
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),

              const SizedBox(height: 20),
              _buildLabel('DESCRIPTION / NOTES'),
              TextFormField(
                controller: _descController,
                style: const TextStyle(color: Colors.white),
                maxLines: 3,
                decoration: _inputDecoration('Details for history...'),
              ),

              const SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00FF88),
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    elevation: 0,
                  ),
                  child: _isSubmitting 
                    ? const CircularProgressIndicator(color: Colors.black)
                    : const Text('CONFIRM SALE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                ),
              ),
              const SizedBox(height: 100),
            ],
          ),
        ),
      ),
    );
  }

  Widget _modeButton(String label, String value) {
    bool isSelected = _mode == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _mode = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF00FF88).withOpacity(0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: isSelected ? const Color(0xFF00FF88) : Colors.white12),
          ),
          alignment: Alignment.center,
          child: Text(label, style: TextStyle(color: isSelected ? const Color(0xFF00FF88) : Colors.grey, fontWeight: FontWeight.bold, fontSize: 12)),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 1, fontWeight: FontWeight.bold)),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 14),
      filled: true,
      fillColor: const Color(0xFF111111),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}
