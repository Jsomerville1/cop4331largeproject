import 'package:flutter/material.dart';
import '../models/message.dart';
import '../models/edit_message_request.dart';
import '../services/api_service.dart';

class EditMessageDialog extends StatefulWidget {
  final Message message;

  const EditMessageDialog({super.key, required this.message});

  @override
  _EditMessageDialogState createState() => _EditMessageDialogState();
}

class _EditMessageDialogState extends State<EditMessageDialog> {
  final TextEditingController _contentController = TextEditingController();
  final ApiService _apiService = ApiService();
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _contentController.text = widget.message.content;
  }

  void _editMessage() async {
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

    EditMessageRequest request = EditMessageRequest(
      messageId: widget.message.messageId,
      userId: widget.message.userId,
      content: content,
    );

    try {
      await _apiService.editMessage(request);
      Navigator.pop(context, true);
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error editing message: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Edit Message'),
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
          onPressed: _isLoading ? null : _editMessage,
          child: _isLoading
              ? const CircularProgressIndicator()
              : const Text('Save'),
        ),
      ],
    );
  }
}
