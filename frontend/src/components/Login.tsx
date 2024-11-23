// src/components/Login.tsx

import { useState } from 'react';
import gravestoneImage from '../assets/Gravestone.png';

function Login() {
  // Function to build API path
  function buildPath(route: string): string {
    const isDevelopment = process.env.NODE_ENV === "development";
    return isDevelopment ? `http://localhost:5000/${route}` : `/${route}`;
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
  const [checkInFreq, setCheckInFreq] = useState<number | null>(null);

  // Verification fields
  const [showVerification, setShowVerification] = useState(false);
  const [verificationUsername, setVerificationUsername] = useState(''); // New state variable
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Clear registration fields only
  function clearRegistrationFields() {
    setFirstName('');
    setLastName('');
    setRegisterUsername('');
    setEmail('');
    setRegisterPassword('');
    setCheckInFreq(null);
    setRegisterMessage('');
  }

  // Clear all fields
  function clearAllFields() {
    // Clear login fields
    setLoginName('');
    setPassword('');
    // Clear registration fields
    clearRegistrationFields();
    // Clear verification fields
    setVerificationUsername('');
    setVerificationCode('');
    setVerificationMessage('');
    setVerificationSuccess(false);
    // Clear messages
    setMessage('');
  }

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    const obj = { Username: loginName, Password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();
      console.log('API Response:', res); // Debugging

      if (res.error) {
        setMessage(res.error);
      } else if (res.verified === false) {
        setMessage('Please verify your account');
        setShowVerification(true); // Show verification form
        setVerificationUsername(loginName); // Set username for verification
      } else {
        // Store all user data in localStorage
        const user = {
          id: res.id,
          firstName: res.firstName,
          lastName: res.lastName,
          username: res.username,
          email: res.email,
          checkInFreq: res.checkInFreq,
          verified: res.verified,
          deceased: res.deceased,
          createdAt: res.createdAt,
          lastLogin: res.lastLogin,
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        console.log('Stored user data:', user); // Debugging

        setMessage('');
        window.location.href = '/afterwords';
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function doRegister(event: any): Promise<void> {
    event.preventDefault();
    if (!checkInFreq) {
      setRegisterMessage('Please select a check-in frequency.');
      return;
    }

    const obj = {
      FirstName: firstName,
      LastName: lastName,
      Username: registerUsername,
      Email: email,
      Password: registerPassword,
      CheckInFreq: checkInFreq,
    };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/register'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();
      if (res.error) {
        setRegisterMessage(res.error);
      } else {
        setRegisterMessage(
          'Registration successful! Please check your email for the verification code.'
        );
        setShowVerification(true); // Show verification input
        setVerificationUsername(registerUsername); // Set username for verification
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function handleVerifyCode(event: any) {
    event.preventDefault();

    if (!verificationUsername) {
      setVerificationMessage('Please enter your username.');
      return;
    }

    const response = await fetch(buildPath('api/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Username: verificationUsername, code: verificationCode }),
    });

    const res = await response.json();
    if (res.error) {
      setVerificationMessage(res.error);
    } else {
      setVerificationMessage('Verification successful! You can now log in.');
      setVerificationSuccess(true); // Indicate successful verification
    }
  }

  // Handle returning to the login page after successful verification
  function handleReturnToLogin() {
    clearAllFields();
    setShowVerification(false);
    setShowRegister(false);
  }

  // Handle switching to verify page if user not verified or user clicks "Verify"
  function handleSwitchToVerify() {
    clearAllFields();
    setShowVerification(true);
    setShowRegister(false);
    setVerificationSuccess(false);
    setVerificationMessage('');
    setVerificationCode('');
    // Keep verificationUsername empty for manual entry
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
        backgroundColor: '#242424',
      }}
    >
      {showVerification ? (
        // Verification Code Form
        <div className="login-container" style={{ padding: '0 10px' }}>
          <h3>Enter Email Verification Code</h3>
          <input
            type="text"
            placeholder="Username"
            value={verificationUsername}
            onChange={(e) => setVerificationUsername(e.target.value)}
            className="login-input"
          />
          <input
            type="text"
            placeholder="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="login-input"
          />
          <button onClick={handleVerifyCode} className="login-button">
            Verify
          </button>

          <div className={`login-message ${verificationSuccess ? 'success' : ''}`}>
            {verificationMessage}
          </div>

          {verificationSuccess && (
            <button onClick={handleReturnToLogin} className="login-button">
              Return to Login
            </button>
          )}
        </div>
      ) : showRegister ? (
        // Register Form
        <div id="registerDiv" className="login-container" style={{
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          width: '300px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 className="login-title">Register Account</h2>

          <form onSubmit={doRegister}>
            <input
              type="text"
              placeholder="Username"
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              className="login-input"
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              className="login-input"
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="login-input"
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="login-input"
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              required
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px'
              }}
            />

            <div className="check-in-frequency" style={{ marginBottom: '15px' }}>
              <label>Check-In Frequency:</label>
              <div className="radio-option" style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <input
                  type="radio"
                  value={120} // 2 minutes in seconds
                  checked={checkInFreq === 120}
                  onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
                  required
                  style={{ marginRight: '5px' }}
                />
                <span>2 Minutes</span>
              </div>
              <div className="radio-option" style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <input
                  type="radio"
                  value={604800} // 7 days in seconds
                  checked={checkInFreq === 604800}
                  onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
                  style={{ marginRight: '5px' }}
                />
                <span>1 Week (7 Days)</span>
              </div>
              <div className="radio-option" style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <input
                  type="radio"
                  value={2592000} // 1 month (30 days) in seconds
                  checked={checkInFreq === 2592000}
                  onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
                  style={{ marginRight: '5px' }}
                />
                <span>1 Month (30 Days)</span>
              </div>
              <div className="radio-option" style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                <input
                  type="radio"
                  value={31536000} // 1 year in seconds
                  checked={checkInFreq === 31536000}
                  onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
                  style={{ marginRight: '5px' }}
                />
                <span>1 Year (365 Days)</span>
              </div>
            </div>

            <button type="submit" className="login-button" style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              Register
            </button>
          </form>

          <button onClick={() => { clearAllFields(); setShowRegister(false); }} className="register-button" style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}>
            Back to Login
          </button>

          <div className="login-message">{registerMessage}</div>
        </div>
      ) : (
        // Login Form
        <div className="login-container" style={{ padding: '0 10px' }}>
          <h2 className="login-title">Login to Afterwords</h2>

          <input
            type="text"
            id="loginName"
            placeholder="Username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            className="login-input"
          />

          <input
            type="password"
            id="loginPassword"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />

          <button onClick={doLogin} className="login-button">
            Log In
          </button>

          <button
            onClick={() => {
              clearAllFields();
              setShowRegister(true);
            }}
            className="register-button"
          >
            Register
          </button>

          <button onClick={handleSwitchToVerify} className="login-button">
            Verify
          </button>

          <div className={`login-message ${message === 'Login successful!' ? 'success' : ''}`}>
            {message}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
