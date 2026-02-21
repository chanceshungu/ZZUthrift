import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000/api';

function Conversation() {
  const { listingId, otherUserId } = useParams();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [listing, setListing] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchListing();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API}/messages/${listingId}/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
      if (res.data.length > 0) {
        const other = res.data[0].sender._id === currentUser.id
          ? res.data.find(m => m.sender._id !== currentUser.id)?.sender
          : res.data[0].sender;
        if (other) setOtherUser(other);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchListing = async () => {
    try {
      const res = await axios.get(`${API}/listings/${listingId}`);
      setListing(res.data);
      if (!otherUser) setOtherUser(res.data.seller);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await axios.post(`${API}/messages`, {
        listingId,
        recipientId: otherUserId,
        text: text.trim()
      }, { headers: { Authorization: `Bearer ${token}` } });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send');
    }
    setSending(false);
  };

  if (loading) return <div className="loading">Loading conversation...</div>;

  return (
    <div className="conversation-page">
      <div className="conversation-header">
        <Link to="/inbox" className="back-link">← Inbox</Link>
        <div className="conv-header-info">
          <div className="conv-header-title">
            {listing?.title || 'Listing'}
          </div>
          <div className="conv-header-user">
            with 🐾 {otherUser?.name || '...'}
          </div>
        </div>
        <Link to={`/listing/${listingId}`} className="conv-listing-link">
          View Listing →
        </Link>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="icon">💬</div>
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.sender._id === currentUser.id ||
              msg.sender._id?.toString() === currentUser.id;
            return (
              <div key={msg._id} className={`message-bubble ${isMe ? 'me' : 'them'}`}>
                <div className="bubble-text">{msg.text}</div>
                <div className="bubble-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="message-input-form" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={sending}
          autoFocus
        />
        <button type="submit" disabled={sending || !text.trim()}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default Conversation;
