// lib/screens/user_profile_screen.dart

import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/shared_pref_manager.dart';
import 'login_screen.dart';
import 'change_password_screen.dart'; // Import the ChangePasswordScreen

class UserProfileScreen extends StatefulWidget {
  const UserProfileScreen({super.key});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();
  final ApiService _apiService = ApiService();
  User? _user;

  final Map<String, int> _checkInOptions = {
    '2 Minutes': 120,
    '1 Week': 604800,
    '1 Month': 2592000,
    '1 Year': 31536000,
  };

  String? _selectedFrequency;

  @override
  void initState() {
    super.initState();
    _user = _sharedPrefManager.getUser();
    if (_user == null) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.pushReplacementNamed(context, '/login');
      });
    } else {
      _selectedFrequency = _checkInOptions.keys.firstWhere(
            (key) => _checkInOptions[key] == _user!.checkInFreq,
        orElse: () => '2 Minutes',
      );
    }
  }

  void _logout() async {
    await _sharedPrefManager.clearUser();
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
    );
  }

  void _deleteAccount() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text('Are you sure you want to delete your account?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context), // Cancel
            child: const Text('No'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close the dialog
              _performDeleteAccount();
            },
            child: const Text('Yes'),
          ),
        ],
      ),
    );
  }

  void _performDeleteAccount() async {
    if (_user == null) return;

    Map<String, dynamic> request = {
      'userId': _user!.id,
    };

    try {
      final response = await _apiService.deleteUser(request);
      if (response.error == null || response.error!.isEmpty) {
        await _sharedPrefManager.clearUser();
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const LoginScreen()),
        );
      } else {
        _showToast('Failed to delete account: ${response.error}');
      }
    } catch (e) {
      _showToast('Error: ${e.toString()}');
    }
  }

  void _showToast(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  void _updateCheckInFreq(int newFreq) async {
    if (_user == null) return;

    try {
      final response = await _apiService.updateCheckInFreq(_user!.id, newFreq);

      if (response.error == null) {
        setState(() {
          _user = _user!.copyWith(checkInFreq: newFreq);
        });
        _sharedPrefManager.updateUser(_user!);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Check-In Frequency updated successfully!')),
        );
      } else {
        throw Exception(response.error);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error updating frequency: ${e.toString()}')),
      );
    }
  }

  void _navigateToChangePassword() {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const ChangePasswordScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    // Define button style
    ButtonStyle buttonStyle = ElevatedButton.styleFrom(
      minimumSize: const Size(200, 50), // Set the width and height
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8.0), // Slightly rounded edges
      ),
      textStyle: const TextStyle(fontSize: 16),
    );

    return Scaffold(
      appBar: AppBar(
        title: const Text('User Profile'),
      ),
      body: Center( // Center the content vertically and horizontally
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            // Center all children horizontally
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                'Welcome, ${_user!.firstName} ${_user!.lastName}',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              // Removed User ID display here
              Text(
                'Username: ${_user!.username}',
                style: const TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 8),
              Text(
                'Email: ${_user!.email}',
                style: const TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 8),
              Text(
                'Check-In Frequency: ${_selectedFrequency ?? '2 Minutes'}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _selectedFrequency,
                items: _checkInOptions.keys.map((String key) {
                  return DropdownMenuItem<String>(
                    value: key,
                    child: Text(key),
                  );
                }).toList(),
                onChanged: (value) {
                  if (value != null) {
                    int newFreq = _checkInOptions[value]!;
                    setState(() {
                      _selectedFrequency = value;
                    });
                    _updateCheckInFreq(newFreq);
                  }
                },
                decoration: const InputDecoration(
                  labelText: 'Change Check-In Frequency',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 24),
              // Buttons Section
              Column(
                children: [
                  ElevatedButton(
                    onPressed: _navigateToChangePassword,
                    style: buttonStyle.copyWith(
                      backgroundColor: WidgetStateProperty.all<Color>(Colors.deepPurple),
                    ),
                    child: const Text('Change Password'),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _logout,
                    style: buttonStyle.copyWith(
                      backgroundColor: WidgetStateProperty.all<Color>(Colors.deepPurple),
                    ),
                    child: const Text('Logout'),
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: _deleteAccount,
                    style: buttonStyle.copyWith(
                      backgroundColor: WidgetStateProperty.all<Color>(Colors.purple),
                    ),
                    child: const Text('Delete Account'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
