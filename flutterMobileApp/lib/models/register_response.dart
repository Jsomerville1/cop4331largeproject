// lib/models/register_response.dart

class RegisterResponse {
  final String? error;

  RegisterResponse({this.error});

  factory RegisterResponse.fromJson(Map<String, dynamic> json) {
    return RegisterResponse(
      error: json['error'],
    );
  }
}
