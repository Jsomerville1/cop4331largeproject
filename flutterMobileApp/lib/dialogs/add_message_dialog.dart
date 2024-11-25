import 'package:flutter/material.dart';
import '../models/add_message_request.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/shared_pref_manager.dart';

class AddMessageDialog extends StatefulWidget {
  const AddMessageDialog({super.key});

  @override
  _AddMessageDialogState createState() => _AddMessageDialogState();
}

class _AddMessageDialogState extends State<AddMessageDialog> {
  final TextEditingController _contentController = TextEditingController();
  final ApiService _apiService = ApiService();
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();
  bool _isLoading = false;

  void _addMessage() async {
    String content = _contentController.text.trim();

    if (content.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Content cannot be empty')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });


    User? user = _sharedPrefManager.getUser();
    if (user == null) {
      Navigator.pop(context, false);
      return;
    }

    AddMessageRequest request =
        AddMessageRequest(userId: user.id, content: content);

    try {
      await _apiService.addMessage(request);
      // Optionally, navigate to add recipient dialog
      Navigator.pop(context, true);
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error adding message: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Message'),
      content: TextField(
        controller: _contentController,
        decoration: const InputDecoration(hintText: 'Enter message content'),
        maxLines: null,
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context, false),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _isLoading ? null : _addMessage,
          child: _isLoading
              ? const CircularProgressIndicator()
              : const Text('Add'),
        ),
      ],
    );
  }
}
