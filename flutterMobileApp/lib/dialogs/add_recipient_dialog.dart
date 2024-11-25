import 'package:flutter/material.dart';
import '../models/add_recipient_request.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/shared_pref_manager.dart';

class AddRecipientDialog extends StatefulWidget {
  final int messageId;

  const AddRecipientDialog({super.key, required this.messageId});

  @override
  State<AddRecipientDialog> createState() => _AddRecipientDialogState();
}

class _AddRecipientDialogState extends State<AddRecipientDialog> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  final ApiService _apiService = ApiService();
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();

  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _addRecipient() async {
    setState(() {
      _errorMessage = '';
      _isLoading = true;
    });

    String name = _nameController.text.trim();
    String email = _emailController.text.trim();

    if (name.isEmpty || email.isEmpty) {
      setState(() {
        _errorMessage = 'All fields are required.';
        _isLoading = false;
      });
      return;
    }

    User? user = _sharedPrefManager.getUser();
    if (user == null) {
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    try {
      AddRecipientRequest request = AddRecipientRequest(
        userId: user.id,
        messageId: widget.messageId,
        recipientName: name,
        recipientEmail: email,
      );
      await _apiService.addRecipient(request);
      Navigator.pop(context, true);
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Recipient'),
      content: SingleChildScrollView(
        child: Column(
          children: [
            // Recipient Name
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                hintText: 'Recipient Name',
              ),
            ),
            const SizedBox(height: 8),
            // Recipient Email
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                hintText: 'Recipient Email',
              ),
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
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _isLoading ? null : _addRecipient,
          child: _isLoading
              ? const SizedBox(
                  height: 16.0,
                  width: 16.0,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.0,
                  ),
                )
              : const Text('Save'),
        ),
      ],
    );
  }
}
