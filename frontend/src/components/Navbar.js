import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../logo.png';

const API = 'http://localhost:8000/api';

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

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
      } catch (err) {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchVal.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}` : '/');
  };

  const handleShare = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: 'ZZU Thrift', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <Link to="/" className="navbar-brand">
        <img src={logo} alt="ZZU Thrift" className="navbar-logo" />
      </Link>

      {/* Center: Search */}
      <form className="navbar-search" onSubmit={handleSearch}>
        <span className="navbar-search-icon"><SearchIcon /></span>
        <input
          type="text"
          placeholder="Search listings..."
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
        />
      </form>

      {/* Right: actions + hamburger */}
      <div className="navbar-right">
        {token && (
          <Link to="/saved" className="nav-icon-btn" title="Saved">
            <HeartIcon />
          </Link>
        )}
        {token ? (
          <Link to="/create" className="btn-sell">+ Sell</Link>
        ) : (
          <Link to="/login" className="btn-sell btn-sell-ghost">Login</Link>
        )}

        {/* Hamburger zone — hover keeps dropdown open */}
        <div
          className="nav-menu-zone"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button className="hamburger-btn" aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className={`nav-dropdown${menuOpen ? ' open' : ''}`}>
            {token ? (
              <>
                <Link to="/profile" className="nav-dropdown-item">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
                <Link to="/inbox" className="nav-dropdown-item nav-inbox-item">
                  Inbox
                  {unread > 0 && <span className="nav-badge">{unread}</span>}
                </Link>
                <div className="nav-dropdown-divider" />
                <div className="nav-dropdown-item settings-row">
                  <span>Dark Mode</span>
                  <button
                    className={`theme-switch${dark ? ' on' : ''}`}
                    onClick={() => setDark(d => !d)}
                    aria-label="Toggle dark mode"
                  >
                    <span className="theme-switch-thumb" />
                  </button>
                </div>
                <button className="nav-dropdown-item" onClick={handleShare}>Share App</button>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item nav-logout" onClick={logout}>Log out</button>
              </>
            ) : (
              <>
                <div className="nav-dropdown-item settings-row">
                  <span>Dark Mode</span>
                  <button
                    className={`theme-switch${dark ? ' on' : ''}`}
                    onClick={() => setDark(d => !d)}
                    aria-label="Toggle dark mode"
                  >
                    <span className="theme-switch-thumb" />
                  </button>
                </div>
                <div className="nav-dropdown-divider" />
                <Link to="/login" className="nav-dropdown-item">Log in</Link>
                <Link to="/register" className="nav-dropdown-item">Join ZZU Thrift</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
