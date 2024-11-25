import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import '../models/user.dart';
import '../utils/shared_pref_manager.dart';
import '../services/api_service.dart';

class UploadPdfDialog extends StatefulWidget {
  const UploadPdfDialog({super.key});

  @override
  State<UploadPdfDialog> createState() => _UploadPdfDialogState();
}

class _UploadPdfDialogState extends State<UploadPdfDialog> {
  final SharedPrefManager _sharedPrefManager = SharedPrefManager();
  final ApiService _apiService = ApiService();
  User? _user;
  bool _isUploading = false;

  PlatformFile? _selectedPdfFile;
  final TextEditingController _recipientNameController = TextEditingController();
  final TextEditingController _recipientEmailController = TextEditingController();
  final TextEditingController _titleController = TextEditingController(); // New controller

  @override
  void initState() {
    super.initState();
    _user = _sharedPrefManager.getUser();
  }

  void _selectPdf() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _selectedPdfFile = result.files.single;
      });
    } else {
      // User canceled the picker
    }
  }

  void _uploadPdf() async {
    if (_user == null) return;

    if (_selectedPdfFile == null ||
        _recipientNameController.text.isEmpty ||
        _recipientEmailController.text.isEmpty ||
        _titleController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill all fields and select a PDF file.')),
      );
      return;
    }

    setState(() {
      _isUploading = true;
    });

    try {
      await _apiService.addDocument(
        userId: _user!.id,
        recipientName: _recipientNameController.text,
        recipientEmail: _recipientEmailController.text,
        title: _titleController.text, // Pass the title
        pdfFile: _selectedPdfFile!,
      );
      Navigator.pop(context, true); // Indicate success
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error uploading PDF: $e')),
      );
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Upload PDF'),
      content: SingleChildScrollView(
        child: Column(
          children: [
            TextField(
              controller: _titleController,
              decoration: const InputDecoration(labelText: 'Title'), // New Title field
            ),
            TextField(
              controller: _recipientNameController,
              decoration: const InputDecoration(labelText: 'Recipient Name'),
            ),
            TextField(
              controller: _recipientEmailController,
              decoration: const InputDecoration(labelText: 'Recipient Email'),
            ),
            const SizedBox(height: 8),
            ElevatedButton(
              onPressed: _selectPdf,
              child: Text(_selectedPdfFile != null ? 'PDF Selected' : 'Select PDF'),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: _isUploading ? null : () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        TextButton(
          onPressed: _isUploading ? null : _uploadPdf,
          child: _isUploading
              ? const SizedBox(
            height: 16.0,
            width: 16.0,
            child: CircularProgressIndicator(strokeWidth: 2.0),
          )
              : const Text('Upload'),
        ),
      ],
    );
  }
}
