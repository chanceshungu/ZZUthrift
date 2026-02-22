import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../logo.png';
import { magic } from '../magic';

const API = 'http://localhost:8000/api';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    document.body.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (!token) return;
    const fetchUnread = async () => {
      try {
        const res = await axios.get(`${API}/messages/unread/count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnread(res.data.count);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const logout = async () => {
    try {
      // Log out from Magic SDK first
      await magic.user.logout();
    } catch (err) {
      console.error('Magic logout error:', err);
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Navigate and reload
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logo} alt="ZZU Thrift" className="navbar-logo" />
      </Link>
      <div className="navbar-links">
        <Link to="/">Browse</Link>
        {token ? (
          <>
            <Link to="/create" className="btn-sell">+ Sell</Link>
            <Link to="/saved">❤️ Saved</Link>
            <Link to="/inbox" style={{ position: 'relative' }}>
              Inbox
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: 'var(--crimson)', color: 'white',
                  borderRadius: '50%', width: '16px', height: '16px',
                  fontSize: '0.65rem', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: '700'
                }}>{unread}</span>
              )}
            </Link>
            <Link to="/profile">{user?.name?.split(' ')[0] || 'Profile'}</Link>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            {/* Consolidated to a single "Join / Login" flow */}
            <Link to="/login" className="btn-sell">Sign In / Join</Link>
          </>
        )}
        <button className="theme-toggle" onClick={() => setDark(d => !d)} title="Toggle theme">
          {dark ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;