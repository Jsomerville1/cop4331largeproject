// lib/models/recipient.dart

class Recipient {
  final int recipientId;
  final int userId;
  String recipientName;
  String recipientEmail;
  final int? messageId; // Made optional
  final DateTime? createdAt;

  Recipient({
    required this.recipientId,
    required this.userId,
    required this.recipientName,
    required this.recipientEmail,
    this.messageId, // Optional parameter
    this.createdAt,
  });

  factory Recipient.fromJson(Map<String, dynamic> json) {
    return Recipient(
      recipientId: json['recipientId'],
      userId: json['userId'],
      recipientName: json['recipientName'],
      recipientEmail: json['recipientEmail'],
      messageId: json['messageId'], // Can be null
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'recipientId': recipientId,
      'userId': userId,
      'recipientName': recipientName,
      'recipientEmail': recipientEmail,
      if (messageId != null) 'messageId': messageId,
      'createdAt': createdAt?.toIso8601String(),
    };
  }
}
