// lib/models/verification_request.dart

class VerificationRequest {
  final String username;
  final String code;

  VerificationRequest({required this.username, required this.code});

  Map<String, dynamic> toJson() {
    return {
      'Username': username,
      'code': code,
    };
  }
}
