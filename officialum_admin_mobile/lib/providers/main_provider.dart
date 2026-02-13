import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/app_models.dart';
import '../services/api_service.dart';

class MainProvider with ChangeNotifier {
  final _api = ApiService();

  List<Product> _products = [];
  List<Order> _orders = [];
  List<G2GOrder> _g2gOrders = [];
  Map<String, dynamic>? _stats;

  bool _isLoadingProducts = false;
  bool _isLoadingOrders = false;
  bool _isLoadingG2G = false;

  List<Product> get products => _products;
  List<Order> get orders => _orders;
  List<G2GOrder> get g2gOrders => _g2gOrders;
  Map<String, dynamic>? get stats => _stats;

  bool get isLoadingProducts => _isLoadingProducts;
  bool get isLoadingOrders => _isLoadingOrders;
  bool get isLoadingG2G => _isLoadingG2G;

  Future<void> fetchStats() async {
    try {
      final res = await _api.get('/admin/stats');
      if (res.statusCode == 200) {
        _stats = jsonDecode(res.body);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error fetching stats: $e');
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

  Future<bool> recordSale(Map<String, dynamic> data) async {
    try {
      final res = await _api.post('/admin/inventory', {
        'action': 'record_sale',
        ...data,
      });
      if (res.statusCode == 200) {
        fetchStats();
        fetchProducts();
        return true;
      }
    } catch (e) {
      debugPrint('Error recording sale: $e');
    }
    return false;
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
}
