import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'main_navigation_container.dart';

class WebModuleScreen extends StatefulWidget {
  final String title;
  final String url;

  const WebModuleScreen({super.key, required this.title, required this.url});

  @override
  State<WebModuleScreen> createState() => _WebModuleScreenState();
}

class _WebModuleScreenState extends State<WebModuleScreen> {
  late final WebViewController _controller;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {},
          onPageStarted: (String url) {
            setState(() {
              _isLoading = true;
            });
          },
          onPageFinished: (String url) {
            setState(() {
              _isLoading = false;
            });
            
            // Clean up web UI (hide navs, hide sidebar, hide footer)
            _controller.runJavaScript("""
              const style = document.createElement('style');
              style.innerHTML = 'nav, footer, .sidebar, #sidebar-nav { display: none !important; } .main-content { margin-left: 0 !important; width: 100% !important; } body { padding-top: 0 !important; }';
              document.head.appendChild(style);
            """);
          },
          onWebResourceError: (WebResourceError error) {},
          onNavigationRequest: (NavigationRequest request) {
            return NavigationDecision.navigate;
          },
        ),
      );

    _initCookieAndLoad();
  }

  Future<void> _initCookieAndLoad() async {
    const storage = FlutterSecureStorage();
    final token = await storage.read(key: 'auth_token');
    
    if (token != null) {
      final cookieManager = WebViewCookieManager();
      await cookieManager.setCookie(
        WebViewCookie(
          name: 'admin_token',
          value: 'authenticated_session_v1', // The hardcoded token we use for now
          domain: 'officialum1.com',
          path: '/',
        ),
      );
    }
    
    _controller.loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text(widget.title, style: const TextStyle(fontSize: 14, letterSpacing: 1, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.black,
        elevation: 0,
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => _controller.reload(),
          ),
        ],
      ),
      body: Stack(
        children: [
          WebViewWidget(controller: _controller),
          if (_isLoading)
            const Center(
              child: CircularProgressIndicator(color: Color(0xFF00FF88)),
            ),
        ],
      ),
    );
  }
}
