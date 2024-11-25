class AddRecipientRequest {
  final int userId;
  final int messageId;
  final String recipientName;
  final String recipientEmail;

  AddRecipientRequest({
    required this.userId,
    required this.messageId,
    required this.recipientName,
    required this.recipientEmail,
  });

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'messageId': messageId,
      'recipientName': recipientName,
      'recipientEmail': recipientEmail,
    };
  }
}
