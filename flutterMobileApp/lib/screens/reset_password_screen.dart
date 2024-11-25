// lib/screens/reset_password_screen.dart

import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String? resetToken; // Optional: For manual entry

  const ResetPasswordScreen({super.key, this.resetToken});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final TextEditingController _tokenController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final ApiService _apiService = ApiService();

  String _message = '';
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    if (widget.resetToken != null) {
      _tokenController.text = widget.resetToken!;
    }
  }

  @override
  void dispose() {
    _tokenController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  void _resetPassword() async {
    setState(() {
      _message = '';
      _isLoading = true;
    });

    String resetToken = _tokenController.text.trim();
    String newPassword = _newPasswordController.text.trim();
    String confirmPassword = _confirmPasswordController.text.trim();

    if (resetToken.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      setState(() {
        _message = 'All fields are required.';
        _isLoading = false;
      });
      return;
    }

    if (newPassword != confirmPassword) {
      setState(() {
        _message = 'Passwords do not match.';
        _isLoading = false;
      });
      return;
    }

    try {
      await _apiService.resetPassword(resetToken, newPassword);
      setState(() {
        _message = 'Password has been reset successfully.';
        _isLoading = false;
      });
      // Optionally, navigate back to login screen after reset
      Navigator.pop(context);
    } catch (e) {
      setState(() {
        _message = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  void _navigateToLogin() {
    Navigator.popUntil(context, (route) => route.isFirst);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Reset Password'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: SingleChildScrollView(
            child: Column(
              children: [
                // Instruction Text
                const Text(
                  'Enter the reset token you received and set a new password.',
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 16),
                // Reset Token Input
                TextField(
                  controller: _tokenController,
                  decoration: const InputDecoration(
                    hintText: 'Reset Token',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 16),
                // New Password Input
                TextField(
                  controller: _newPasswordController,
                  decoration: const InputDecoration(
                    hintText: 'New Password',
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                // Confirm Password Input
                TextField(
                  controller: _confirmPasswordController,
                  decoration: const InputDecoration(
                    hintText: 'Confirm New Password',
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 24),
                // Reset Password Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _resetPassword,
                  child: _isLoading
                      ? const SizedBox(
                    height: 16.0,
                    width: 16.0,
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      strokeWidth: 2.0,
                    ),
                  )
                      : const Text('Reset Password'),
                ),
                const SizedBox(height: 16),
                // Message Display
                Text(
                  _message,
                  style: TextStyle(
                    color: _message.startsWith('Password has been') ? Colors.green : Colors.red,
                  ),
                ),
                const SizedBox(height: 24),
                // Navigate to Login Screen
                TextButton(
                  onPressed: _navigateToLogin,
                  child: const Text('Back to Login'),
                ),
              ],
            ),
          ),
        ));
  }
}
