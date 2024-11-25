// lib/utils/shared_pref_manager.dart

import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/user.dart';

class SharedPrefManager {
  static final SharedPrefManager _instance = SharedPrefManager._internal();

  factory SharedPrefManager() => _instance;

  SharedPrefManager._internal();

  SharedPreferences? _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Save User
  Future<void> saveUser(User user) async {
    String userJson = jsonEncode(user.toJson());
    await _prefs?.setString('user', userJson);
  }

  // Get User
  User? getUser() {
    String? userJson = _prefs?.getString('user');
    if (userJson != null) {
      return User.fromJson(jsonDecode(userJson)); // Parse the user data.

    }
    return null;
  }

  // Logout
  Future<void> logout() async {
    await _prefs?.remove('user');
  }

  User userFromJson(String jsonString) {
    final Map<String, dynamic> json = jsonDecode(jsonString);
    return User.fromJson(json);
  }

  // Helper methods to serialize and deserialize User
  String userToJson(User user) {
    return user.toJson().toString();
  }

  Future<void> updateUser(User updatedUser) async {
    await saveUser(updatedUser);
  }

  Future<void> clearUser() async {
    await _prefs?.remove('user');
  }
}
