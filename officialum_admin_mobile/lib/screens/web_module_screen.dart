import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
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
  bool _canGoBack = false;

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
          onPageFinished: (String url) async {
            setState(() {
              _isLoading = false;
            });
            
            final back = await _controller.canGoBack();
            setState(() {
              _canGoBack = back;
            });

            // Clean up web UI (hide navs, hide sidebar, hide footer)
            _controller.runJavaScript("""
              const style = document.createElement('style');
              style.innerHTML = 'nav, footer, .sidebar, #sidebar-nav, .mobile-only-nav { display: none !important; } .main-content { margin-left: 0 !important; width: 100% !important; } body { padding-top: 0 !important; }';
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
          value: 'authenticated_session_v1',
          domain: 'officialum1.com',
          path: '/',
        ),
      );
    }
    
    _controller.loadRequest(Uri.parse(widget.url));
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    
    return WillPopScope(
      onWillPop: () async {
        if (await _controller.canGoBack()) {
          _controller.goBack();
          return false;
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        appBar: AppBar(
          backgroundColor: Colors.black,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.menu, color: Color(0xFF00FF88)),
            onPressed: () => MainNavigationContainer.scaffoldKey.currentState?.openDrawer(),
          ),
          title: Text(widget.title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 1)),
          actions: [
            if (_canGoBack)
              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white70, size: 18),
                onPressed: () => _controller.goBack(),
              ),
            if (!auth.isAuthenticated)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
                child: TextButton(
                  onPressed: () {
                    // Navigate to our native login screen
                    // We can use the global scaffold key to get context or just pop to login
                    // For now, we'll let the user open the drawer to find the login
                    MainNavigationContainer.scaffoldKey.currentState?.openDrawer();
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: const Color(0xFF00FF88).withOpacity(0.1),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    side: const BorderSide(color: Color(0xFF00FF88), width: 1),
                  ),
                  child: const Text('LOG IN', style: TextStyle(color: Color(0xFF00FF88), fontSize: 10, fontWeight: FontWeight.bold)),
                ),
              ),
            IconButton(
              icon: const Icon(Icons.refresh, size: 20),
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
      ),
    );
  }
}
