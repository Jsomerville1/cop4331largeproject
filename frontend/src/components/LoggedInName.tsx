import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoggedInName() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');

  function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
      ? 'http://localhost:5000/' + route
      : '/' + route;
  }

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
        body: JSON.stringify({ userId: user.id }), // Correct payload
      });

      const res = await response.json();
      if (res.error) {
        setMessage(res.error);
      } else {
        localStorage.removeItem('user_data'); // Clear user data
        setMessage('Account deleted successfully.');
        navigate('/')
      }
    } catch (error) {
      setMessage('Failed to delete account. Please try again later.');
    }
  }

  function logout() {
    localStorage.removeItem('user_data'); // Clear user data
    setMessage('You have been logged out.');
    navigate('/')
  }

  return (
    <div className="logged-in-name-container">
      <h2>Welcome, {user.firstName} {user.lastName}</h2>
      
      <button onClick={logout} className="logout-button">
        Logout
      </button>

      <button onClick={deleteAccount} className="delete-account-button">
        Delete Account
      </button>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default LoggedInName;
