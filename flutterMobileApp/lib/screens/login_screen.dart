// lib/screens/login_screen.dart

import 'package:afterwords/screens/main_screen.dart';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/shared_pref_manager.dart';
import 'register_screen.dart'; // Import the RegisterScreen
import 'forgot_password_screen.dart'; // Import the ForgotPasswordScreen

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Controllers for text fields
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  final ApiService _apiService = ApiService();
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();

  String _errorMessage = '';
  bool _isLoading = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _loginUser() async {
    setState(() {
      _errorMessage = '';
      _isLoading = true;
    });

    String username = _usernameController.text.trim();
    String password = _passwordController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter both username and password.';
        _isLoading = false;
      });
      return;
    }

    try {
      User? user = await _apiService.loginUser(username, password);

      if (user != null) {
        // Save user data to shared preferences
        await _sharedPrefManager.saveUser(user);

        // Navigate to MainScreen
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const MainScreen()),
        );
      } else {
        setState(() {
          _errorMessage = 'Login failed. Please try again.';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _navigateToRegister() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const RegisterScreen()),
    );
  }

  void _navigateToForgotPassword() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ForgotPasswordScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            // Username
            TextField(
              controller: _usernameController,
              decoration: const InputDecoration(
                hintText: 'Username',
              ),
            ),
            const SizedBox(height: 8),
            // Password
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(
                hintText: 'Password',
              ),
              obscureText: true,
            ),
            const SizedBox(height: 24),
            // Login Button
            ElevatedButton(
              onPressed: _isLoading ? null : _loginUser,
              child: _isLoading
                  ? const SizedBox(
                height: 16.0,
                width: 16.0,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  strokeWidth: 2.0,
                ),
              )
                  : const Text('Login'),
            ),
            const SizedBox(height: 16),
            // Error Message
            Text(
              _errorMessage,
              style: const TextStyle(color: Colors.red),
            ),
            const SizedBox(height: 24),
            // Register Navigation
            TextButton(
              onPressed: _navigateToRegister,
              child: const Text('Don\'t have an account? Register here.'),
            ),
            // Forgot Password Navigation
            TextButton(
              onPressed: _navigateToForgotPassword,
              child: const Text('Forgot Password?'),
            ),
          ],
        ),
      ),
    );
  }
}
