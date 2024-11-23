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

  return (
    <div className="logged-in-name-container">
      <h2>Welcome, {user.firstName} {user.lastName}</h2>
      
      <button
        onClick={() => navigate('/afterwords/view-messages')}
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
        View Messages
      </button>

    <button
      onClick={() => navigate('/afterwords/create-message')}
      style={{
        backgroundColor: '#316b39',
        color: 'white',
        padding: '10px 20px',
        margin: '10px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
      }}
    >
      Create Message
    </button>


    <button
      onClick={() => navigate('/afterwords/settings')}
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
      Settings
    </button>

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default LoggedInName;
