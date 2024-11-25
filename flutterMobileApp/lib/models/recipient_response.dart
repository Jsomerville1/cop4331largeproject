// lib/models/recipient_response.dart

import 'recipient.dart';

class RecipientResponse {
  final List<Recipient> recipients;
  final String? error;

  RecipientResponse({
    required this.recipients,
    this.error,
  });

  factory RecipientResponse.fromJson(Map<String, dynamic> json) {
    return RecipientResponse(
      recipients: (json['recipients'] as List<dynamic>?)
          ?.map((e) => Recipient.fromJson(e))
          .toList() ??
          [],
      error: json['error'],
    );
  }
}
