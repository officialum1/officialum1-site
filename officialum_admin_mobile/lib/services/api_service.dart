import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter/foundation.dart';

class ApiService {
  static const String baseUrl = 'https://officialum1.com/api';
  final _storage = const FlutterSecureStorage();

  Future<Map<String, String>> _getHeaders() async {
    String? token = await _storage.read(key: 'auth_token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'OfficialUM1-Admin-App/1.2.0',
      if (token != null) 'Cookie': 'admin_token=$token',
    };
  }

  Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    debugPrint('API GET: $url');
    return await http.get(url, headers: headers).timeout(const Duration(seconds: 15));
  }

  Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    debugPrint('API POST: $url');
    return await http.post(url, headers: headers, body: jsonEncode(body)).timeout(const Duration(seconds: 15));
  }

  Future<http.Response> delete(String endpoint, [Map<String, dynamic>? body]) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final headers = await _getHeaders();
    debugPrint('API DELETE: $url');
    return await http.delete(url, headers: headers, body: body != null ? jsonEncode(body) : null).timeout(const Duration(seconds: 15));
  }
}
