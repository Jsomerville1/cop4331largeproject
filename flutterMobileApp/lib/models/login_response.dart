// lib/models/login_response.dart

class LoginResponse {
  final int id;
  final String? firstName;
  final String? lastName;
  final String? username;
  final String? email;
  final int? checkInFreq;
  final bool? verified;
  final bool? deceased;
  final String? createdAt;
  final String? lastLogin;
  final String? error;

  LoginResponse({
    required this.id,
    this.firstName,
    this.lastName,
    this.username,
    this.email,
    this.checkInFreq,
    this.verified,
    this.deceased,
    this.createdAt,
    this.lastLogin,
    this.error,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      id: json['id'] ?? -1,
      firstName: json['firstName'],
      lastName: json['lastName'],
      username: json['username'],
      email: json['email'],
      checkInFreq: json['checkInFreq'],
      verified: json['verified'],
      deceased: json['deceased'],
      createdAt: json['createdAt'],
      lastLogin: json['lastLogin'],
      error: json['error'],
    );
  }
}
