// lib/models/edit_message_request.dart

class EditMessageRequest {
  final int messageId;
  final int userId;
  final String content;

  EditMessageRequest({
    required this.messageId,
    required this.userId,
    required this.content,
  });

  Map<String, dynamic> toJson() {
    return {
      'messageId': messageId,
      'userId': userId,
      'content': content,
    };
  }
}
