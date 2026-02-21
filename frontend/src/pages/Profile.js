import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API = 'http://localhost:8000/api';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      axios.get(`${API}/listings/user/${user.id}`)
        .then(res => setListings(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/listings/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(listings.map(l => l._id === id ? { ...l, status } : l));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await axios.delete(`${API}/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setListings(listings.filter(l => l._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const initial = user?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">{initial}</div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <p style={{ marginTop: '0.3rem' }}>🐾 WSU Coug</p>
        </div>
      </div>

      <div className="profile-listings-title">
        My Listings ({listings.length})
        <Link to="/create" style={{ marginLeft: '1rem', fontSize: '0.9rem', color: '#981e32', textDecoration: 'none', fontWeight: '500' }}>
          + New Listing
        </Link>
      </div>

      {loading ? (
        <div className="loading">Loading your listings...</div>
      ) : listings.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🛍️</div>
          <p>You haven't posted anything yet!</p>
          <Link to="/create" style={{ display: 'inline-block', marginTop: '1rem', color: '#981e32', fontWeight: '600', textDecoration: 'none' }}>
            Post your first listing →
          </Link>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing._id} className="listing-card" style={{ cursor: 'default' }}>
              <Link to={`/listing/${listing._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="listing-card-image">
                  {listing.image ? <img src={listing.image} alt={listing.title} /> : <span>📦</span>}
                </div>
                <div className="listing-card-body">
                  <div className="listing-card-title">{listing.title}</div>
                  <div className="listing-card-price">
                    {listing.type === 'Free' ? 'FREE' : listing.type === 'Trade' ? 'Trade' : `$${listing.price}`}
                  </div>
                  <div className="listing-card-meta">{listing.status}</div>
                </div>
              </Link>
              <div style={{ padding: '0 1rem 1rem' }}>
                {listing.status === 'Available' && (
                  <button className="status-btn" onClick={() => updateStatus(listing._id, 'Reserved')}>
                    Mark Reserved
                  </button>
                )}
                {listing.status === 'Reserved' && (
                  <>
                    <button className="status-btn" onClick={() => updateStatus(listing._id, 'Sold')}>
                      Mark Sold
                    </button>
                    <button className="status-btn" onClick={() => updateStatus(listing._id, 'Available')}>
                      Relist
                    </button>
                  </>
                )}
                <button className="delete-btn" onClick={() => deleteListing(listing._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;
