// lib/models/verification_response.dart

class VerificationResponse {
  final String? message;
  final String? error;

  VerificationResponse({this.message, this.error});

  factory VerificationResponse.fromJson(Map<String, dynamic> json) {
    return VerificationResponse(
      message: json['message'],
      error: json['error'],
    );
  }
}
