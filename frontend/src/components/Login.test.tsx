// src/components/Login.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

// Mocking window.location.href
const originalLocation = window.location;

beforeAll(() => {
  // @ts-ignore
  delete window.location;
  window.location = { href: '' } as any;
});

afterAll(() => {
  window.location = originalLocation;
});

describe('Login Component', () => {
  beforeEach(() => {
    // Clear mocks before each test
    jest.resetAllMocks();
    localStorage.clear();
  });

  test('renders Login form with all fields and buttons', () => {
    render(<Login />);

    // Check for input fields
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

    // Check for buttons
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
    expect(screen.getByText('Verify')).toBeInTheDocument();
  });

  

  test('navigates to /cards on successful login for verified user', async () => {
    // Mock the fetch API to simulate a successful login
    const mockUserData = {
      firstName: 'Joseph',
      lastName: 'Somerville',
      id: '12345',
      Verified: true,
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockUserData),
      })
    ) as jest.Mock;

    render(<Login />);

    // Enter username and password
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'JoeyS87' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });

    // Click on Log In button
    fireEvent.click(screen.getByText('Log In'));

    // Wait for the redirection
    await waitFor(() => {
      expect(window.location.href).toBe('/cards');
    });

    // Check that user data is stored in localStorage
    const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    expect(storedUser).toEqual({
      firstName: 'Joseph',
      lastName: 'Somerville',
      id: '12345',
    });
  });
});
