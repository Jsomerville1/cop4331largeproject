// lib/screens/change_password_screen.dart

import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../utils/shared_pref_manager.dart';
import '../models/user.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();
  final ApiService _apiService = ApiService();

  final TextEditingController _currentPasswordController = TextEditingController();
  final TextEditingController _newPasswordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();

  bool _isLoading = false;
  String _message = '';

  void _changePassword() async {
    setState(() {
      _message = '';
      _isLoading = true;
    });

    String currentPassword = _currentPasswordController.text.trim();
    String newPassword = _newPasswordController.text.trim();
    String confirmPassword = _confirmPasswordController.text.trim();

    // Input Validation
    if (currentPassword.isEmpty || newPassword.isEmpty || confirmPassword.isEmpty) {
      setState(() {
        _message = 'All fields are required.';
        _isLoading = false;
      });
      return;
    }

    if (newPassword != confirmPassword) {
      setState(() {
        _message = 'New password and confirmation do not match.';
        _isLoading = false;
      });
      return;
    }

    // Optional: Add password strength validation here

    try {
      User? user = _sharedPrefManager.getUser();
      if (user == null) {
        setState(() {
          _message = 'User not logged in.';
          _isLoading = false;
        });
        return;
      }

      await _apiService.changePassword(
        userId: user.id,
        currentPassword: currentPassword,
        newPassword: newPassword,
      );

      setState(() {
        _message = 'Password changed successfully.';
        _isLoading = false;
      });

      // Optionally, log the user out after password change
      // await _sharedPrefManager.clearUser();
      // Navigator.pushReplacementNamed(context, '/login');
    } catch (e) {
      setState(() {
        _message = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  @override
  void dispose() {
    _currentPasswordController.dispose();
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          title: const Text('Change Password'),
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: SingleChildScrollView(
            child: Column(
              children: [
                // Instruction Text
                const Text(
                  'Enter your current password and set a new password.',
                  style: TextStyle(fontSize: 16),
                ),
                const SizedBox(height: 16),
                // Current Password Input
                TextField(
                  controller: _currentPasswordController,
                  decoration: const InputDecoration(
                    labelText: 'Current Password',
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                // New Password Input
                TextField(
                  controller: _newPasswordController,
                  decoration: const InputDecoration(
                    labelText: 'New Password',
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                // Confirm New Password Input
                TextField(
                  controller: _confirmPasswordController,
                  decoration: const InputDecoration(
                    labelText: 'Confirm New Password',
                    border: OutlineInputBorder(),
                  ),
                  obscureText: true,
                ),
                const SizedBox(height: 24),
                // Change Password Button
                ElevatedButton(
                  onPressed: _isLoading ? null : _changePassword,
                  child: _isLoading
                      ? const SizedBox(
                    height: 16.0,
                    width: 16.0,
                    child: CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      strokeWidth: 2.0,
                    ),
                  )
                      : const Text('Change Password'),
                ),
                const SizedBox(height: 16),
                // Message Display
                Text(
                  _message,
                  style: TextStyle(
                    color: _message.startsWith('Password changed') ? Colors.green : Colors.red,
                  ),
                ),
              ],
            ),
          ),
        ));
  }
}
