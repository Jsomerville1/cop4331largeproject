class AddMessageRequest {
  final int userId;
  final String content;

  AddMessageRequest({
    required this.userId,
    required this.content,
  });

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'content': content,
    };
  }
}
