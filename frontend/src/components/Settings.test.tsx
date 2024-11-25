// src/components/Settings.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Settings from './Settings';
import { MemoryRouter } from 'react-router-dom';
import fetchMock from 'jest-fetch-mock';
import { mockNavigate } from 'react-router-dom'; // Import the mock

describe('Settings Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    mockNavigate.mockClear();
    localStorage.clear();
    localStorage.setItem(
      'user_data',
      JSON.stringify({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
      })
    );
  });

  test('renders Settings component with user data', () => {
    render(<Settings />, { wrapper: MemoryRouter });

    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    expect(screen.getByText(/Username:/)).toBeInTheDocument();
    expect(screen.getByText(/Email:/)).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Update Password' })).toBeInTheDocument();
  });

  test('can change password', async () => {
    // Mock the fetch response for changing password
    fetchMock.mockResponseOnce(JSON.stringify({}));

    render(<Settings />, { wrapper: MemoryRouter });

    // Enter current and new passwords
    fireEvent.change(screen.getByPlaceholderText('Current Password'), {
      target: { value: 'oldpassword' },
    });
    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newpassword' },
    });

    // Click on "Update Password" button
    fireEvent.click(screen.getByRole('button', { name: 'Update Password' }));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText('Password updated successfully.')).toBeInTheDocument();
    });

    // Verify that fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledWith('api/editUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '1',
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      }),
    });
  });

  test('can delete account', async () => {
    // Mock the fetch response for deleting account
    fetchMock.mockResponseOnce(JSON.stringify({}));

    // Mock window.confirm to always return true
    window.confirm = jest.fn(() => true);

    render(<Settings />, { wrapper: MemoryRouter });

    // Click on "Delete Account" button
    fireEvent.click(screen.getByRole('button', { name: 'Delete Account' }));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText('Account deleted successfully.')).toBeInTheDocument();
    });

    // Verify that fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledWith('api/deleteUsers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '1' }),
    });

    // Verify that navigate was called to redirect
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('can logout', () => {
    render(<Settings />, { wrapper: MemoryRouter });

    // Click on "Logout" button
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    // Verify that user data is removed from localStorage
    expect(localStorage.getItem('user_data')).toBeNull();

    // Verify that navigate was called to redirect
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
