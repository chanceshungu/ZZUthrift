import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';

function Inbox() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return navigate('/login');
    axios.get(`${API}/messages/conversations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setConversations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="inbox-page">
      <h2>Inbox</h2>
      {loading ? (
        <div className="loading">Loading messages...</div>
      ) : conversations.length === 0 ? (
        <div className="empty-state">
          <div className="icon">💬</div>
          <p>No messages yet. Browse listings and start a conversation!</p>
          <Link to="/" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--crimson)', fontWeight: '600', textDecoration: 'none' }}>
            Browse listings →
          </Link>
        </div>
      ) : (
        <div className="conversation-list">
          {conversations.map((conv, i) => (
            <Link
              key={i}
              to={`/conversation/${conv.listingId}/${conv.otherUser._id}`}
              className="conversation-item"
            >
              <div className="conv-image">
                {conv.listingImage
                  ? <img src={conv.listingImage} alt={conv.listingTitle} />
                  : <span>📦</span>
                }
              </div>
              <div className="conv-info">
                <div className="conv-title">{conv.listingTitle}</div>
                <div className="conv-user">🐾 {conv.otherUser.name}</div>
                <div className="conv-last">{conv.lastMessage}</div>
              </div>
              <div className="conv-meta">
                <div className="conv-date">
                  {new Date(conv.lastDate).toLocaleDateString()}
                </div>
                {conv.unread > 0 && (
                  <div className="conv-unread">{conv.unread}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default Inbox;
