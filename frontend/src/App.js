import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import Profile from './pages/Profile';
import Inbox from './pages/Inbox';
import Conversation from './pages/Conversation';
import Saved from './pages/Saved';
import './App.css';

const PrivateRoute = ({ children }) => {
  return localStorage.getItem('token') ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/create" element={<PrivateRoute><CreateListing /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/inbox" element={<PrivateRoute><Inbox /></PrivateRoute>} />
          <Route path="/conversation/:listingId/:otherUserId" element={<PrivateRoute><Conversation /></PrivateRoute>} />
          <Route path="/saved" element={<PrivateRoute><Saved /></PrivateRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
