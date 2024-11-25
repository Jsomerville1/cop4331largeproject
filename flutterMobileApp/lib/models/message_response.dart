// lib/models/message_response.dart

import 'message.dart';

class MessageResponse {
  final List<Message> messages;
  final String? error;

  MessageResponse({
    required this.messages,
    this.error,
  });

  factory MessageResponse.fromJson(Map<String, dynamic> json) {
    return MessageResponse(
      messages: (json['messages'] as List<dynamic>?)
          ?.map((e) => Message.fromJson(e))
          .toList() ??
          [],
      error: json['error'],
    );
  }
}
