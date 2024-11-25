class Document {
  final int documentId;
  final int userId;
  final String recipientEmail;
  final String recipientName;
  final String title; // New field
  final String filePath;
  final bool isSent;
  final DateTime createdAt;

  Document({
    required this.documentId,
    required this.userId,
    required this.recipientEmail,
    required this.recipientName,
    required this.title, // Initialize the title
    required this.filePath,
    required this.isSent,
    required this.createdAt,
  });

  factory Document.fromJson(Map<String, dynamic> json) {
    return Document(
      documentId: json['documentId'],
      userId: json['userId'],
      recipientEmail: json['recipientEmail'],
      recipientName: json['recipientName'],
      title: json['title'], // Parse the title
      filePath: json['filePath'],
      isSent: json['isSent'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'documentId': documentId,
      'userId': userId,
      'recipientEmail': recipientEmail,
      'recipientName': recipientName,
      'title': title, // Include the title
      'filePath': filePath,
      'isSent': isSent,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
