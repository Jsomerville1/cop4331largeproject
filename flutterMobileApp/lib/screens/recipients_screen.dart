// lib/screens/recipients_screen.dart

import 'package:flutter/material.dart';
import '../models/recipient.dart';
import '../models/recipient_response.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/shared_pref_manager.dart';
import '../dialogs/search_recipient_dialog.dart'; // Import the SearchRecipientDialog
import '../widgets/recipient_item.dart';

class RecipientsScreen extends StatefulWidget {
  const RecipientsScreen({super.key});

  @override
  State<RecipientsScreen> createState() => _RecipientsScreenState();
}

class _RecipientsScreenState extends State<RecipientsScreen> {
  final ApiService _apiService = ApiService();
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();

  List<Recipient> _recipients = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRecipients();
  }

  void _fetchRecipients() async {
    User? user = _sharedPrefManager.getUser();
    if (user == null) {
      // Handle user not logged in
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    try {
      RecipientResponse response = await _apiService.getUserRecipients(user.id);
      setState(() {
        _recipients = response.recipients;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching recipients: ${e.toString()}')),
      );
    }
  }

  void _showSearchRecipientDialog() async {
    bool? result = await showDialog(
      context: context,
      builder: (context) => const SearchRecipientDialog(),
    );

    if (result == true) {
      _fetchRecipients(); // Refresh the recipients list after editing
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Recipients'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: _isLoading ? null : _showSearchRecipientDialog,
            tooltip: 'Search and Edit Recipient',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _recipients.isEmpty
          ? const Center(child: Text('No recipients found'))
          : ListView.builder(
        itemCount: _recipients.length,
        itemBuilder: (context, index) {
          final recipient = _recipients[index];
          return RecipientItem(
            recipient: recipient,
            onUpdate: _fetchRecipients, // Pass the update callback
          );
        },
      ),
    );
  }
}
