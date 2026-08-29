import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../models/app_models.dart';

class StaffManagementScreen extends StatefulWidget {
  const StaffManagementScreen({super.key});

  @override
  State<StaffManagementScreen> createState() => _StaffManagementScreenState();
}

class _StaffManagementScreenState extends State<StaffManagementScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchStaff();
    });
  }

  @override
  Widget build(BuildContext context) {
    final staffList = context.watch<MainProvider>().staff;

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('HR & STAFF', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle, color: Color(0xFF00FF88)),
            onPressed: () => _showStaffDialog(context),
          ),
          IconButton(
            icon: const Icon(Icons.refresh, color: Color(0xFF00FF88)),
            onPressed: () => context.read<MainProvider>().fetchStaff(),
          ),
        ],
      ),
      body: staffList.isEmpty
          ? const Center(child: Text('No staff members found', style: TextStyle(color: Colors.grey)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: staffList.length,
              itemBuilder: (context, index) {
                final staff = staffList[index];
                return _buildStaffCard(staff);
              },
            ),
    );
  }

  Widget _buildStaffCard(Staff staff) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      staff.name,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    Text(
                      staff.email,
                      style: const TextStyle(color: Colors.white54, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF00FF88).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  staff.department.toUpperCase(),
                  style: const TextStyle(color: Color(0xFF00FF88), fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Position: ${staff.position}',
            style: const TextStyle(color: Colors.white70, fontSize: 13),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children: staff.permissions
                .map((p) => Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        p.toUpperCase(),
                        style: const TextStyle(color: Colors.grey, fontSize: 9),
                      ),
                    ))
                .toList(),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => _showStaffDialog(context, staff),
                child: const Text('EDIT', style: TextStyle(color: Colors.blue)),
              ),
              const SizedBox(width: 8),
              TextButton(
                onPressed: () => _confirmDelete(staff),
                child: const Text('REMOVE', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showStaffDialog(BuildContext context, [Staff? staff]) {
    final nameController = TextEditingController(text: staff?.name);
    final emailController = TextEditingController(text: staff?.email);
    final posController = TextEditingController(text: staff?.position);
    final deptController = TextEditingController(text: staff?.department);
    final passController = TextEditingController();
    
    // Simplification for mobile: just a comma-separated permissions for now or a multi-select
    // For now, let's keep it simple with common sets
    List<String> selectedPerms = staff?.permissions ?? ['inventory', 'orders', 'support'];

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => AlertDialog(
          backgroundColor: const Color(0xFF111111),
          title: Text(staff == null ? 'ADD STAFF' : 'EDIT STAFF', style: const TextStyle(color: Colors.white, fontSize: 16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildField('Full Name', nameController),
                _buildField('Email', emailController, enabled: staff == null),
                _buildField('Position', posController),
                _buildField('Department', deptController),
                _buildField('Password', passController, hint: staff != null ? 'Leave empty to keep current' : null),
                const SizedBox(height: 16),
                const Text('Permissions', style: TextStyle(color: Colors.white54, fontSize: 12)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 4,
                  children: [
                    'all', 'inventory', 'orders', 'website', 'sales', 'finance', 'leads', 'users', 'support', 'marketing', 'hr', 'settings'
                  ].map((p) => FilterChip(
                    label: Text(p, style: TextStyle(fontSize: 10, color: selectedPerms.contains(p) ? Colors.black : Colors.white)),
                    selected: selectedPerms.contains(p),
                    selectedColor: const Color(0xFF00FF88),
                    backgroundColor: Colors.white12,
                    onSelected: (val) {
                      setModalState(() {
                        if (val) selectedPerms.add(p);
                        else selectedPerms.remove(p);
                      });
                    },
                  )).toList(),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
              onPressed: () async {
                final data = {
                  'name': nameController.text,
                  'email': emailController.text,
                  'position': posController.text,
                  'department': deptController.text,
                  'permissions': selectedPerms,
                  if (passController.text.isNotEmpty) 'password': passController.text,
                  if (staff != null) 'id': staff.id,
                };
                
                final success = await context.read<MainProvider>().addContent('/hr/employees', data);
                if (success) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Staff updated')));
                }
              },
              child: const Text('SAVE', style: TextStyle(color: Colors.black)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController controller, {bool enabled = true, String? hint}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: controller,
        enabled: enabled,
        style: const TextStyle(color: Colors.white),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white54),
          hintText: hint,
          hintStyle: const TextStyle(color: Colors.white24),
          enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white12)),
          focusedBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Color(0xFF00FF88))),
        ),
      ),
    );
  }

  void _confirmDelete(Staff staff) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: const Text('DELETE STAFF', style: TextStyle(color: Colors.white)),
        content: Text('Are you sure you want to remove ${staff.name}?', style: const TextStyle(color: Colors.white70)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL')),
          TextButton(
            onPressed: () async {
              final success = await context.read<MainProvider>().deleteItem('/hr/employees', staff.id);
              if (success) {
                Navigator.pop(context);
              }
            },
            child: const Text('DELETE', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
