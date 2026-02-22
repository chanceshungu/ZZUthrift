import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { magic } from '../magic'; 

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLinkSent, setShowLinkSent] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user is already authenticated (on page load)
  useEffect(() => {
    const checkMagicRedirect = async () => {
      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        if (isLoggedIn) {
          // User has Magic session - complete the backend login
          const didToken = await magic.user.getIdToken();
          
          if (didToken) {
            try {
              const res = await api.post('/auth/magic-login', { didToken });
              
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('user', JSON.stringify(res.data.user));
              
              // Redirect to home page
              navigate('/', { replace: true });
              return;
            } catch (apiErr) {
              console.error('Backend auth error:', apiErr);
              setError('Failed to complete login. Please try again.');
            }
          }
        }
      } catch (err) {
        console.error('Magic check error:', err);
      }
      setCheckingAuth(false);
    };
    
    checkMagicRedirect();
  }, [navigate]);

  // Poll for magic link completion only after user requests a link
  useEffect(() => {
    if (!showLinkSent) return;
    
    const checkMagicRedirect = async () => {
      try {
        const isLoggedIn = await magic.user.isLoggedIn();
        if (isLoggedIn) {
          const didToken = await magic.user.getIdToken();
          
          if (didToken) {
            try {
              const res = await api.post('/auth/magic-login', { didToken });
              
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('user', JSON.stringify(res.data.user));
              
              navigate('/', { replace: true });
              return;
            } catch (apiErr) {
              console.error('Backend auth error:', apiErr);
              setError('Failed to complete login. Please try again.');
            }
          }
        }
      } catch (err) {
        console.error('Magic check error:', err);
      }
    };
    
    // Poll every 1 second while waiting for magic link
    const interval = setInterval(checkMagicRedirect, 1000);
    return () => clearInterval(interval);
  }, [showLinkSent, navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.endsWith('@wsu.edu') && !email.endsWith('@cougs.wsu.edu')) {
      setError('Please use a valid WSU email address.');
      setLoading(false);
      return;
    }

    try {
      // Send Magic Link - user will receive email and click link
      await magic.auth.loginWithMagicLink({ email });
      setShowLinkSent(true);
      setEmail('');
    } catch (err) {
      console.error('Magic Link error:', err);
      setError('Failed to send magic link. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Welcome Back 🐾</h2>
        
        {checkingAuth ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p>Checking your authentication...</p>
            <div style={{
              display: 'inline-block',
              width: '30px',
              height: '30px',
              border: '3px solid var(--crimson)',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              marginTop: '10px'
            }}></div>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : showLinkSent ? (
          <>
            <p>✨ Magic link sent to your email!</p>
            <p>Click the link in your email to complete sign-in. You'll be logged in automatically.</p>
            <div className="success-msg" style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px' }}>
              Check your inbox and click the magic link!
            </div>
            <button className="btn-secondary" onClick={() => setShowLinkSent(false)} style={{ marginTop: '20px' }}>
              Send another link
            </button>
          </>
        ) : (
          <>
            <p>Enter your WSU email to receive a magic sign-in link</p>
            
            {error && <div className="error-msg">{error}</div>}
            
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <label>WSU Email</label>
                <input
                  type="email"
                  placeholder="yourname@wsu.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? 'Sending Link...' : 'Send Magic Link'}
              </button>
            </form>

            <div className="form-link">
              New to the Coug community? Just enter your email to join!
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;