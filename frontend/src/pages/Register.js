import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (!form.email.endsWith('@wsu.edu') && !form.email.endsWith('@cougs.wsu.edu'))
      return setError('You must use a WSU email address (@wsu.edu or @cougs.wsu.edu)');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/register`, {
        name: form.name, email: form.email, password: form.password
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h2>Join ZZU Thrift 🏷️</h2>
        <p>WSU students only — use your @wsu.edu email</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text" name="name" placeholder="Your full name"
              value={form.name} onChange={handleChange} required
            />
          </div>
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
              type="password" name="password" placeholder="At least 6 characters"
              value={form.password} onChange={handleChange} required minLength={6}
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password" name="confirm" placeholder="Repeat your password"
              value={form.confirm} onChange={handleChange} required
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="form-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
