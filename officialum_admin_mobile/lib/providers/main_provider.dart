import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/app_models.dart';
import '../services/api_service.dart';
import 'dart:async';

class MainProvider with ChangeNotifier {
  final _api = ApiService();

  List<Product> _products = [];
  List<Order> _orders = [];
  List<G2GOrder> _g2gOrders = [];
  List<PlayerUpListing> _playerUpListings = [];
  Map<String, dynamic>? _stats;
  List<Blog> _blogs = [];
  List<Service> _services = [];
  List<Project> _projects = [];
  List<Rental> _rentals = [];
  List<Testimonial> _testimonials = [];
  List<Coupon> _coupons = [];
  List<KBArticle> _kbArticles = [];
  List<Category> _categories = [];
  List<Lead> _leads = [];
  List<Staff> _staff = [];
  Timer? _updateTimer;

  bool _isLoadingProducts = false;

  MainProvider() {
    _startPeriodicUpdates();
  }

  void _startPeriodicUpdates() {
    _updateTimer = Timer.periodic(const Duration(seconds: 30), (timer) {
      if (_stats != null) {
        fetchStats();
      }
    });
  }

  @override
  void dispose() {
    _updateTimer?.cancel();
    super.dispose();
  }
  bool _isLoadingOrders = false;
  bool _isLoadingG2G = false;
  bool _isLoadingPlayerUp = false;
  bool _isLoadingStats = false;
  bool _isLoadingContent = false;

  List<Product> get products => _products;
  List<Order> get orders => _orders;
  List<G2GOrder> get g2gOrders => _g2gOrders;
  List<PlayerUpListing> get playerUpListings => _playerUpListings;
  Map<String, dynamic>? get stats => _stats;
  List<Blog> get blogs => _blogs;
  List<Service> get services => _services;
  List<Project> get projects => _projects;
  List<Rental> get rentals => _rentals;
  List<Testimonial> get testimonials => _testimonials;
  List<Coupon> get coupons => _coupons;
  List<KBArticle> get kbArticles => _kbArticles;
  List<Category> get categories => _categories;
  List<Lead> get leads => _leads;
  List<Staff> get staff => _staff;

  bool get isLoadingProducts => _isLoadingProducts;
  bool get isLoadingOrders => _isLoadingOrders;
  bool get isLoadingG2G => _isLoadingG2G;
  bool get isLoadingPlayerUp => _isLoadingPlayerUp;
  bool get isLoadingStats => _isLoadingStats;
  bool get isLoadingContent => _isLoadingContent;

  Future<void> fetchStats() async {
    _isLoadingStats = true;
    notifyListeners();
    try {
      debugPrint('Fetching stats from /admin/stats...');
      final res = await _api.get('/admin/stats');
      debugPrint('Stats Response: ${res.statusCode} - ${res.body}');
      if (res.statusCode == 200) {
        _stats = jsonDecode(res.body);
      } else if (res.statusCode == 401) {
        debugPrint('Unauthorized access to stats');
      }
    } catch (e) {
      debugPrint('Error fetching stats: $e');
    } finally {
      _isLoadingStats = false;
      notifyListeners();
    }
  }

