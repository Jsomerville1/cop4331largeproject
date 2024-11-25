import 'package:flutter/material.dart';
import 'home_screen.dart';
import 'message_screen.dart';
import 'recipients_screen.dart';
import 'user_profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  late final List<Widget> _screens;

  @override
  void initState() {
    super.initState();
    _screens = [
      const HomeScreen(),
      const MessageScreen(),
      const RecipientsScreen(),
      const UserProfileScreen(),
    ];
  }

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: Colors.black,
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.grey[600],
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        items: const [
          // Home Tab
          BottomNavigationBarItem(
            icon: Icon(Icons.home),
            label: 'Home',
          ),
          // Messages Tab
          BottomNavigationBarItem(
            icon: Icon(Icons.message),
            label: 'Messages',
          ),
          // Recipients Tab
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Recipients',
          ),
          // Profile Tab
          BottomNavigationBarItem(
            icon: Icon(Icons.settings), // Cog icon
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
