import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ListingCard from '../components/ListingCard';

const CATEGORIES = ['All', 'Clothing', 'Textbooks', 'Dorm Essentials', 'Electronics', 'Furniture', 'Other'];
const API = 'http://localhost:8000/api';

// Campus photos — frontend/public/campus/
const CAMPUS_PHOTOS = [
  '/campus/File%201.jpg',
  '/campus/File%202.png',
  '/campus/File%203.png',
  '/campus/File%204.jpg',
  '/campus/File%205.jpg',
  '/campus/File%206.jpg',
  '/campus/File%207.jpg',
  '/campus/File%208.jpg',
  '/campus/File%209.jpg',
  '/campus/File%2010.jpg',
];

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const BagIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ opacity: 0.3 }}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

function Home() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const marketplaceRef = useRef(null);

  // Sync with URL params (navbar search) and auto-scroll to marketplace
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    setSearch(urlSearch);
    setSearchInput(urlSearch);
    if (urlSearch) {
      setTimeout(() => {
        marketplaceRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchListings();
  }, [search, activeCategory]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (CAMPUS_PHOTOS.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(s => (s + 1) % CAMPUS_PHOTOS.length);
    }, 5000);
    return () => clearInterval(timer);
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
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToMarketplace = () => {
    marketplaceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      {/* ── LANDING ── */}
      <div className="landing-section">
        {/* Campus photo slideshow */}
        <div className="hero-slides">
          {CAMPUS_PHOTOS.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className={`hero-slide${i === currentSlide ? ' active' : ''}`}
            />
          ))}
        </div>
        <div className="hero-overlay" />

        <div className={`landing-content${scrolled ? ' faded' : ''}`}>
          <div className="landing-badge">
            <span className="landing-badge-dot" />
            Student Marketplace · WSU
          </div>

          <h1 className="landing-title">
            Buy. Sell.<br />
            Trade.<br />
            <span>On Campus.</span>
          </h1>

          <p className="landing-subtitle">
            ZZU Thrift — WSU's student-only marketplace for secondhand
            clothing, textbooks, dorm essentials, and more.
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
              <div className="stat-icon"><LeafIcon /></div>
              <div className="stat-label">Sustainable</div>
            </div>
          </div>

          <button className="scroll-down-btn" onClick={scrollToMarketplace}>
            Browse Listings
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="btn-arrow">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── MARKETPLACE ── */}
      <div ref={marketplaceRef} className="marketplace-section">
        <div className="marketplace-header">
          <h2 className="marketplace-title">Marketplace</h2>

          <form className="search-bar" onSubmit={handleSearch}>
            <span className="search-bar-icon"><SearchIcon /></span>
            <input
              type="text"
              placeholder="Search clothing, textbooks, dorm stuff…"
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
            {loading ? 'Loading…' :
              `${listings.length} listing${listings.length !== 1 ? 's' : ''} found` +
              (activeCategory !== 'All' ? ` in ${activeCategory}` : '') +
              (search ? ` for "${search}"` : '')
            }
          </h2>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : listings.length === 0 ? (
            <div className="empty-state">
              <BagIcon />
              <p>No listings found. Be the first to post something!</p>
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
