// lib/models/register_request.dart

class RegisterRequest {
  final String firstName;
  final String lastName;
  final String username;
  final String email;
  final String password;
  final int checkInFreq;

  RegisterRequest({
    required this.firstName,
    required this.lastName,
    required this.username,
    required this.email,
    required this.password,
    required this.checkInFreq,
  });

  Map<String, dynamic> toJson() {
    return {
      'FirstName': firstName,
      'LastName': lastName,
      'Username': username,
      'Email': email,
      'Password': password,
      'CheckInFreq': checkInFreq,
    };
  }
}
