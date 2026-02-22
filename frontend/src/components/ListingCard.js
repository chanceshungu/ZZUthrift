import { useState, useEffect } from 'react';
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

function HeartIcon({ filled }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function ListingCard({ listing }) {
  const icon = CATEGORY_ICONS[listing.category] || '📦';
  const token = localStorage.getItem('token');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDesc, setShowDesc] = useState(false);

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
    <div className="listing-card-wrapper">
      <Link to={`/listing/${listing._id}`} className="listing-card">
        <div className="listing-card-image">
          {listing.image
            ? <img src={listing.image} alt={listing.title} />
            : <span>{icon}</span>
          }

          {/* Hover zone — wraps drawer + chevron so moving between them doesn't close it */}
          {listing.description && (
            <div
              className="card-desc-zone"
              onMouseEnter={() => setShowDesc(true)}
              onMouseLeave={() => setShowDesc(false)}
            >
              <div className="card-chevron-strip">
                <span className={`card-chevron${showDesc ? ' open' : ''}`}>
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </span>
              </div>
              <div className={`card-desc-drawer${showDesc ? ' open' : ''}`}>
                <p>{listing.description}</p>
              </div>
            </div>
          )}
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

      {token && (
        <button
          className={`card-heart-btn${saved ? ' saved' : ''}`}
          onClick={toggleSave}
          disabled={saving}
          title={saved ? 'Remove from saved' : 'Save listing'}
        >
          <HeartIcon filled={saved} />
        </button>
      )}
    </div>
  );
}

export default ListingCard;