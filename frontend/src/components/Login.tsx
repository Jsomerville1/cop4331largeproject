import React, { useState } from 'react';
import gravestoneImage from '../assets/Gravestone.png';

function Login() {
  function buildPath(route: string): string {
    return import.meta.env.MODE === 'development'
      ? 'http://localhost:5000/' + route
      : '/' + route;
  }

  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // Registration fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  // Clear registration fields only
  function clearRegistrationFields() {
    setFirstName('');
    setLastName('');
    setRegisterUsername('');
    setEmail('');
    setRegisterPassword('');
    setRegisterMessage('');
  }

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    const obj = { Username: loginName, Password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());

      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      } else {
        const user = { firstName: res.firstName, lastName: res.lastName, id: res.id };
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        window.location.href = '/cards';
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function doRegister(event: any): Promise<void> {
    event.preventDefault();
    const obj = {
      FirstName: firstName,
      LastName: lastName,
      Username: registerUsername,
      Email: email,
      Password: registerPassword
    };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/register'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());

      if (res.error) {
        setRegisterMessage(res.error);
      } else {
        setShowRegister(false);
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  function handleSetLoginName(e: any): void {
    setLoginName(e.target.value);
  }

  function handleSetPassword(e: any): void {
    setPassword(e.target.value);
  }

  return (
    <div 
      id="loginDiv"
      style={{
          backgroundImage: `url(${gravestoneImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100%',
          backgroundColor: '#242424'
      }}
    >
      {!showRegister ? (
        // Login Form
        <div className="login-container" style={{ padding: '0 10px' }}>
          <h2 className="login-title">Login to Afterwords</h2>

          <input
            type="text"
            id="loginName"
            placeholder="Username"
            value={loginName}
            onChange={handleSetLoginName}
            className="login-input"
          />

          <input
            type="password"
            id="loginPassword"
            placeholder="Password"
            value={loginPassword}
            onChange={handleSetPassword}
            className="login-input"
          />

          <button onClick={doLogin} className="login-button">
            Log In
          </button>

          <button onClick={() => { clearRegistrationFields(); setShowRegister(true); }} className="register-button">
            Register
          </button>

          <div className={`login-message ${message === 'Login successful!' ? 'success' : ''}`}>
            {message}
          </div>
        </div>
      ) : (
        // Register Form
        <div id="registerDiv" className="login-container" style={{ padding: '0 10px' }}>
          <h2 className="login-title">Register Account</h2>

          <input
            type="text"
            placeholder="Username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="login-input"
          />
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="login-input"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="login-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />

          <button onClick={doRegister} className="login-button">
            Register
          </button>

          <button onClick={() => setShowRegister(false)} className="register-button">
            Back to Login
          </button>

          <div className="login-message">
            {registerMessage}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;

