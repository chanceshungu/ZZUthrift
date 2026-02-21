import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';
const CATEGORY_ICONS = {
  'Clothing': '👕', 'Textbooks': '📚', 'Dorm Essentials': '🛏️',
  'Electronics': '💻', 'Furniture': '🪑', 'Other': '📦',
};

function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgText, setMsgText] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState('');
  const [sending, setSending] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API}/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!token) return navigate('/login');
    if (!msgText.trim()) return;
    setSending(true);
    setMsgError('');
    try {
      await axios.post(`${API}/messages`, {
        listingId: id,
        recipientId: listing.seller._id,
        text: msgText.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMsgSent(true);
      setMsgText('');
    } catch (err) {
      setMsgError(err.response?.data?.message || 'Failed to send message');
    }
    setSending(false);
  };

  const shareListing = async () => {
    const url = window.location.href;
    const shareData = {
      title: listing.title,
      text: `Check out this ${listing.type.toLowerCase()} on ZZU Thrift: ${listing.title}`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  if (loading) return <div className="loading">Loading listing...</div>;
  if (!listing) return <div className="loading">Listing not found.</div>;

  const icon = CATEGORY_ICONS[listing.category] || '📦';
  const isOwner = currentUser?.id === listing.seller?._id?.toString();

  return (
    <div className="detail-page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Link to="/" className="back-link">← Back to listings</Link>
        <button onClick={shareListing} className="share-btn">
          {shareSuccess ? '✓ Copied!' : '🔗 Share'}
        </button>
      </div>

      <div className="detail-card">
        <div className="detail-image">
          {listing.image ? <img src={listing.image} alt={listing.title} /> : <span>{icon}</span>}
        </div>
        <div className="detail-info">
          <span className={`badge badge-${listing.type.toLowerCase()}`}>{listing.type}</span>
          <h1>{listing.title}</h1>
          <div className="detail-price">
            {listing.type === 'Free' ? 'FREE' : listing.type === 'Trade' ? 'Trade Only' : `$${listing.price}`}
          </div>
          <div className="detail-meta">
            <div>📦 Category: <strong>{listing.category}</strong></div>
            <div>✨ Condition: <strong>{listing.condition}</strong></div>
            <div>📍 Location: <strong>{listing.location}</strong></div>
            <div>🕐 Posted: <strong>{new Date(listing.createdAt).toLocaleDateString()}</strong></div>
            <div>📊 Status: <strong>{listing.status}</strong></div>
          </div>
          <div className="detail-description">
            <strong>Description</strong>
            <p style={{ marginTop: '0.5rem' }}>{listing.description}</p>
          </div>
          <div className="seller-box">
            <h4>Seller</h4>
            <div className="seller-name">🐾 {listing.seller?.name}</div>
            <div className="seller-email">{listing.seller?.email}</div>
          </div>

          {listing.status === 'Available' && !isOwner && (
            <div className="message-seller-box">
              <h4 style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text)' }}>
                💬 Message Seller
              </h4>
              {msgSent ? (
                <div className="success-msg">
                  Message sent! <Link to="/inbox" style={{ color: 'var(--crimson)', fontWeight: '600' }}>View in Inbox →</Link>
                </div>
              ) : (
                <form onSubmit={sendMessage}>
                  {msgError && <div className="error-msg">{msgError}</div>}
                  <textarea
                    placeholder={`Hi ${listing.seller?.name?.split(' ')[0]}, is this still available?`}
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    rows={3}
                    style={{ width: '100%', padding: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.9rem', background: 'var(--input-bg)', color: 'var(--text)', resize: 'none', marginBottom: '0.75rem' }}
                  />
                  <button className="contact-btn" type="submit" disabled={sending || !msgText.trim()}>
                    {sending ? 'Sending...' : '📨 Send Message'}
                  </button>
                </form>
              )}
            </div>
          )}

          {isOwner && (
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              This is your listing
            </div>
          )}

          {listing.status !== 'Available' && !isOwner && (
            <div style={{ textAlign: 'center', padding: '1rem', background: 'var(--bg)', borderRadius: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>
              This item is {listing.status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;
