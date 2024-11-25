// lib/dialogs/search_recipient_dialog.dart

import 'package:flutter/material.dart';
import '../models/recipient.dart';
import '../services/api_service.dart';
import 'edit_recipient_dialog.dart';
import '../utils/shared_pref_manager.dart'; // Assuming you have this for user data

class SearchRecipientDialog extends StatefulWidget {
  const SearchRecipientDialog({super.key});

  @override
  State<SearchRecipientDialog> createState() => _SearchRecipientDialogState();
}

class _SearchRecipientDialogState extends State<SearchRecipientDialog> {
  final ApiService _apiService = ApiService();
  final SharedPrefManager _sharedPrefManager = SharedPrefManager(); // Initialize as needed

  final TextEditingController _searchController = TextEditingController();
  List<Recipient> _searchResults = [];
  bool _isLoading = false;
  String _errorMessage = '';

  void _searchRecipients() async {
    String query = _searchController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter a search query.';
        _searchResults = [];
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = '';
      _searchResults = [];
    });

    try {
      // Retrieve the current user's ID from Shared Preferences or your state management solution
      int? userId = _sharedPrefManager.getUser()?.id;
      if (userId == null) {
        setState(() {
          _errorMessage = 'User not logged in.';
          _isLoading = false;
        });
        return;
      }

      List<Recipient> results = await _apiService.searchRecipients(
        userId: userId,
        query: query,
      );

      setState(() {
        _searchResults = results;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString().replaceFirst('Exception: ', '');
        _isLoading = false;
        _searchResults = [];
      });
    }
  }

  void _showEditRecipientDialog(Recipient recipient) async {
    bool? result = await showDialog(
      context: context,
      builder: (context) => EditRecipientDialog(
        recipientId: recipient.recipientId,
        recipientName: recipient.recipientName,
        recipientEmail: recipient.recipientEmail,
      ),
    );

    if (result == true) {
      _searchRecipients(); // Refresh the search results after editing
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Widget _buildSearchResultTile(Recipient recipient) {
    return ListTile(
      title: Text(recipient.recipientName),
      subtitle: Text(recipient.recipientEmail),
      trailing: IconButton(
        icon: const Icon(Icons.edit),
        onPressed: () => _showEditRecipientDialog(recipient),
        tooltip: 'Edit Recipient',
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Search Recipients'),
      content: SizedBox(
        width: double.maxFinite,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Search Bar
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    decoration: const InputDecoration(
                      hintText: 'Search by name or email',
                      border: OutlineInputBorder(),
                    ),
                    onSubmitted: (value) => _searchRecipients(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : _searchRecipients,
                  child: const Text('Search'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            // Error Message
            if (_errorMessage.isNotEmpty)
              Text(
                _errorMessage,
                style: const TextStyle(color: Colors.red),
              ),
            const SizedBox(height: 8),
            // Search Results
            _isLoading
                ? const CircularProgressIndicator()
                : _searchResults.isEmpty
                ? const Text('No recipients found.')
                : Expanded(
              child: ListView.builder(
                itemCount: _searchResults.length,
                itemBuilder: (context, index) {
                  final recipient = _searchResults[index];
                  return _buildSearchResultTile(recipient);
                },
              ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isLoading ? null : () => Navigator.pop(context),
          child: const Text('Close'),
        ),
      ],
    );
  }
}
