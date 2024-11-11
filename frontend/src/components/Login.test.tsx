// Login.test.tsx
//import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';

describe('Login Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  afterEach(() => {
    jest.resetAllMocks();
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

  test('shows error message when login fails', async () => {
    // Mock the fetch API to simulate a failed login
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ error: 'User/Password combination incorrect' }),
      })
    ) as jest.Mock;

    render(<Login />);

    // Enter username and password
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpassword' } });

    // Click on Login button
    fireEvent.click(screen.getByText('Log In'));

    // Wait for the error message to appear
    const errorMessage = await screen.findByText('User/Password combination incorrect');
    expect(errorMessage).toBeInTheDocument();
  });

  test('navigates to verification form when account is not verified', async () => {
    // Mock the fetch API to simulate an unverified account
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ Verified: false }),
      })
    ) as jest.Mock;

    render(<Login />);

    // Enter username and password
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'unverifieduser' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Click on Login button
    fireEvent.click(screen.getByText('Log In'));

    // Wait for the message and verification form to appear
    const message = await screen.findByText('Please verify your account');
    expect(message).toBeInTheDocument();

    const verificationHeader = await screen.findByText('Enter Verification Code');
    expect(verificationHeader).toBeInTheDocument();
  });

  test('navigates to /cards on successful login', async () => {
    // Mock the fetch API to simulate a successful login
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            firstName: 'John',
            lastName: 'Doe',
            id: '123',
            Verified: true,
          }),
      })
    ) as jest.Mock;

    // Render with MemoryRouter
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Enter username and password
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'johndoe' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

    // Click on Login button
    fireEvent.click(screen.getByText('Log In'));

    // Wait for the redirect
    await waitFor(() => {
      expect(window.location.href).toBe('/cards');
    });

    // Check that localStorage is set
    const storedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    expect(storedUser).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      id: '123',
    });
  });

  test('shows registration form when Register button is clicked', () => {
    render(<Login />);

    // Click on Register button
    fireEvent.click(screen.getByText('Register'));

    // Check that the registration form is displayed
    expect(screen.getByText('Register Account')).toBeInTheDocument();
  });
});
