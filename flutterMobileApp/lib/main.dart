// lib/main.dart

import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/reset_password_screen.dart';
import 'screens/forgot_password_screen.dart';
import 'screens/main_screen.dart';
import 'utils/shared_pref_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SharedPrefManager().init();

  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();

  MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final user = _sharedPrefManager.getUser();

    // Define the dark theme
    final ThemeData darkTheme = ThemeData(
      brightness: Brightness.dark,
      primaryColor: Colors.black,
      scaffoldBackgroundColor: Colors.black,
      hintColor: Colors.white,
      appBarTheme: const AppBarTheme(
        color: Colors.black,
      ),
      textTheme: const TextTheme(
        bodyLarge: TextStyle(color: Colors.white),
        bodyMedium: TextStyle(color: Colors.white),
        bodySmall: TextStyle(color: Colors.white70),
      ),
      iconTheme: const IconThemeData(
        color: Colors.white,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.black,
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.grey,
      ),
    );

    return MaterialApp(
      title: 'AfterWords App',
      theme: darkTheme,
      home: user != null ? const MainScreen() : const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/register': (context) => const RegisterScreen(),
        '/forgotPassword': (context) => const ForgotPasswordScreen(),
        '/resetPassword': (context) => const ResetPasswordScreen(),
        '/main': (context) => const MainScreen(),
        // Add other routes if needed
      },
    );
  }
}
