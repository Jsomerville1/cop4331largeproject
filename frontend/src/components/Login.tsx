import { useState } from 'react';
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
  const [checkInFreq, setCheckInFreq] = useState<number | null>(null); // store frequency as integer

  // Verification fields
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false); // Tracks if verification was successful

  // Clear registration fields only
  function clearRegistrationFields() {
    setFirstName('');
    setLastName('');
    setRegisterUsername('');
    setEmail('');
    setRegisterPassword('');
    setCheckInFreq(null); // reset check-in frequency
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

      //const res = JSON.parse(await response.text());
      const res = await response.json();

      //if (res.id <= 0) {
      if (res.error) {
        //setMessage('User/Password combination incorrect');
        setMessage(res.error);
      //} else {
      } else if (res.Verified === false) {
        setMessage('Please verify your account');
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
      CheckInFreq: checkInFreq
    };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/register'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

    
      const res = JSON.parse(await response.text());
      //const res = await response.json();
      if (res.error) {
        setRegisterMessage(res.error);
      } else {
        setRegisterMessage('Registration successful! Please check your email for the verification code.');
        setShowVerification(true); // Show verification input
      }
    } catch (error: any) {
      alert(error.toString());
    }
  }

  async function handleVerifyCode(event: any) {
    event.preventDefault();

    const response = await fetch(buildPath('api/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Username: registerUsername, code: verificationCode })
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
    clearRegistrationFields();
    setShowVerification(false);
    setShowRegister(false);
    setVerificationSuccess(false); // Reset verification success
    setVerificationMessage('');
    setVerificationCode('');
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

          <button onClick={() => { clearRegistrationFields(); setShowRegister(true); }} className="register-button">
            Register
          </button>

          <div className={`login-message ${message === 'Login successful!' ? 'success' : ''}`}>
            {message}
          </div>
        </div>
      ) : (
        showVerification ? (
          // Verification Code Form
          <div className="login-container" style={{ padding: '0 10px' }}>
            <h3>Enter Verification Code</h3>
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="login-input"
            />
            <button onClick={handleVerifyCode} className="login-button">Verify</button>
            <div className="login-message">{verificationMessage}</div>

            {verificationSuccess && (
              <button onClick={handleReturnToLogin} className="login-button">
                Return to Login
              </button>
            )}
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

          <div className="check-in-frequency">
            <label>Check-In Frequency:</label>
            <div className="radio-option">
              <input
                type="radio"
                value={120} // 2 minutes in seconds
                checked={checkInFreq === 120}
                onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
              />
              2 Minutes
            </div>
            <div className="radio-option">
              <input
                type="radio"
                value={604800} // 7 days in seconds
                checked={checkInFreq === 604800}
                onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
              />
              1 Week (7 Days)
            </div>
            <div className="radio-option">
              <input
                type="radio"
                value={2592000} // 1 month (30 days) in seconds
                checked={checkInFreq === 2592000}
                onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
              />
              1 Month (30 Days)
            </div>
            <div className="radio-option">
              <input
                type="radio"
                value={31536000} // 1 year in seconds
                checked={checkInFreq === 31536000}
                onChange={(e) => setCheckInFreq(parseInt(e.target.value))}
              />
              1 Year (365 Days)
            </div>
          </div>

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
        )
      )}
    </div>
  );
}

export default Login;

