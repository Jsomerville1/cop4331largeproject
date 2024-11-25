import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import '../utils/shared_pref_manager.dart';
import '../models/user.dart';

class UploadPdfScreen extends StatefulWidget {
  const UploadPdfScreen({super.key});

  @override
  State<UploadPdfScreen> createState() => _UploadPdfScreenState();
}

class _UploadPdfScreenState extends State<UploadPdfScreen> {
  final TextEditingController _recipientNameController = TextEditingController();
  final TextEditingController _recipientEmailController = TextEditingController();
  final TextEditingController _sendAtController = TextEditingController();

  PlatformFile? _selectedFile;
  bool _isLoading = false;
  String _errorMessage = '';

  final SharedPrefManager _sharedPrefManager = SharedPrefManager();

  @override
  void dispose() {
    _recipientNameController.dispose();
    _recipientEmailController.dispose();
    _sendAtController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf'],
    );

    if (result != null) {
      setState(() {
        _selectedFile = result.files.first;
      });
    }
  }

  Future<void> _uploadFile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });

    if (_selectedFile == null) {
      setState(() {
        _errorMessage = 'Please select a PDF file.';
        _isLoading = false;
      });
      return;
    }

    String recipientName = _recipientNameController.text.trim();
    String recipientEmail = _recipientEmailController.text.trim();
    String sendAt = _sendAtController.text.trim();

    if (recipientName.isEmpty || recipientEmail.isEmpty || sendAt.isEmpty) {
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
      var uri = Uri.parse('http://yourserveraddress.com/api/uploadPdf'); // Replace with your server address
      var request = http.MultipartRequest('POST', uri);

      request.fields['userId'] = user.id.toString();
      request.fields['recipientName'] = recipientName;
      request.fields['recipientEmail'] = recipientEmail;
      request.fields['sendAt'] = sendAt;

      request.files.add(await http.MultipartFile.fromPath(
        'pdfFile',
        _selectedFile!.path!,
        filename: _selectedFile!.name,
      ));

      var response = await request.send();

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('PDF uploaded successfully')),
        );
        Navigator.pop(context);
      } else {
        var responseBody = await response.stream.bytesToString();
        setState(() {
          _errorMessage = 'Failed to upload PDF: $responseBody';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Error: $e';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  // Date picker for sendAt
  Future<void> _selectSendAtDate() async {
    DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(minutes: 5)),
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
    );

    if (pickedDate != null) {
      TimeOfDay? pickedTime = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.now(),
      );

      if (pickedTime != null) {
        DateTime sendAt = DateTime(
          pickedDate.year,
          pickedDate.month,
          pickedDate.day,
          pickedTime.hour,
          pickedTime.minute,
        );
        _sendAtController.text = sendAt.toIso8601String();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload PDF'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Recipient Name
            TextField(
              controller: _recipientNameController,
              decoration: const InputDecoration(
                labelText: 'Recipient Name',
              ),
            ),
            const SizedBox(height: 8),
            // Recipient Email
            TextField(
              controller: _recipientEmailController,
              decoration: const InputDecoration(
                labelText: 'Recipient Email',
              ),
            ),
            const SizedBox(height: 8),
            // Send At
            TextField(
              controller: _sendAtController,
              decoration: const InputDecoration(
                labelText: 'Send At',
              ),
              readOnly: true,
              onTap: _selectSendAtDate,
            ),
            const SizedBox(height: 16),
            // Select File Button
            ElevatedButton(
              onPressed: _pickFile,
              child: const Text('Select PDF File'),
            ),
            const SizedBox(height: 8),
            // Selected File Name
            Text(
              _selectedFile != null ? _selectedFile!.name : 'No file selected',
            ),
            const SizedBox(height: 16),
            // Upload Button
            ElevatedButton(
              onPressed: _isLoading ? null : _uploadFile,
              child: _isLoading
                  ? const CircularProgressIndicator()
                  : const Text('Upload'),
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
    );
  }
}
