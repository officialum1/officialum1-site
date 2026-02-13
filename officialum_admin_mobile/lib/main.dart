import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/auth_provider.dart';
import 'providers/main_provider.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation_container.dart';

import 'package:workmanager/workmanager.dart';
import 'services/api_service.dart';

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    const String bumpTask = "com.officialum1.bump_threads";
    if (task == bumpTask) {
      try {
        final api = ApiService();
        await api.post('/admin/playerup', {
          'action': 'cloud_bump_all',
          'limit': 10
        });
      } catch (e) {
        debugPrint("Background Bump Error: $e");
      }
    }
    return Future.value(true);
  });
}

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  Workmanager().initialize(
    callbackDispatcher,
    isInDebugMode: false,
  );
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => MainProvider()),
      ],
      child: const OfficialUM1AdminApp(),
    ),
  );
}

class OfficialUM1AdminApp extends StatelessWidget {
  const OfficialUM1AdminApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OfficialUM1 Admin',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF050505),
        primaryColor: const Color(0xFF00FF88),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00FF88),
          secondary: Color(0xFF00CCFF),
          surface: Color(0xFF111111),
        ),
        textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
      ),
      home: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (auth.isLoading) {
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(color: Color(0xFF00FF88)),
              ),
            );
          }
          return auth.isAuthenticated ? const MainNavigationContainer() : const LoginScreen();
        },
      ),
    );
  }
}
