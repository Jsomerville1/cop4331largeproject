

import 'package:flutter/material.dart';
import '../models/message.dart';
import '../models/document.dart'; // New import
import '../models/recipient.dart';
import '../services/api_service.dart';
import '../dialogs/add_recipient_dialog.dart';
import '../dialogs/edit_message_dialog.dart';
import '../dialogs/edit_recipient_dialog.dart';

class MessageItem extends StatefulWidget {
  final Message? message;
  final Document? document; // New field
  final List<Recipient>? recipients; // Optional for PDFs
  final VoidCallback onUpdate;
  final bool isPdf; // New flag to differentiate

  const MessageItem({
    super.key,
    this.message,
    this.document,
    this.recipients,
    required this.onUpdate,
    required this.isPdf,
  });

  @override
  _MessageItemState createState() => _MessageItemState();
}

class _MessageItemState extends State<MessageItem> {
  final ApiService _apiService = ApiService();
  bool _isDeleting = false;

  void _showAddRecipientDialog() async {
    if (widget.isPdf) return; // PDFs don't have recipients
    bool? result = await showDialog(
      context: context,
      builder: (context) => AddRecipientDialog(messageId: widget.message!.messageId),
    );

    if (result == true) {
      widget.onUpdate();
    }
  }

  void _showEditRecipientDialog(Recipient recipient) async {
    if (widget.isPdf) return; // PDFs don't have recipients
    bool? result = await showDialog(
      context: context,
      builder: (context) => EditRecipientDialog(
        recipientId: recipient.recipientId,
        recipientName: recipient.recipientName,
        recipientEmail: recipient.recipientEmail,
      ),
    );

    if (result == true) {
      widget.onUpdate();
    }
  }

  void _deleteRecipient(int recipientId) async {
    if (widget.isPdf) return; // PDFs don't have recipients
    try {
      await _apiService.deleteRecipient(recipientId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Recipient deleted successfully')),
      );
      widget.onUpdate();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting recipient: $e')),
      );
    }
  }

  void _showEditMessageDialog() async {
    if (widget.isPdf) return; // PDFs don't have messages to edit
    bool? result = await showDialog(
      context: context,
      builder: (context) => EditMessageDialog(message: widget.message!),
    );

    if (result == true) {
      widget.onUpdate();
    }
  }

  void _deleteMessage() async {
    if (widget.isPdf) return; // PDFs might have separate deletion logic
    setState(() {
      _isDeleting = true;
    });
    try {
      await _apiService.deleteMessage(widget.message!.messageId, widget.message!.userId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Message deleted successfully')),
      );
      widget.onUpdate();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting message: $e')),
      );
    } finally {
      setState(() {
        _isDeleting = false;
      });
    }
  }

  void _deleteDocument() async {
    setState(() {
      _isDeleting = true;
    });
    try {
      // Implement deleteDocument method in ApiService if needed
      // Example:
      // await _apiService.deleteDocument(widget.document!.documentId);
      // For now, assume it's implemented
      // await _apiService.deleteDocument(widget.document!.documentId);

      // Placeholder for deletion
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Document deleted successfully')),
      );
      widget.onUpdate();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error deleting document: $e')),
      );
    } finally {
      setState(() {
        _isDeleting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.isPdf && widget.document != null) {
      // Display PDF entry
      return Card(
        child: ListTile(
          leading: const Icon(Icons.picture_as_pdf, color: Colors.red),
          title: Text(widget.document!.title),
          subtitle: Text('Recipient: ${widget.document!.recipientName} (${widget.document!.recipientEmail})'),
          trailing: _isDeleting
              ? const SizedBox(
            height: 24.0,
            width: 24.0,
            child: CircularProgressIndicator(strokeWidth: 2.0),
          )
              : PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'delete') {
                _deleteDocument();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'delete',
                child: Text('Delete PDF'),
              ),
            ],
          ),
          onTap: () {
            // Optionally, implement PDF viewing functionality
          },
        ),
      );
    } else if (widget.message != null) {
      // Display Text Message
      return Card(
        child: ExpansionTile(
          title: Text('Message ${widget.message!.messageId}'),
          subtitle: Text(widget.message!.content),
          trailing: _isDeleting
              ? const SizedBox(
            height: 24.0,
            width: 24.0,
            child: CircularProgressIndicator(strokeWidth: 2.0),
          )
              : PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'edit') {
                _showEditMessageDialog();
              } else if (value == 'delete') {
                _deleteMessage();
              } else if (value == 'add_recipient') {
                _showAddRecipientDialog();
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'edit',
                child: Text('Edit Message'),
              ),
              const PopupMenuItem(
                value: 'delete',
                child: Text('Delete Message'),
              ),
              const PopupMenuItem(
                value: 'add_recipient',
                child: Text('Add Recipient'),
              ),
            ],
          ),
          children: widget.recipients == null || widget.recipients!.isEmpty
              ? [const ListTile(title: Text('No recipients added'))]
              : widget.recipients!.map((recipient) {
            return ListTile(
              title: Text(recipient.recipientName),
              subtitle: Text(recipient.recipientEmail),
              trailing: PopupMenuButton<String>(
                onSelected: (value) {
                  if (value == 'edit') {
                    _showEditRecipientDialog(recipient);
                  } else if (value == 'delete') {
                    _deleteRecipient(recipient.recipientId);
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'edit',
                    child: Text('Edit Recipient'),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Text('Delete Recipient'),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      );
    } else {
      return const SizedBox.shrink(); // Empty widget for unexpected cases
    }
  }
}
