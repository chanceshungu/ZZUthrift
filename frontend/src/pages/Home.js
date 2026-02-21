import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

const CATEGORIES = ['All', 'Clothing', 'Textbooks', 'Dorm Essentials', 'Electronics', 'Furniture', 'Other'];
const API = 'http://localhost:8000/api';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [scrolled, setScrolled] = useState(false);
  const marketplaceRef = useRef(null);

  useEffect(() => {
    fetchListings();
  }, [search, activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (activeCategory !== 'All') params.category = activeCategory;
      const res = await axios.get(`${API}/listings`, { params });
      setListings(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const scrollToMarketplace = () => {
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* ── LANDING SECTION ── */}
      <div className="landing-section">
        <div className={`landing-content ${scrolled ? 'faded' : ''}`}>
          <div className="landing-badge"> Welcome to ZZU Thrift </div>
          <h1 className="landing-title">
            Buy. Sell. Trade.<br />
            <span>On Campus.</span>
          </h1>
          <p className="landing-subtitle">
            ZZU Thrift is WSU's student-only marketplace for secondhand clothing,
            textbooks, dorm essentials, and more.
          </p>
          <div className="landing-stats">
            <div className="stat">
              <div className="stat-number">100%</div>
              <div className="stat-label">WSU Students</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">$0</div>
              <div className="stat-label">Fees Ever</div>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <div className="stat-number">♻️</div>
              <div className="stat-label">Sustainable</div>
            </div>
          </div>
          <button className="scroll-down-btn" onClick={scrollToMarketplace}>
            <span>Browse Listings</span>
            <div className="bounce-arrow">↓</div>
          </button>
        </div>
      </div>

      {/* ── MARKETPLACE SECTION ── */}
      <div ref={marketplaceRef} className="marketplace-section">
        <div className="marketplace-header">
          <h2 className="marketplace-title">Marketplace</h2>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search for clothing, textbooks, dorm stuff..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit">Search</button>
          </form>
          <div className="filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="listings-section">
          <h2>
            {loading ? 'Loading listings...' :
              `${listings.length} listing${listings.length !== 1 ? 's' : ''} found
              ${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
              ${search ? ` for "${search}"` : ''}`
            }
          </h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <div className="icon">🛍️</div>
              <p>No listings yet. Be the first to post something!</p>
            </div>
          ) : (
            <div className="listings-grid">
              {listings.map(listing => (
                <ListingCard key={listing._id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
