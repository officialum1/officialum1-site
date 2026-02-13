import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../services/api_service.dart';

class AuthProvider with ChangeNotifier {
  final _storage = const FlutterSecureStorage();
  final _api = ApiService();
  bool _isAuthenticated = false;
  bool _isLoading = true;

  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  AuthProvider() {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    String? token = await _storage.read(key: 'auth_token');
    if (token != null) {
      // Potentially verify token with a ping to the server
      _isAuthenticated = true;
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> login(String password) async {
    try {
      final response = await _api.post('/admin/login', {'password': password});
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data['success'] == true) {
          // In your Next.js auth, it sets a cookie. We might need to handle 
          // success specifically if the server doesn't return a token in body
          // But for native, usually we'd expect a token. 
          // Since the website uses cookies, we will treat 'success' as authed.
          await _storage.write(key: 'auth_token', value: 'authenticated_session_v1');
          _isAuthenticated = true;
          notifyListeners();
          return true;
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    _isAuthenticated = false;
    notifyListeners();
  }
}
