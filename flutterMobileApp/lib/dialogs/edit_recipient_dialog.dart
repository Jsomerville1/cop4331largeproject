// lib/dialogs/edit_recipient_dialog.dart

import 'package:flutter/material.dart';
import '../services/api_service.dart';

class EditRecipientDialog extends StatefulWidget {
  final int recipientId;
  final String recipientName;
  final String recipientEmail;

  const EditRecipientDialog({
    super.key,
    required this.recipientId,
    required this.recipientName,
    required this.recipientEmail,
  });

  @override
  State<EditRecipientDialog> createState() => _EditRecipientDialogState();
}

class _EditRecipientDialogState extends State<EditRecipientDialog> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  final ApiService _apiService = ApiService();

  bool _isLoading = false;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _nameController.text = widget.recipientName;
    _emailController.text = widget.recipientEmail;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  void _editRecipient() async {
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

    try {
      // Assuming no messageId is needed when editing from RecipientsScreen
      await _apiService.editRecipient(
        recipientId: widget.recipientId,
        recipientName: name,
        recipientEmail: email,
        // messageId: null, // Omitted
      );
      Navigator.pop(context, true); // Indicate success
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error editing recipient: $_errorMessage')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Recipient'),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Recipient Name
            TextField(
              controller: _nameController,
              decoration: const InputDecoration(
                hintText: 'Recipient Name',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 8),
            // Recipient Email
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(
                hintText: 'Recipient Email',
                border: OutlineInputBorder(),
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: 16),
            // Error Message
            if (_errorMessage.isNotEmpty)
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
          onPressed: _isLoading ? null : _editRecipient,
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
