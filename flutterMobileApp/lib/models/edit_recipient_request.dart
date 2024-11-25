// lib/models/edit_recipient_request.dart

class EditRecipientRequest {
  final int recipientId;
  final int messageId;
  final String recipientName;
  final String recipientEmail;

  EditRecipientRequest({
    required this.recipientId,
    required this.messageId,
    required this.recipientName,
    required this.recipientEmail,
  });

  Map<String, dynamic> toJson() {
    return {
      'recipientId': recipientId,
      'messageId': messageId,
      'recipientName': recipientName,
      'recipientEmail': recipientEmail,
    };
  }
}
