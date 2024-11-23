import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import './Settings.css';

function Settings() {
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  // Retrieve user data from localStorage
  const user = JSON.parse(localStorage.getItem('user_data') || '{}');
  const { username, email } = user;

  function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
      ? 'http://localhost:5000/' + route
      : '/' + route;
  }

  async function changePassword() {
    if (!user || !user.id) {
      setMessage('User not found. Please log in again.');
      return;
    }

    if (!currentPassword || !newPassword) {
      setMessage('Both current and new passwords are required.');
      return;
    }

    try {
      const response = await fetch(buildPath('api/editUser'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          currentPassword,
          newPassword,
        }),
      });

      const result = await response.json();
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error) {
      setMessage('Failed to update password. Please try again later.');
    }
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
        navigate('/');
      }
    } catch (error) {
      setMessage('Failed to delete account. Please try again later.');
    }
  }

  function logout() {
    localStorage.removeItem('user_data'); // Clear user data
    setMessage('You have been logged out.');
    navigate('/');
  }

  return (
    <div>
      <Button
        variant="secondary"
        className="redirect-button"
        onClick={() => navigate('/afterwords')}
      >
        Return to Check In
      </Button>

      <h2>Account Settings</h2>

      <p style={{opacity: 0.8,}}><strong>Username:</strong> {username || 'N/A'}</p>
      <p style={{opacity: 0.8,}}><strong>Email:</strong> {email || 'N/A'}</p>

    <div className="change-password-box">
      <h3>Change Password</h3>
      <InputGroup className="mb-3">
        <FormControl
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          />
      </InputGroup>
      <InputGroup className="mb-3">
        <FormControl
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          />
      </InputGroup>
      <Button onClick={changePassword} variant="primary">
        Update Password
      </Button>
      {message && <div className="message">{message}</div>}
    </div>

      {/* Logout Button */}
      <button
        onClick={logout}
        style={{
          backgroundColor: '#575757',
          color: 'white',
          padding: '10px 20px',
          margin: '10px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Logout
      </button>

      {/* Delete Account Button */}
      <button
        onClick={deleteAccount}
        style={{
          backgroundColor: '#a61a12',
          color: 'white',
          padding: '10px 20px',
          margin: '10px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Delete Account
      </button>

    </div>
  );
}

export default Settings;
