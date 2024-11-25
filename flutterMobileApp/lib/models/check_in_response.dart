// Define a CheckInResponse model
class CheckInResponse {
  final String message;
  final dynamic result; // Adjust type based on your server response
  final String? error;

  CheckInResponse({
    required this.message,
    this.result,
    this.error,
  });

  factory CheckInResponse.fromJson(Map<String, dynamic> json) {
    return CheckInResponse(
      message: json['message'],
      result: json['result'],
      error: json['error'],
    );
  }
}
