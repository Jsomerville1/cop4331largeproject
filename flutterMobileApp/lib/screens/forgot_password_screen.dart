// lib/screens/forgot_password_screen.dart

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import 'reset_password_screen.dart'; // Import ResetPasswordScreen

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final TextEditingController _emailController = TextEditingController();
  final ApiService _apiService = ApiService();

  String _message = '';
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  void _sendResetEmail() async {
    setState(() {
      _message = '';
      _isLoading = true;
    });

    String email = _emailController.text.trim();

    if (email.isEmpty) {
      setState(() {
        _message = 'Please enter your registered email.';
        _isLoading = false;
      });
      return;
    }

    try {
      await _apiService.forgotPassword(email);
      setState(() {
        _message = 'Password reset token sent. Please check your email.';
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _message = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _navigateToResetPassword() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ResetPasswordScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Forgot Password'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Instruction Text
              const Text(
                'Enter your registered email to receive a password reset token.',
                style: TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              // Email Input
              TextField(
                controller: _emailController,
                decoration: const InputDecoration(
                  hintText: 'Email',
                  border: OutlineInputBorder(),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 24),
              // Send Reset Email Button
              ElevatedButton(
                onPressed: _isLoading ? null : _sendResetEmail,
                child: _isLoading
                    ? const SizedBox(
                  height: 16.0,
                  width: 16.0,
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    strokeWidth: 2.0,
                  ),
                )
                    : const Text('Send Reset Token'),
              ),
              const SizedBox(height: 16),
              // Message Display
              Text(
                _message,
                style: TextStyle(
                  color: _message.startsWith('Password reset') ? Colors.green : Colors.red,
                ),
              ),
              const SizedBox(height: 24),
              // Navigate to Reset Password Screen
              TextButton(
                onPressed: _navigateToResetPassword,
                child: const Text('Have a reset token? Reset Password'),
              ),
            ],
          ),
        ));
  }
}
