import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/main_provider.dart';
import '../models/app_models.dart';

class WebsiteManagementScreen extends StatefulWidget {
  const WebsiteManagementScreen({super.key});

  @override
  State<WebsiteManagementScreen> createState() => _WebsiteManagementScreenState();
}

class _WebsiteManagementScreenState extends State<WebsiteManagementScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
    _tabController.addListener(() {
      setState(() {}); // Repaint FAB when tab changes
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<MainProvider>().fetchAllContent();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('WEBSITE HUB', style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, fontSize: 13)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: const Color(0xFF00FF88),
          labelStyle: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
          tabs: const [
            Tab(text: 'BLOGS'),
            Tab(text: 'SERVICES'),
            Tab(text: 'PROJECTS'),
            Tab(text: 'RENTALS'),
            Tab(text: 'TESTIMONIALS'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _BlogsView(),
          _ServicesView(),
          _ProjectsView(),
          _RentalsView(),
          _TestimonialsView(),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showAddDialog(context, _tabController.index),
        backgroundColor: const Color(0xFF00FF88),
        child: const Icon(Icons.add, color: Colors.black),
      ),
    );
  }

  void _showAddDialog(BuildContext context, int tabIndex) {
    // Basic generic dialog for adding content
    final controllers = <String, TextEditingController>{};
    String title = "";
    String endpoint = "";
    List<String> fields = [];

    switch (tabIndex) {
      case 0:
        title = "ADD BLOG POST";
        endpoint = "/blogs";
        fields = ["title", "category", "excerpt", "content", "image"];
        break;
      case 1:
        title = "ADD SERVICE";
        endpoint = "/services";
        fields = ["title", "desc", "icon"];
        break;
      case 2:
        title = "ADD PROJECT";
        endpoint = "/projects";
        fields = ["title", "description"];
        break;
      case 3:
        title = "ADD RENTAL";
        endpoint = "/rentals";
        fields = ["domain", "price"];
        break;
      case 4:
        title = "ADD TESTIMONIAL";
        endpoint = "/testimonials";
        fields = ["name", "review", "rating"];
        break;
    }

    for (var f in fields) {
      controllers[f] = TextEditingController();
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF111111),
        title: Text(title, style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: fields.map((f) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: TextField(
                  controller: controllers[f],
                  style: const TextStyle(color: Colors.white, fontSize: 13),
                  decoration: InputDecoration(
                    labelText: f.toUpperCase(),
                    labelStyle: const TextStyle(color: Colors.grey, fontSize: 10),
                    enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white12)),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00FF88)),
            onPressed: () async {
              final data = <String, dynamic>{};
              controllers.forEach((key, controller) {
                data[key] = controller.text;
              });
              
              final success = await context.read<MainProvider>().addContent(endpoint, data);
              if (success) {
                if (context.mounted) Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Content added successfully')));
              }
            },
            child: const Text('SAVE', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}

class _BlogsView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final list = context.watch<MainProvider>().blogs;
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final blog = list[index];
        return _buildCard(context, blog.title, blog.category ?? 'General', blog.date, () => _confirmDelete(context, '/blogs', blog.id));
      },
    );
  }
}

class _ServicesView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final list = context.watch<MainProvider>().services;
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final service = list[index];
        return _buildCard(context, service.title, service.desc ?? '', service.icon ?? '🛠️', () => _confirmDelete(context, '/services', service.id));
      },
    );
  }
}

class _ProjectsView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final list = context.watch<MainProvider>().projects;
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final project = list[index];
        return _buildCard(context, project.title, project.description ?? '', '', () => _confirmDelete(context, '/projects', project.id));
      },
    );
  }
}

class _RentalsView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final list = context.watch<MainProvider>().rentals;
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final rental = list[index];
        return _buildCard(context, rental.domain, 'Price: ${rental.price}', '', () => _confirmDelete(context, '/rentals', rental.id));
      },
    );
  }
}

class _TestimonialsView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final list = context.watch<MainProvider>().testimonials;
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: list.length,
      itemBuilder: (context, index) {
        final review = list[index];
        return _buildCard(context, review.name, review.review, '★' * review.rating, () => _confirmDelete(context, '/testimonials', review.id));
      },
    );
  }
}

Widget _buildCard(BuildContext context, String title, String subtitle, String extra, VoidCallback onDelete) {
  return Container(
    margin: const EdgeInsets.only(bottom: 12),
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: const Color(0xFF111111),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: Colors.white.withOpacity(0.05)),
    ),
    child: Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 11), maxLines: 2, overflow: TextOverflow.ellipsis),
              if (extra.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(extra, style: const TextStyle(color: Color(0xFF00FF88), fontSize: 10, fontWeight: FontWeight.bold)),
              ]
            ],
          ),
        ),
        IconButton(onPressed: onDelete, icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 20)),
      ],
    ),
  );
}

void _confirmDelete(BuildContext context, String path, String id) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      backgroundColor: const Color(0xFF111111),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      title: const Text('DELETE CONTENT', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
      content: const Text('Remove this item from the website?', style: TextStyle(color: Colors.white70, fontSize: 13)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL', style: TextStyle(color: Colors.grey))),
        TextButton(
          onPressed: () async {
            final success = await context.read<MainProvider>().deleteItem(path, id);
            if (success) Navigator.pop(context);
          },
          child: const Text('DELETE', style: TextStyle(color: Colors.red)),
        ),
      ],
    ),
  );
}

