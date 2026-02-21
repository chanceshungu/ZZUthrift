import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Welcome Back 🐾</h2>
        <p>Sign in with your WSU email to continue</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>WSU Email</label>
            <input
              type="email" name="email" placeholder="yourname@wsu.edu"
              value={form.email} onChange={handleChange} required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password" name="password" placeholder="Enter your password"
              value={form.password} onChange={handleChange} required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="form-link">
          Don't have an account? <Link to="/register">Join ZZU Thrift</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
