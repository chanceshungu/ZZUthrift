import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';

/* ── Inline SVG icons ── */
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ShareIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);
const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const PinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const MessageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const ImagePlaceholderIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
    style={{ opacity: 0.25 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

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
  const [deleting, setDeleting] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    axios.get(`${API}/listings/${id}`)
      .then(res => setListing(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') navigate(-1); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

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
    try {
      if (navigator.share) {
        await navigator.share({ title: listing.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } catch (err) {}
  };

  const deleteListing = async () => {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete(`${API}/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/profile');
    } catch (err) {
      alert('Failed to delete listing');
      setDeleting(false);
    }
  };

  if (loading) return (
    <div className="detail-overlay">
      <div className="detail-loading">Loading...</div>
    </div>
  );
  if (!listing) return (
    <div className="detail-overlay" onClick={() => navigate(-1)}>
      <div className="detail-card detail-not-found" onClick={e => e.stopPropagation()}>
        <p>Listing not found.</p>
        <button onClick={() => navigate(-1)} className="contact-btn" style={{ marginTop: '1rem' }}>Go back</button>
      </div>
    </div>
  );

  const isOwner = currentUser?.id === listing.seller?._id?.toString();

  return (
    <div className="detail-overlay" onClick={() => navigate(-1)}>
      <div className="detail-card" onClick={e => e.stopPropagation()}>

        {/* Left: image */}
        <div className="detail-image">
          {listing.images && listing.images.length > 0
            ? <img src={listing.images[0]} alt={listing.title} />
            : (
              <div className="detail-image-placeholder">
                <ImagePlaceholderIcon />
                <span>{listing.category}</span>
              </div>
            )
          }
        </div>

        {/* Right: info */}
        <div className="detail-info">

          {/* Top row: badge + action buttons */}
          <div className="detail-top-row">
            <span className={`badge badge-${listing.type.toLowerCase()}`}>{listing.type}</span>
            <div className="detail-top-btns">
              {isOwner && (
                <button
                  onClick={() => navigate(`/edit/${id}`)}
                  className="detail-icon-btn"
                  title="Edit listing"
                >
                  <EditIcon />
                </button>
              )}
              <button
                onClick={shareListing}
                className="detail-icon-btn"
                title={shareSuccess ? 'Link copied!' : 'Share listing'}
              >
                <ShareIcon />
                {shareSuccess && <span className="share-toast">Copied</span>}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="detail-icon-btn"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          <h1 className="detail-title">{listing.title}</h1>
          <div className="detail-price">
            {listing.type === 'Free' ? 'FREE' : listing.type === 'Trade' ? 'Trade Only' : `$${listing.price}`}
          </div>

          {/* Meta rows */}
          <div className="detail-meta">
            <div className="detail-meta-row">
              <span className="meta-icon"><TagIcon /></span>
              <span className="meta-label">Category</span>
              <strong>{listing.category}</strong>
            </div>
            <div className="detail-meta-row">
              <span className="meta-icon"><SparkleIcon /></span>
              <span className="meta-label">Condition</span>
              <strong>{listing.condition}</strong>
            </div>
            {listing.location && (
              <div className="detail-meta-row">
                <span className="meta-icon"><PinIcon /></span>
                <span className="meta-label">Location</span>
                <strong>{listing.location}</strong>
              </div>
            )}
            <div className="detail-meta-row">
              <span className="meta-icon"><ClockIcon /></span>
              <span className="meta-label">Posted</span>
              <strong>{new Date(listing.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            </div>
            <div className="detail-meta-row">
              <span className="meta-icon"><CheckIcon /></span>
              <span className="meta-label">Status</span>
              <strong className={listing.status === 'Available' ? 'status-available' : 'status-unavailable'}>
                {listing.status}
              </strong>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="detail-description">
              <p>{listing.description}</p>
            </div>
          )}

          {/* Seller */}
          <div className="seller-box">
            <div className="seller-label">Seller</div>
            <div className="seller-inner">
              <div className="seller-avatar">
                <UserIcon />
              </div>
              <div>
                <div className="seller-name">{listing.seller?.name}</div>
                <div className="seller-email">{listing.seller?.email}</div>
              </div>
            </div>
          </div>

          {/* Message / owner / unavailable */}
          {listing.status === 'Available' && !isOwner && (
            <div className="message-seller-box">
              <div className="message-seller-label">
                <MessageIcon />
                <span>Message Seller</span>
              </div>
              {msgSent ? (
                <div className="success-msg">
                  Message sent! <Link to="/inbox" style={{ color: 'var(--crimson)', fontWeight: '600' }}>View in Inbox</Link>
                </div>
              ) : (
                <form onSubmit={sendMessage}>
                  {msgError && <div className="error-msg">{msgError}</div>}
                  <textarea
                    className="detail-textarea"
                    placeholder={`Hi ${listing.seller?.name?.split(' ')[0]}, is this still available?`}
                    value={msgText}
                    onChange={e => setMsgText(e.target.value)}
                    rows={3}
                  />
                  <button className="contact-btn" type="submit" disabled={sending || !msgText.trim()}>
                    {sending ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          )}

          {isOwner && (
            <div className="detail-owner-actions">
              <button
                className="detail-edit-btn"
                onClick={() => navigate(`/edit/${id}`)}
              >
                <EditIcon /> Edit Listing
              </button>
              <button
                className="detail-delete-btn"
                onClick={deleteListing}
                disabled={deleting}
              >
                <TrashIcon /> {deleting ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          )}

          {listing.status !== 'Available' && !isOwner && (
            <div className="detail-unavailable-notice">
              This item is {listing.status.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListingDetail;