  Future<void> fetchProducts() async {
    _isLoadingProducts = true;
    notifyListeners();
    try {
      final res = await _api.get('/admin/inventory');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _products = data.map((item) => Product.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching products: $e');
    } finally {
      _isLoadingProducts = false;
      notifyListeners();
    }
  }

  Future<void> fetchOrders() async {
    _isLoadingOrders = true;
    notifyListeners();
    try {
      final res = await _api.get('/admin/orders');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _orders = data.map((item) => Order.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching orders: $e');
    } finally {
      _isLoadingOrders = false;
      notifyListeners();
    }
  }

  Future<void> fetchG2GOrders() async {
    _isLoadingG2G = true;
    notifyListeners();
    try {
      final res = await _api.get('/admin/g2g?action=get_tracked_orders');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _g2gOrders = data.map((item) => G2GOrder.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching G2G orders: $e');
    } finally {
      _isLoadingG2G = false;
      notifyListeners();
    }
  }

  Future<bool> updateOrderStatus(String orderId, String status) async {
    try {
      final res = await _api.post('/admin/orders', {
        'action': 'update_status',
        'orderId': orderId,
        'status': status
      });
      if (res.statusCode == 200) {
        fetchOrders(); // Refresh
        return true;
      }
    } catch (e) {
      debugPrint('Error updating order: $e');
    }
    return false;
  }

  Future<Map<String, dynamic>?> recordSale(Map<String, dynamic> data) async {
    try {
      final res = await _api.post('/admin/inventory', {
        'action': 'record_sale',
        ...data,
      });
      if (res.statusCode == 200) {
        fetchStats();
        fetchProducts();
        return jsonDecode(res.body);
      }
    } catch (e) {
      debugPrint('Error recording sale: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>> bumpThreads() async {
    try {
      final res = await _api.post('/admin/playerup', {
        'action': 'cloud_bump_all',
        'limit': 10
      });
      if (res.statusCode == 200) {
        return jsonDecode(res.body);
      }
    } catch (e) {
      debugPrint('Error bumping threads: $e');
    }
    return {'success': false, 'error': 'Connection error'};
  }

  Future<void> fetchPlayerUpListings() async {
    _isLoadingPlayerUp = true;
    notifyListeners();
    try {
      final res = await _api.get('/admin/playerup');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _playerUpListings = data.map((item) => PlayerUpListing.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching PlayerUp listings: $e');
    } finally {
      _isLoadingPlayerUp = false;
      notifyListeners();
    }
  }

  List<StockItem> _inventory = [];
  List<Ticket> _tickets = [];
  List<AppUser> _appUsers = [];
  List<Payout> _payouts = [];

  List<StockItem> get inventory => _inventory;
  List<Ticket> get tickets => _tickets;
  List<AppUser> get appUsers => _appUsers;
  List<Payout> get payouts => _payouts;

  Future<void> fetchInventory() async {
    _isLoadingProducts = true;
    notifyListeners();
    try {
      final res = await _api.get('/admin/inventory?type=inventory');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _inventory = data.map((item) => StockItem.fromJson(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching inventory: $e');
    } finally {
      _isLoadingProducts = false;
      notifyListeners();
    }
  }

  Future<void> fetchTickets() async {
    try {
      final res = await _api.get('/admin/inventory?action=get_tickets');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _tickets = data.map((item) => Ticket.fromJson(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching tickets: $e');
    }
  }

  Future<void> fetchAppUsers() async {
    try {
      final res = await _api.get('/admin/users');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _appUsers = data.map((item) => AppUser.fromJson(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching users: $e');
    }
  }

  Future<void> fetchPayouts() async {
    try {
      final res = await _api.get('/admin/payouts');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _payouts = data.map((item) => Payout.fromJson(item)).toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching payouts: $e');
    }
  }

  // --- ACTIONS ---

  Future<bool> resolveTicket(String ticketId, String action) async {
    try {
      final res = await _api.post('/admin/inventory', {'action': 'resolve_ticket', 'id': ticketId, 'resolution': action});
      if (res.statusCode == 200) {
        fetchTickets();
        return true;
      }
    } catch (e) { debugPrint('Support Error: $e'); }
    return false;
  }

  Future<bool> manageUser(String userId, String action) async {
    try {
      final res = await _api.post('/admin/users', {'action': action, 'userId': userId});
      if (res.statusCode == 200) {
        fetchAppUsers();
        return true;
      }
    } catch (e) { debugPrint('User Action Error: $e'); }
    return false;
  }

  Future<bool> processPayout(String payoutId, String action) async {
    try {
      final res = await _api.post('/admin/payouts', {'payoutId': payoutId, 'action': action});
      if (res.statusCode == 200) {
        fetchPayouts();
        return true;
      }
    } catch (e) { debugPrint('Payout Error: $e'); }
    return false;
  }

  Future<bool> addInventory(Map<String, dynamic> data) async {
    try {
      final res = await _api.post('/admin/inventory', {'action': 'add_inventory', ...data});
      if (res.statusCode == 200) {
        fetchInventory();
        return true;
      }
    } catch (e) { debugPrint('Add Inventory Error: $e'); }
    return false;
  }

  Future<bool> updateInventory(Map<String, dynamic> data) async {
    try {
      final res = await _api.post('/admin/inventory', {'action': 'update_item', ...data});
      if (res.statusCode == 200) {
        fetchInventory();
        return true;
      }
    } catch (e) { debugPrint('Update Inventory Error: $e'); }
    return false;
  }

  Future<void> fetchAllContent() async {
    _isLoadingContent = true;
    notifyListeners();
    await Future.wait([
      fetchBlogs(),
      fetchServices(),
      fetchProjects(),
      fetchTestimonials(),
      fetchRentals(),
      fetchCategories(),
      fetchKB(),
      fetchLeads(),
      fetchStaff(),
      fetchCoupons(),
    ]);
    _isLoadingContent = false;
    notifyListeners();
  }

  Future<void> fetchBlogs() async {
    try {
      final res = await _api.get('/blogs');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _blogs = data.map((i) => Blog.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Blog Fetch Error: $e'); }
  }

  Future<void> fetchServices() async {
    try {
      final res = await _api.get('/services');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _services = data.map((i) => Service.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Service Fetch Error: $e'); }
  }

  Future<void> fetchProjects() async {
    try {
      final res = await _api.get('/projects');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _projects = data.map((i) => Project.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Project Fetch Error: $e'); }
  }

  Future<void> fetchTestimonials() async {
    try {
      final res = await _api.get('/testimonials?all=true');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _testimonials = data.map((i) => Testimonial.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Review Fetch Error: $e'); }
  }

  Future<void> fetchRentals() async {
    try {
      final res = await _api.get('/rentals');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _rentals = data.map((i) => Rental.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Rental Fetch Error: $e'); }
  }

  Future<void> fetchCategories() async {
    try {
      final res = await _api.get('/admin/categories');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _categories = data.map((i) => Category.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Category Fetch Error: $e'); }
  }

  Future<void> fetchKB() async {
    try {
      final res = await _api.get('/kb?admin=true');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _kbArticles = data.map((i) => KBArticle.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('KB Fetch Error: $e'); }
  }

  Future<void> fetchLeads() async {
    try {
      final res = await _api.get('/leads');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _leads = data.map((i) => Lead.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Lead Fetch Error: $e'); }
  }

  Future<void> fetchStaff() async {
    try {
      final res = await _api.get('/hr/employees');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _staff = data.map((i) => Staff.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Staff Fetch Error: $e'); }
  }

  Future<void> fetchCoupons() async {
    try {
      final res = await _api.get('/promocodes');
      if (res.statusCode == 200) {
        final List data = jsonDecode(res.body);
        _coupons = data.map((i) => Coupon.fromJson(i)).toList();
        notifyListeners();
      }
    } catch (e) { debugPrint('Coupon Fetch Error: $e'); }
  }

  // Action Methods
  Future<bool> deleteItem(String path, String id) async {
    try {
      final res = await _api.delete(path, {'id': id});
      if (res.statusCode == 200) {
        fetchAllContent();
        return true;
      }
    } catch (e) { debugPrint('Delete Error: $e'); }
    return false;
  }

  Future<bool> addContent(String path, Map<String, dynamic> data) async {
    try {
      final res = await _api.post(path, data);
      if (res.statusCode == 200) {
        fetchAllContent();
        return true;
      }
    } catch (e) { debugPrint('Add Content Error: $e'); }
    return false;
  }

  Future<bool> executeFinanceAction(String action, Map<String, dynamic> data) async {
    try {
      final res = await _api.post('/finance', {'action': action, ...data});
      if (res.statusCode == 200) {
        fetchStats();
        return true;
      }
    } catch (e) {
      debugPrint('Finance Action Error: $e');
    }
    return false;
  }
}
