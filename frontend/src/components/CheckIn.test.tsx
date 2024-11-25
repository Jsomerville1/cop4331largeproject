// src/components/CheckIn.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CheckIn from './CheckIn';
import fetchMock from 'jest-fetch-mock';

describe('CheckIn Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
    localStorage.setItem(
      'user_data',
      JSON.stringify({
        id: '1',
        firstName: 'Test',
        lastName: 'User',
        checkInFreq: 604800,
        lastLogin: new Date().toISOString(),
      })
    );
  });

  test('renders CheckIn component with user data', () => {
    render(<CheckIn />);

    expect(screen.getByText('Check In')).toBeInTheDocument();
    expect(screen.getByText(/Last Check-In Date:/)).toBeInTheDocument();
    expect(screen.getByText(/Current Check-In Frequency:/)).toBeInTheDocument();
    expect(screen.getByText(/Check-In Expiration:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check In' })).toBeInTheDocument();
  });

  test('can perform check-in', async () => {
    // Mock the fetch response for check-in
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Check-in successful!' }));

    render(<CheckIn />);

    // Click on "Check In" button
    fireEvent.click(screen.getByRole('button', { name: 'Check In' }));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText('Check-in successful!')).toBeInTheDocument();
    });

    // Verify that fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledWith('api/checkIn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ UserId: '1' }), // Ensure UserId is correctly typed
    });

    // Check that localStorage was updated
    const updatedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    expect(updatedUser.lastLogin).not.toBeNull();
  });

  test('can update check-in frequency', async () => {
    // Mock the fetch response for updating frequency
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Check-in frequency updated successfully.' }));

    render(<CheckIn />);

    // Click on "1 Month (30 Days)" radio button
    fireEvent.click(screen.getByLabelText('1 Month (30 Days)'));

    // Wait for the success message to appear
    await waitFor(() => {
      expect(screen.getByText('Check-in frequency updated successfully.')).toBeInTheDocument();
    });

    // Verify that fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledWith('api/checkin-frequency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: '1', CheckInFreq: 2592000 }),
    });

    // Check that localStorage was updated
    const updatedUser = JSON.parse(localStorage.getItem('user_data') || '{}');
    expect(updatedUser.checkInFreq).toBe(2592000);
  });
});
