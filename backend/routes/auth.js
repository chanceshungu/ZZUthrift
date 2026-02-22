const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Magic } = require('@magic-sdk/admin');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Initialize Magic Admin SDK
const magic = new Magic(process.env.MAGIC_SECRET_KEY);
const JWT_SECRET = process.env.JWT_SECRET;;

// Add this route to check if user is logged in
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

// SINGLE LOGIN ROUTE (Handles both Login and Registration)
router.post('/magic-login', async (req, res) => {
  try {
    // 1. Get the DID Token from request body OR header
    let didToken = req.body.didToken;
    
    if (!didToken) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        didToken = authHeader.substring(7);
      }
    }

    if (!didToken) {
      return res.status(401).json({ message: 'No DID token provided' });
    }
    
    // 2. Verify the token with Magic Admin SDK
    const metadata = await magic.users.getMetadataByToken(didToken);
    const email = metadata.email;

    // 3. Security Check: Only allow WSU emails
    if (!email.endsWith('@wsu.edu') && !email.endsWith('@cougs.wsu.edu')) {
      return res.status(403).json({ message: 'Unauthorized email domain. Use @wsu.edu' });
    }

    // 4. Find or Create the User in your Database
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email: email,
        name: email.split('@')[0],
      });
    }

    // 5. Issue a local JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Magic Login Error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

module.exports = router;