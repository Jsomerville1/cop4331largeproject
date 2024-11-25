// lib/screens/register_screen.dart

import 'package:flutter/material.dart';
import 'package:afterwords/models/register_request.dart';
import 'package:afterwords/models/register_response.dart';
import 'package:afterwords/services/api_service.dart';
import 'verification_screen.dart'; // You'll create this later

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  // Controllers for text fields
  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _registerUsernameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _registerPasswordController = TextEditingController();

  int _selectedFreq = 0; // Check-in frequency
  String _errorMessage = '';
  bool _isLoading = false;

  final ApiService _apiService = ApiService();

  @override

  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _registerUsernameController.dispose();
    _emailController.dispose();
    _registerPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Register'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // First Name
            TextField(
              controller: _firstNameController,
              decoration: const InputDecoration(
                hintText: 'First Name',
              ),
            ),
            const SizedBox(height: 8),
            // Last Name
            TextField(
              controller: _lastNameController,
              decoration: const InputDecoration(
                hintText: 'Last Name',
              ),
            ),
            const SizedBox(height: 8),
            // Username
            TextField(
              controller: _registerUsernameController,
              decoration: const InputDecoration(
                hintText: 'Username',
              ),
            ),
            const SizedBox(height: 8),
            // Email
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                hintText: 'Email',
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 8),
            // Password
            TextField(
              controller: _registerPasswordController,
              decoration: const InputDecoration(
                hintText: 'Password',
              ),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            // Check-In Frequency
            const Text('Check-In Frequency'),
            const SizedBox(height: 8),
            _buildCheckInFrequencyOptions(),
            const SizedBox(height: 24),
            // Register Button
            ElevatedButton(
              onPressed: _registerUser,
              child: const Text('Register'),
            ),
            const SizedBox(height: 16),
            // Error Message
            Text(
              _errorMessage,
              style: const TextStyle(color: Colors.red),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckInFrequencyOptions() {
    return Column(
      children: [
        RadioListTile<int>(
          title: const Text('2 minutes'),
          value: 2,
          groupValue: _selectedFreq,
          onChanged: (value) {
            setState(() {
              _selectedFreq = value!;
            });
          },
        ),
        RadioListTile<int>(
          title: const Text('1 week (7 days)'),
          value: 7,
          groupValue: _selectedFreq,
          onChanged: (value) {
            setState(() {
              _selectedFreq = value!;
            });
          },
        ),
        RadioListTile<int>(
          title: const Text('1 month (30 days)'),
          value: 30,
          groupValue: _selectedFreq,
          onChanged: (value) {
            setState(() {
              _selectedFreq = value!;
            });
          },
        ),
        RadioListTile<int>(
          title: const Text('1 year (365 days)'),
          value: 365,
          groupValue: _selectedFreq,
          onChanged: (value) {
            setState(() {
              _selectedFreq = value!;
            });
          },
        ),
      ],
    );
  }

  void _registerUser() async {
    setState(() {
      _errorMessage = '';
      _isLoading = true;
    });

    String firstName = _firstNameController.text.trim();
    String lastName = _lastNameController.text.trim();
    String username = _registerUsernameController.text.trim();
    String email = _emailController.text.trim();
    String password = _registerPasswordController.text.trim();

    if (firstName.isEmpty ||
        lastName.isEmpty ||
        username.isEmpty ||
        email.isEmpty ||
        password.isEmpty ||
        _selectedFreq == 0) {
      setState(() {
        _errorMessage = 'Please fill out all fields.';
        _isLoading = false;
      });
      return;
    }

    RegisterRequest registerRequest = RegisterRequest(
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password,
      checkInFreq: _selectedFreq,
    );

    try {
      RegisterResponse registerResponse = await _apiService.registerUser(registerRequest);

      if (registerResponse.error != null && registerResponse.error!.isNotEmpty) {
        setState(() {
          _errorMessage = registerResponse.error!;
          _isLoading = false;
        });
      } else {
        // Navigate to VerificationScreen
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => VerificationScreen(username: username),
          ),
        );
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: ${e.toString()}';
        _isLoading = false;
      });
    }
  }
}
