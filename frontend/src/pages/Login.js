import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { magic } from '../magic';
import api from '../api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'check'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('@wsu.edu') && !email.endsWith('@cougs.wsu.edu')) {
      return setError('You must use a WSU email (@wsu.edu or @cougs.wsu.edu)');
    }

    setLoading(true);
    setStep('check');

    try {
      // Magic SDK sends a login link to the user's email
      const didToken = await magic.auth.loginWithMagicLink({ email });

      // Send the DID token to our backend
      const res = await api.post('/auth/magic-login', { didToken });

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setStep('email');
      if (err.message === 'User denied account access.') {
        setError('Login was cancelled. Try again.');
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Welcome to ZZU Thrift</h2>
        <p>Sign in with your WSU email — no password needed</p>
        {error && <div className="error-msg">{error}</div>}

        {step === 'email' ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>WSU Email</label>
              <input
                type="email"
                placeholder="yourname@wsu.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending link...' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <div className="magic-check-email">
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>&#9993;</div>
              <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.5rem', color: 'var(--text)' }}>
                Check your email
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                We sent a login link to <strong>{email}</strong>.
                Click the link in your email to sign in.
              </p>
            </div>
          </div>
        )}

        <div className="form-link">
          New to ZZU Thrift? Just enter your WSU email above to get started.
        </div>
      </div>
    </div>
  );
}

export default Login;
