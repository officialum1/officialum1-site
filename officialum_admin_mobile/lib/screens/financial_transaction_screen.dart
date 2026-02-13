import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../providers/auth_provider.dart';

class FinancialTransactionScreen extends StatefulWidget {
  const FinancialTransactionScreen({super.key});

  @override
  State<FinancialTransactionScreen> createState() => _FinancialTransactionScreenState();
}

class _FinancialTransactionScreenState extends State<FinancialTransactionScreen> {
  final _formKey = GlobalKey<FormState>();
  String _actionType = 'transfer'; // 'adjustment' or 'transfer'
  String _fromPlatform = 'Binance';
  String _toPlatform = 'RedotPay';
  String _platform = 'Meezan';
  String _currency = 'USD';
  final TextEditingController _amountController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  bool _isSubmitting = false;

  final List<String> _platforms = [
    'Meezan', 'UBL', 'EasyPaisa', 'JazzCash', 
    'Z2U', 'G2G', 'PlayerUp', 'Binance', 
    'RedotPay', 'Skrill', 'Direct'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(_actionType == 'transfer' ? 'INTERNAL TRANSFER' : 'FINANCE ADJUSTMENT', 
          style: const TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Mode Toggle
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: const Color(0xFF111111),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Expanded(child: _buildModeBtn('transfer', 'TRANSFER')),
                    Expanded(child: _buildModeBtn('adjustment', 'ADJUST')),
                  ],
                ),
              ),
              const SizedBox(height: 30),

              if (_actionType == 'transfer') ...[
                _buildLabel('SOURCE WALLET'),
                _buildDropdown(_fromPlatform, (val) => setState(() => _fromPlatform = val!)),
                const SizedBox(height: 20),
                _buildLabel('DESTINATION WALLET'),
                _buildDropdown(_toPlatform, (val) => setState(() => _toPlatform = val!)),
              ] else ...[
                _buildLabel('PLATFORM / ACCOUNT'),
                _buildDropdown(_platform, (val) {
                  setState(() {
                    _platform = val!;
                    _currency = ['Meezan', 'UBL', 'EasyPaisa', 'JazzCash'].contains(_platform) ? 'PKR' : 'USD';
                  });
                }),
              ],

              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('AMOUNT'),
                        TextFormField(
                          controller: _amountController,
                          keyboardType: TextInputType.number,
                          style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                          decoration: _inputDecoration('0.00'),
                          validator: (v) => v!.isEmpty ? 'Required' : null,
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 15),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('CURRENCY'),
                        _buildDropdown(_currency, (val) => setState(() => _currency = val!), items: ['USD', 'PKR']),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),
              _buildLabel('REASON / MEMO'),
              TextFormField(
                controller: _descController,
                style: const TextStyle(color: Colors.white),
                decoration: _inputDecoration('e.g. Funding RedotPay via Binance'),
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
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  child: _isSubmitting 
                    ? const CircularProgressIndicator(color: Colors.black)
                    : Text(_actionType == 'transfer' ? 'CONFIRM TRANSFER' : 'SAVE ADJUSTMENT', 
                        style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildModeBtn(String type, String label) {
    bool active = _actionType == type;
    return GestureDetector(
      onTap: () => setState(() => _actionType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF00FF88) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Center(
          child: Text(label, style: TextStyle(
            color: active ? Colors.black : Colors.grey,
            fontWeight: FontWeight.bold,
            fontSize: 11,
            letterSpacing: 1,
          )),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, left: 4),
      child: Text(text, style: const TextStyle(color: Colors.grey, fontSize: 10, letterSpacing: 1.5, fontWeight: FontWeight.bold)),
    );
  }

  Widget _buildDropdown(String value, Function(String?) onChanged, {List<String>? items}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          dropdownColor: const Color(0xFF111111),
          style: const TextStyle(color: Colors.white),
          items: (items ?? _platforms).map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
          onChanged: onChanged,
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.white24, fontSize: 13),
      filled: true,
      fillColor: const Color(0xFF111111),
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.white10)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF00FF88))),
    );
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    
    final user = context.read<AuthProvider>().user;
    final staffName = user != null ? (user['name'] ?? user['email']) : 'Admin';

    final data = {
      'amount': _amountController.text,
      'currency': _currency,
      'description': _descController.text,
      'staffName': staffName,
    };

    if (_actionType == 'transfer') {
      data['fromPlatform'] = _fromPlatform;
      data['toPlatform'] = _toPlatform;
    } else {
      data['platform'] = _platform;
    }

    final success = await context.read<MainProvider>().executeFinanceAction(
      _actionType == 'transfer' ? 'transfer_funds' : 'add_funds',
      data
    );

    if (success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Transaction recorded successfully!'), backgroundColor: Color(0xFF00FF88))
        );
        Navigator.pop(context);
      }
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to record transaction'), backgroundColor: Colors.redAccent)
        );
      }
    }
    
    if (mounted) setState(() => _isSubmitting = false);
  }
}
