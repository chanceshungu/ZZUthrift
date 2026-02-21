import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';
const CATEGORY_ICONS = {
  'Clothing': '👕',
  'Textbooks': '📚',
  'Dorm Essentials': '🛏️',
  'Electronics': '💻',
  'Furniture': '🪑',
  'Other': '📦',
};

function ListingCard({ listing }) {
  const icon = CATEGORY_ICONS[listing.category] || '📦';
  const token = localStorage.getItem('token');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user) return;
    axios.get(`${API}/listings/saved/all`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setSaved(res.data.some(l => l._id === listing._id));
    }).catch(() => {});
  }, [listing._id]);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    setSaving(true);
    try {
      const res = await axios.post(`${API}/listings/${listing._id}/save`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSaved(res.data.saved);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  return (
    <div 
      style={{ position: 'relative' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Link to={`/listing/${listing._id}`} className="listing-card">
        <div className="listing-card-image">
          {listing.image
            ? <img src={listing.image} alt={listing.title} />
            : <span>{icon}</span>
          }
        </div>
        <div className="listing-card-body">
          <div className="listing-card-title">{listing.title}</div>
          <div className="listing-card-price">
            {listing.type === 'Free' ? 'FREE' : listing.type === 'Trade' ? 'Trade' : `$${listing.price}`}
          </div>
          <div className="listing-card-meta">
            <span className={`badge badge-${listing.type.toLowerCase()}`}>{listing.type}</span>
            {listing.category} · {listing.condition}
          </div>
          <div className="listing-card-meta" style={{ marginTop: '0.3rem' }}>
            {listing.seller?.name} · {new Date(listing.createdAt).toLocaleDateString()}
          </div>
        </div>
      </Link>

      {/* Tooltip */}
      {showTooltip && listing.description && (
        <div className="listing-tooltip">
          <div className="tooltip-title">{listing.title}</div>
          <div className="tooltip-description">{listing.description}</div>
        </div>
      )}

      {token && (
        <button
          onClick={toggleSave}
          disabled={saving}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: 'rgba(255,255,255,0.9)',
            border: 'none', borderRadius: '50%',
            width: '34px', height: '34px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '1rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'transform 0.15s',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
          }}
          title={saved ? 'Remove from saved' : 'Save listing'}
        >
          {saved ? '❤️' : '🤍'}
        </button>
      )}
    </div>
  );
}

export default ListingCard;
