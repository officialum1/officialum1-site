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

  Future<String?> login(String email, String password) async {
    try {
      final response = await _api.post('/admin/login', {
        'email': email,
        'password': password,
      });
      
      final data = jsonDecode(response.body);
      
      if (response.statusCode == 200 && data['success'] == true) {
        await _storage.write(key: 'auth_token', value: 'authenticated_session_v1');
        await _storage.write(key: 'user_email', value: email);
        await _storage.write(key: 'user_role', value: data['role'] ?? 'admin');
        
        _isAuthenticated = true;
        notifyListeners();
        return null; // Success
      } else {
        return data['message'] ?? 'Invalid Credentials';
      }
    } catch (e) {
      return 'Connection Error';
    }
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    _isAuthenticated = false;
    notifyListeners();
  }
}
