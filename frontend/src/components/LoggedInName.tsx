// src/components/LoggedInName.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LoggedInName() {
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  // Retrieve user data from localStorage when the component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user_data') || 'null');
    if (storedUser) {
      setUser(storedUser);
    } else {
      setMessage('User data not found. Please log in again.');
      navigate('/'); // Redirect to login page
    }
  }, [navigate]);

  // Function to build API path
  function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
      ? 'http://localhost:5000/' + route
      : '/' + route;
  }

  // Function to delete the user's account
  async function deleteAccount() {
    if (!user || !user.id) {
      setMessage('User not found. Please log in again.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete your account?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(buildPath('api/deleteUsers'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const res = await response.json();
      if (res.error) {
        setMessage(res.error);
      } else {
        localStorage.removeItem('user_data'); // Clear user data
        setMessage('Account deleted successfully.');
        navigate('/');
      }
    } catch (error) {
      setMessage('Failed to delete account. Please try again later.');
    }
  }

  // Function to log out the user
  function logout() {
    localStorage.removeItem('user_data'); // Clear user data
    setMessage('You have been logged out.');
    navigate('/');
  }

  // Format date fields
  const formattedCreatedAt = user && user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A';
  const formattedLastLogin = user && user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A';

  return (
    <div className="logged-in-name-container">
      {user ? (
        <>
          <h2>Welcome, {user.firstName} {user.lastName}</h2>

          <p><strong>User ID:</strong> {user.id || 'N/A'}</p>
          <p><strong>First Name:</strong> {user.firstName || 'N/A'}</p>
          <p><strong>Last Name:</strong> {user.lastName || 'N/A'}</p>
          <p><strong>Username:</strong> {user.username || 'N/A'}</p>
          <p><strong>Email:</strong> {user.email || 'N/A'}</p>
          <p><strong>Check-In Frequency:</strong> {user.checkInFreq ? `${user.checkInFreq} seconds` : 'N/A'}</p>
          <p><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
          <p><strong>Deceased:</strong> {user.deceased ? 'Yes' : 'No'}</p>
          <p><strong>Account Created At:</strong> {formattedCreatedAt}</p>
          <p><strong>Last Login:</strong> {formattedLastLogin}</p>

          <button onClick={logout} className="logout-button">
            Logout
          </button>

          <button onClick={deleteAccount} className="delete-account-button">
            Delete Account
          </button>

          {message && <div className="message">{message}</div>}
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
}

export default LoggedInName;
