import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

const API = 'http://localhost:8000/api';

function Saved() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate('/login');
    axios.get(`${API}/listings/saved/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setListings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">❤️</div>
        <div className="profile-info">
          <h2>Saved Items</h2>
          <p>Listings you've favorited</p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading saved items...</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="icon">❤️</div>
          <p>No saved items yet!</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--crimson)', fontWeight: '600', textDecoration: 'none' }}>
            Browse listings →
          </Link>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(listing => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Saved;
