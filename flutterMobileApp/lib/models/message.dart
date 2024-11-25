class Message {
  final int messageId;
  final int userId;
  final String content;
  final bool isSent;
  final DateTime createdAt;
  final DateTime? sendAt;

  Message({
    required this.messageId,
    required this.userId,
    required this.content,
    required this.isSent,
    required this.createdAt,
    this.sendAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      messageId: json['messageId'],
      userId: json['userId'],
      content: json['content'],
      isSent: json['isSent'],
      createdAt: DateTime.parse(json['createdAt']),
      sendAt: json['sendAt'] != null ? DateTime.parse(json['sendAt']) : null,
    );
  }
}
