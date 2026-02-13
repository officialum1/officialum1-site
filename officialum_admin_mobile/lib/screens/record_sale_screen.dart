import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';

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
  String _salePrice = '';
  String _description = '';
  bool _isSubmitting = false;

  final List<String> _platforms = ['Z2U', 'G2G', 'Direct', 'PlayerUp', 'Reddit', 'Other'];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchProducts();
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();

    setState(() => _isSubmitting = true);

    final success = await context.read<MainProvider>().recordSale({
      'mode': _mode,
      'platform': _platform,
      'inventoryId': _mode == 'single' ? _selectedInventoryId : null,
      'productName': _mode == 'bulk' ? _productName : null,
      'quantity': _quantity,
      'salePrice': _salePrice,
      'description': _description,
      'staffName': 'Admin', // In reality, get from AuthProvider
    });

    setState(() => _isSubmitting = false);

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Sale recorded successfully!'), backgroundColor: Colors.green));
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to record sale.'), backgroundColor: Colors.red));
    }
  }

  @override
  Widget build(BuildContext context) {
    final products = context.watch<MainProvider>().products.where((p) => p.stock > 0).toList();

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('RECORD NEW SALE', style: TextStyle(fontSize: 14, letterSpacing: 2, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.black,
        elevation: 0,
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

              if (_mode == 'single') ...[
                _buildLabel('SELECT ITEM FROM STOCK'),
                DropdownButtonFormField<String>(
                  value: _selectedInventoryId,
                  dropdownColor: const Color(0xFF1A1A1A),
                  decoration: _inputDecoration('Select an item...'),
                  items: products.map((p) => DropdownMenuItem(
                    value: p.id, 
                    child: Text('${p.name} ($p.platform)', style: const TextStyle(color: Colors.white, fontSize: 12))
                  )).toList(),
                  onChanged: (v) => setState(() => _selectedInventoryId = v),
                  validator: (v) => v == null ? 'Please select an item' : null,
                ),
              ] else ...[
                _buildLabel('PRODUCT NAME'),
                TextFormField(
                  style: const TextStyle(color: Colors.white),
                  decoration: _inputDecoration('e.g. Netflix Premium'),
                  onSaved: (v) => _productName = v ?? '',
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 20),
                _buildLabel('QUANTITY'),
                TextFormField(
                  style: const TextStyle(color: Colors.white),
                  keyboardType: TextInputType.number,
                  decoration: _inputDecoration('1'),
                  initialValue: '1',
                  onSaved: (v) => _quantity = v ?? '1',
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
              ],

              const SizedBox(height: 20),
              _buildLabel('SALE PRICE (USD)'),
              TextFormField(
                style: const TextStyle(color: Colors.white),
                keyboardType: TextInputType.number,
                decoration: _inputDecoration('0.00'),
                onSaved: (v) => _salePrice = v ?? '',
                validator: (v) => v!.isEmpty ? 'Required' : null,
              ),

              const SizedBox(height: 20),
              _buildLabel('DESCRIPTION / NOTES'),
              TextFormField(
                style: const TextStyle(color: Colors.white),
                maxLines: 3,
                decoration: _inputDecoration('Details for history...'),
                onSaved: (v) => _description = v ?? '',
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
