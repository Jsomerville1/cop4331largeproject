import React, { useState } from 'react';
import gravestoneImage from '../assets/Gravestone.png';

function Login()
{

  function buildPath(route: string): string {
    //const app_name = 'copteam22.xyz';
    if (import.meta.env.MODE === 'development') {
      return 'http://localhost:5000/' + route;
    } else {
      return '/' + route; // Use relative path in production
    }
  }

  const [message,setMessage] = useState('');
  const [loginName,setLoginName] = React.useState('');
  const [loginPassword,setPassword] = React.useState('');

    async function doLogin(event:any) : Promise<void>
    {
        event.preventDefault();

        var obj = { Username: loginName, Password: loginPassword };
        var js = JSON.stringify(obj);
  
        try
        {    
            const response = await fetch(buildPath('api/login'),
                {method:'POST',body:js,headers:{'Content-Type': 'application/json'}});
  
            var res = JSON.parse(await response.text());
  
            if( res.id <= 0 )
            {
                setMessage('User/Password combination incorrect');
            }
            else
            {
                var user = {firstName:res.firstName,lastName:res.lastName,id:res.id}
                localStorage.setItem('user_data', JSON.stringify(user));
  
                setMessage('');
                window.location.href = '/cards';
            }
        }
        catch(error:any)
        {
            alert(error.toString());
            return;
        }    
      };

    function handleSetLoginName( e: any ) : void
    {
      setLoginName( e.target.value );
    }

    function handleSetPassword( e: any ) : void
    {
      setPassword( e.target.value );
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
          <div className="login-container" style={{ padding: '0 10px' }}>
              <h2 className="login-title">Login to Afterwords</h2>
  
              <input
                  type="text"
                  id="loginName"
                  placeholder="Username"
                  onChange={handleSetLoginName}
                  className="login-input"
              />
  
              <input
                  type="password"
                  id="loginPassword"
                  placeholder="Password"
                  onChange={handleSetPassword}
                  className="login-input"
              />
  
              <button
                  onClick={doLogin}
                  className="login-button"
              >
                  Log In
              </button>
  
              <div className={`login-message ${message === 'Login successful!' ? 'success' : ''}`}>
                  {message}
              </div>
          </div>
      </div>
  );
};

export default Login;

