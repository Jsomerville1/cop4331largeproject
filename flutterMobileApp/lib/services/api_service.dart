// lib/services/api_service.dart

import 'dart:convert';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import '../models/check_in_response.dart';
import '../models/document.dart';
import '../models/recipient.dart';
import '../models/recipient_response.dart';
import '../models/user.dart';
import '../network/generic_response.dart';
import '../models/register_request.dart';
import '../models/register_response.dart';
import '../models/verification_request.dart';
import '../models/verification_response.dart';
import '../models/message_response.dart';
import '../models/add_message_request.dart';
import '../models/edit_message_request.dart';
import '../models/add_recipient_request.dart';

class ApiService {
  static const String baseUrl = 'http://161.35.116.218:5000';



  // Delete User
  Future<GenericResponse> deleteUser(Map<String, dynamic> request) async {
    final url = Uri.parse('$baseUrl/api/deleteUsers');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(request),
    );

    if (response.statusCode == 200) {
      return GenericResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to delete user');
    }
  }

  // Register User
  Future<RegisterResponse> registerUser(RegisterRequest request) async {
    final url = Uri.parse('$baseUrl/api/register');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return RegisterResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Registration failed. Please try again.');
    }
  }

  // Verify User
  Future<VerificationResponse> verifyUser(VerificationRequest request) async {
    final url = Uri.parse('$baseUrl/api/verify');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode == 200) {
      return VerificationResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Verification failed. Please try again.');
    }
  }

  // Login User
  Future<User?> loginUser(String username, String password) async {
    final url = Uri.parse('$baseUrl/api/login');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'Username': username, 'Password': password}),
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = jsonDecode(response.body);

      if (data['error'] == '') {
        // Successful login
        return User.fromJson(data);
      } else {
        // Login failed with error message
        throw Exception(data['error']);
      }
    } else {
      throw Exception('Failed to log in');
    }
  }


  // Fetch User Messages
  Future<MessageResponse> getUserMessages(int userId) async {
    final url = Uri.parse('$baseUrl/api/getUserMessages');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'userId': userId}),
    );

    if (response.statusCode == 200) {
      return MessageResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to fetch messages');
    }
  }



  // Add Message
  Future<void> addMessage(AddMessageRequest request) async {
    final url = Uri.parse('$baseUrl/api/addmessage');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode != 201 && response.statusCode != 200) {
      // Accept both 200 and 201 as success based on server implementation
      throw Exception('Failed to add message: ${response.body}');
    }
  }

  // Edit Message
  Future<void> editMessage(EditMessageRequest request) async {
    final url = Uri.parse('$baseUrl/api/editmessage');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to edit message');
    }
  }

  // Delete Message
  Future<void> deleteMessage(int messageId, int userId) async {
    final url = Uri.parse('$baseUrl/api/deleteMessage');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'messageId': messageId, 'userId': userId}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete message');
    }
  }

  // Add Recipient
  Future<void> addRecipient(AddRecipientRequest request) async {
    final url = Uri.parse('$baseUrl/api/addRecipient');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(request.toJson()),
    );

    if (response.statusCode != 201) {
      final errorResponse = jsonDecode(response.body);
      throw Exception(errorResponse['error'] ?? 'Failed to add recipient');
    }
  }

  // Edit Recipient
  Future<void> editRecipient({
    required int recipientId,
    required String recipientName,
    required String recipientEmail,
    int? messageId, // Optional parameter
  }) async {
    final url = Uri.parse('$baseUrl/api/editRecipient');
    final body = {
      'recipientId': recipientId,
      'recipientName': recipientName,
      'recipientEmail': recipientEmail,
    };

    if (messageId != null) {
      body['messageId'] = messageId;
    }

    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    if (response.statusCode != 200) {
      final res = jsonDecode(response.body);
      throw Exception(res['error'] ?? 'Failed to edit recipient');
    }
  }


  // Delete Recipient
  Future<void> deleteRecipient(int recipientId) async {
    final url = Uri.parse('$baseUrl/api/deleteRecipient');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'recipientId': recipientId}),
    );

    if (response.statusCode != 200) {
      throw Exception('Failed to delete recipient');
    }
  }

  // Check In User
  Future<CheckInResponse> checkInUser(int userId) async {
    print("ApiService.checkInUser() called with UserId: $userId");

    final url = Uri.parse('$baseUrl/api/checkIn');
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'UserId': userId}),
      );


      if (response.statusCode == 200) {
        return CheckInResponse.fromJson(jsonDecode(response.body));
      } else {
        throw Exception('Failed to check in. Status Code: ${response.statusCode}');
      }
    } catch (e) {
        return CheckInResponse(error: 'Error: $e', message: '');
    }
  }
  // Fetch User Recipients
  Future<RecipientResponse> getUserRecipients(int userId) async {
    final url = Uri.parse('$baseUrl/api/recipients');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'userId': userId}),
    );

    if (response.statusCode == 200) {
      return RecipientResponse.fromJson(jsonDecode(response.body));
    } else {
      throw Exception('Failed to fetch recipients');
    }
  }
  // Fetch recipients by user ID
  Future<List<Recipient>> getRecipientsByUserId(int userId) async {
    final url = Uri.parse('$baseUrl/api/recipients');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'userId': userId}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['recipients'] as List)
          .map((e) => Recipient.fromJson(e))
          .toList();
    } else {
      throw Exception('Failed to fetch recipients');
    }
  }
  // Add Document (Upload PDF)
  Future<void> addDocument({
    required int userId,
    required String recipientName,
    required String recipientEmail,
    required String title, // New parameter
    required PlatformFile pdfFile,
  }) async {
    var uri = Uri.parse('$baseUrl/api/uploadPdf'); // Corrected endpoint
    var request = http.MultipartRequest('POST', uri);

    request.fields['userId'] = userId.toString();
    request.fields['recipientName'] = recipientName;
    request.fields['recipientEmail'] = recipientEmail;
    request.fields['title'] = title; // Include the title

    if (pdfFile.path != null) {
      request.files.add(await http.MultipartFile.fromPath(
        'pdfFile',
        pdfFile.path!,
        filename: pdfFile.name,
      ));
    }

    var streamedResponse = await request.send();

    var response = await http.Response.fromStream(streamedResponse);

    if (response.statusCode != 201) {
      var responseBody = response.body;
      throw Exception('Failed to upload PDF: $responseBody');
    }
  }
  // Fetch user documents
  Future<List<Document>> getUserDocuments(int userId) async {
    final url = Uri.parse('$baseUrl/api/getUserDocuments');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'userId': userId}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return (data['documents'] as List)
          .map((e) => Document.fromJson(e))
          .toList();
    } else {
      throw Exception('Failed to fetch documents');
    }
  }

  // Delete Document
  Future<void> deleteDocument(int documentId) async {
    final url = Uri.parse('$baseUrl/api/deleteDocument');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'documentId': documentId}),
    );

    if (response.statusCode != 200) {
      var responseBody = response.body;
      throw Exception('Failed to delete document: $responseBody');
    }
  }

  // Update Check-In Frequency
  Future<GenericResponse> updateCheckInFreq(int userId, int checkInFreq) async {
    final url = Uri.parse('$baseUrl/api/checkin-frequency');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'userId': userId, 'CheckInFreq': checkInFreq}),
    );

    if (response.statusCode == 200) {
      return GenericResponse.fromJson(jsonDecode(response.body));
    } else {
      final errorResponse = jsonDecode(response.body);
      throw Exception(errorResponse['error'] ?? 'Failed to update Check-In Frequency');
    }
  }


  // Forgot Password
  Future<void> forgotPassword(String email) async {
    final url = Uri.parse('$baseUrl/pw/forgotpassword');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'Email': email}),
    );

    if (response.statusCode == 200) {
      // Password reset token sent successfully
      return;
    } else {
      final res = jsonDecode(response.body);
      throw Exception(res['error'] ?? 'Failed to send password reset token.');
    }
  }

  // Reset Password
  Future<void> resetPassword(String resetToken, String newPassword) async {
    final url = Uri.parse('$baseUrl/pw/resetpassword');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'resetToken': resetToken,
        'newPassword': newPassword,
      }),
    );

    if (response.statusCode == 200) {
      // Password reset successfully
      return;
    } else {
      final res = jsonDecode(response.body);
      throw Exception(res['error'] ?? 'Failed to reset password.');
    }
  }

  // Change Password
  Future<void> changePassword({
    required int userId,
    required String currentPassword,
    required String newPassword,
  }) async {
    final url = Uri.parse('$baseUrl/api/editUser');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'currentPassword': currentPassword,
        'newPassword': newPassword,
        // 'newEmail': null, // No need to send newEmail
      }),
    );

    if (response.statusCode == 200) {
      // Password changed successfully
      return;
    } else {
      final res = jsonDecode(response.body);
      throw Exception(res['error'] ?? 'Failed to change password.');
    }
  }
  // Search Recipients
  Future<List<Recipient>> searchRecipients({
    required int userId,
    required String query,
  }) async {
    final url = Uri.parse('$baseUrl/api/search');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'userId': userId,
        'query': query,
      }),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      List<dynamic> recipientsJson = data['recipients'];
      return recipientsJson.map((json) => Recipient.fromJson(json)).toList();
    } else {
      final res = jsonDecode(response.body);
      throw Exception(res['error'] ?? 'Failed to search recipients.');
    }
  }


}
// Define a DeleteUserResponse model
class DeleteUserResponse {
  final String? error;
  final String? message;

  DeleteUserResponse({
    this.error,
    this.message,
  });

  factory DeleteUserResponse.fromJson(Map<String, dynamic> json) {
    return DeleteUserResponse(
      error: json['error'],
      message: json['message'],
    );
  }

}