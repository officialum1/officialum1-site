import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_models.dart';
import '../providers/main_provider.dart';

class AddEditStockDialog extends StatefulWidget {
  final StockItem? item;
  const AddEditStockDialog({super.key, this.item});

  @override
  State<AddEditStockDialog> createState() => _AddEditStockDialogState();
}

class _AddEditStockDialogState extends State<AddEditStockDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _priceController;
  late TextEditingController _credsController;
  late TextEditingController _tagController;
  String _platform = 'Direct';

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.item?.name);
    _priceController = TextEditingController(text: widget.item?.purchasePrice.toString());
    
    String creds = "";
    if (widget.item != null) {
      final details = widget.item!.accountDetails;
      creds = "${details['username'] ?? ''}:${details['password'] ?? ''}:${details['email'] ?? ''}";
      if (details['extraInfo'] != null) creds += ":${details['extraInfo']}";
    }
    _credsController = TextEditingController(text: creds);
    _tagController = TextEditingController(text: widget.item?.accountDetails['tag'] ?? '');
    _platform = widget.item?.platform ?? 'Direct';
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: const Color(0xFF111111),
      title: Text(widget.item == null ? 'ADD STOCK' : 'EDIT STOCK', 
        style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
      content: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildField('Product Name', _nameController),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _platform,
                dropdownColor: const Color(0xFF1A1A1A),
                decoration: _fieldDecoration('Platform'),
                items: ['Z2U', 'G2G', 'PlayerUp', 'Direct', 'Binance', 'RedotPay', 'Skrill']
                    .map((p) => DropdownMenuItem(value: p, child: Text(p, style: const TextStyle(color: Colors.white)))).toList(),
                onChanged: (v) => setState(() => _platform = v!),
              ),
              const SizedBox(height: 12),
              _buildField('Purchase Price', _priceController, keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              _buildField('Credentials (user:pass:email)', _credsController, maxLines: 3),
              const SizedBox(height: 12),
              _buildField('Tag (Optional)', _tagController),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
        ElevatedButton(
          onPressed: _submit,
          style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88), foregroundColor: Colors.black),
          child: const Text('SAVE'),
        ),
      ],
    );
  }

  Widget _buildField(String label, TextEditingController controller, {TextInputType? keyboardType, int maxLines = 1}) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      style: const TextStyle(color: Colors.white, fontSize: 14),
      decoration: _fieldDecoration(label),
      validator: (v) => v == null || v.isEmpty ? 'Required' : null,
    );
  }

  InputDecoration _fieldDecoration(String label) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(color: Colors.grey, fontSize: 12),
      enabledBorder: OutlineInputBorder(borderSide: BorderSide(color: Colors.white.withOpacity(0.1))),
      focusedBorder: const OutlineInputBorder(borderSide: BorderSide(color: Color(0xFF00FF88))),
    );
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      final provider = context.read<MainProvider>();
      final data = {
        'name': _nameController.text,
        'platform': _platform,
        'purchasePrice': _priceController.text,
        'credentials': _credsController.text,
        'tag': _tagController.text,
        if (widget.item != null) 'itemId': widget.item!.id,
      };

      bool success;
      if (widget.item == null) {
        success = await provider.addInventory(data);
      } else {
        success = await provider.updateInventory(data);
      }

      if (success && mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Success!')));
      }
    }
  }
}
