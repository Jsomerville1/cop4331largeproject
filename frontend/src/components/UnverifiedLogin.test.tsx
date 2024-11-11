import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login';

describe('Login Component', () => {
  test('shows verification message and form when account is not verified', async () => {
    render(<Login />);

    // Simulate entering login credentials
    fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'AfterTest2' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password' } });

    // Mock the server response for an unverified user
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ Verified: false, error: '' })
      })
    ) as jest.Mock;

    // Click the Login button
    fireEvent.click(screen.getByText('Log In'));

    // Wait for the verification message and form to appear
    await waitFor(() => {
      expect(screen.getByText('Please verify your account')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Enter Verification Code')).toBeInTheDocument();
    });
  });
});
