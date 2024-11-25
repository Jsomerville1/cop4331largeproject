// lib/network/generic_response.dart

class GenericResponse {
  final String? message;
  final String? error;

  GenericResponse({this.message, this.error});

  factory GenericResponse.fromJson(Map<String, dynamic> json) {
    return GenericResponse(
      message: json['message'],
      error: json['error'],
    );
  }
}
