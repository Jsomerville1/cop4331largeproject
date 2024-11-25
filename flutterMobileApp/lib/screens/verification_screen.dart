// lib/screens/verification_screen.dart

import 'package:flutter/material.dart';
import '../models/verification_request.dart';
import '../models/verification_response.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class VerificationScreen extends StatefulWidget {
  final String username;

  const VerificationScreen({super.key, required this.username});

  @override
  State<VerificationScreen> createState() => _VerificationScreenState();
}

class _VerificationScreenState extends State<VerificationScreen> {
  final TextEditingController _verificationCodeController = TextEditingController();
  final ApiService _apiService = ApiService();

  String _verificationMessage = '';
  bool _isLoading = false;
  bool _isVerified = false;

  @override
  void dispose() {
    _verificationCodeController.dispose();
    super.dispose();
  }

  void _verifyUser() async {
    String code = _verificationCodeController.text.trim();

    if (code.isEmpty) {
      setState(() {
        _verificationMessage = 'Please enter the verification code.';
      });
      return;
    }

    setState(() {
      _verificationMessage = '';
      _isLoading = true;
    });

    VerificationRequest verificationRequest = VerificationRequest(
      username: widget.username,
      code: code,
    );

    try {
      VerificationResponse verificationResponse =
      await _apiService.verifyUser(verificationRequest);

      if (verificationResponse.error != null && verificationResponse.error!.isNotEmpty) {
        setState(() {
          _verificationMessage = verificationResponse.error!;
          _isLoading = false;
        });
      } else {
        setState(() {
          _verificationMessage = verificationResponse.message ?? 'Verification successful.';
          _isVerified = true;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _verificationMessage = 'Error: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  void _returnToLogin() {
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Verification'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            TextField(
              controller: _verificationCodeController,
              decoration: const InputDecoration(
                hintText: 'Verification Code',
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _isLoading ? null : _verifyUser,
              child: _isLoading
                  ? const SizedBox(
                height: 16.0,
                width: 16.0,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  strokeWidth: 2.0,
                ),
              )
                  : const Text('Verify'),
            ),
            const SizedBox(height: 16),
            Text(
              _verificationMessage,
              style: const TextStyle(color: Colors.red),
            ),
            const SizedBox(height: 24),
            Visibility(
              visible: _isVerified,
              child: ElevatedButton(
                onPressed: _returnToLogin,
                child: const Text('Return to Login'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
