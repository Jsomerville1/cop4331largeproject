// lib/widgets/recipient_item.dart

import 'package:flutter/material.dart';
import '../models/recipient.dart';
import '../services/api_service.dart';
import '../dialogs/edit_recipient_dialog.dart';

class RecipientItem extends StatefulWidget {
  final Recipient recipient;
  final VoidCallback onUpdate; // Add this callback to notify parent

  const RecipientItem({
    super.key,
    required this.recipient,
    required this.onUpdate, // Ensure this is passed
  });

  @override
  State<RecipientItem> createState() => _RecipientItemState();
}

class _RecipientItemState extends State<RecipientItem> {
  final ApiService _apiService = ApiService();

  void _editRecipient() async {
    bool? result = await showDialog(
      context: context,
      builder: (context) => EditRecipientDialog(
        recipientId: widget.recipient.recipientId,
        recipientName: widget.recipient.recipientName,
        recipientEmail: widget.recipient.recipientEmail,
      ),
    );

    if (result == true) {
      widget.onUpdate(); // Notify parent to refresh the list
    }
  }

  void _deleteRecipient() async {
    try {
      await _apiService.deleteRecipient(widget.recipient.recipientId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Recipient deleted successfully')),
      );
      widget.onUpdate(); // Notify parent to refresh the list
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting recipient: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(widget.recipient.recipientName),
      subtitle: Text(widget.recipient.recipientEmail),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: _editRecipient,
            tooltip: 'Edit Recipient',
          ),
          IconButton(
            icon: const Icon(Icons.delete),
            onPressed: _deleteRecipient,
            tooltip: 'Delete Recipient',
          ),
        ],
      ),
    );
  }
}
