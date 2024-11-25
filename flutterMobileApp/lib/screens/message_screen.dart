import 'package:flutter/material.dart';
import '../models/message.dart';
import '../models/document.dart'; // New import
import '../models/recipient.dart';
import '../services/api_service.dart';
import '../utils/shared_pref_manager.dart';
import '../widgets/message_item.dart';
import '../dialogs/add_message_dialog.dart';
import '../dialogs/upload_pdf_dialog.dart'; // Ensure this import exists

// Define a common interface or base class
abstract class BaseMessage {
  DateTime createdAt;

  BaseMessage(this.createdAt);
}

class UnifiedMessage extends BaseMessage {
  final Message? message;
  final Document? document;

  UnifiedMessage({this.message, this.document})
      : super(
    message != null
        ? message.createdAt
        : (document != null ? document.createdAt : DateTime.now()),
  );
}


class MessageScreen extends StatefulWidget {
  const MessageScreen({super.key});

  @override
  State<MessageScreen> createState() => _MessageScreenState();
}

class _MessageScreenState extends State<MessageScreen> {
  final ApiService _apiService = ApiService();
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();

  List<BaseMessage> _unifiedMessages = [];
  List<Message> _messages = [];
  List<Document> _documents = [];
  List<Recipient> _recipients = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  void _fetchData() async {
    var user = _sharedPrefManager.getUser();
    if (user == null) {
      Navigator.pushReplacementNamed(context, '/login');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Fetch messages
      var fetchedMessages = await _apiService.getUserMessages(user.id);
      // Fetch recipients
      List<Recipient> fetchedRecipients = await _apiService.getRecipientsByUserId(user.id);
      // Fetch documents
      List<Document> fetchedDocuments = await _apiService.getUserDocuments(user.id);

      // Merge messages and documents into unifiedMessages
      List<UnifiedMessage> tempUnified = [];

      for (var msg in fetchedMessages.messages) {
        tempUnified.add(UnifiedMessage(message: msg));
      }

      for (var doc in fetchedDocuments) {
        tempUnified.add(UnifiedMessage(document: doc));
      }

      // Sort the unified list by createdAt descending
      tempUnified.sort((a, b) => b.createdAt.compareTo(a.createdAt));

      setState(() {
        _messages = fetchedMessages.messages;
        _recipients = fetchedRecipients;
        _documents = fetchedDocuments;
        _unifiedMessages = tempUnified;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error fetching data: $e')),
      );
    }
  }

  void _showAddOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) {
        return Wrap(
          children: <Widget>[
            ListTile(
              leading: const Icon(Icons.message),
              title: const Text('Add Text Message'),
              onTap: () async {
                Navigator.pop(context); // Close the bottom sheet
                bool? result = await showDialog(
                  context: context,
                  builder: (context) => const AddMessageDialog(),
                );

                if (result == true) {
                  _fetchData();
                }
              },
            ),
            ListTile(
              leading: const Icon(Icons.picture_as_pdf),
              title: const Text('Upload PDF'),
              onTap: () async {
                Navigator.pop(context); // Close the bottom sheet
                bool? result = await showDialog(
                  context: context,
                  builder: (context) => const UploadPdfDialog(),
                );

                if (result == true) {
                  _fetchData();
                }
              },
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _unifiedMessages.isEmpty
          ? const Center(child: Text('No messages found'))
          : ListView.builder(
        itemCount: _unifiedMessages.length,
        itemBuilder: (context, index) {
          final unifiedMessage = _unifiedMessages[index];
          if (unifiedMessage is UnifiedMessage && unifiedMessage.message != null) {
            final message = unifiedMessage.message!;
            // Filter recipients for this message
            List<Recipient> messageRecipients = _recipients
                .where((recipient) => recipient.messageId == message.messageId)
                .toList();
            return MessageItem(
              message: message,
              recipients: messageRecipients,
              onUpdate: _fetchData,
              isPdf: false,
            );
          } else if (unifiedMessage is UnifiedMessage && unifiedMessage.document != null) {
            final document = unifiedMessage.document!;
            return MessageItem(
              document: document,
              onUpdate: _fetchData,
              isPdf: true,
            );
          } else {
            return const SizedBox.shrink(); // Empty widget for unexpected cases
          }
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddOptions,
        child: const Icon(Icons.add),
      ),
    );
  }
}
