const router = require('express').Router();
const Listing = require('../models/Listing');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get all listings (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { category, type, search, status } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (status) query.status = status;
    else query.status = 'Available';
    if (search) query.title = { $regex: search, $options: 'i' };
    const listings = await Listing.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name email bio');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, price, category, condition, type, image, location } = req.body;
    const listing = await Listing.create({
      title, description, price, category, condition, type, image, location,
      seller: req.user._id
    });
    await listing.populate('seller', 'name email');
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update listing
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    const updated = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('seller', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    if (listing.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await listing.deleteOne();
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get listings by user
router.get('/user/:userId', async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.params.userId })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Save / unsave a listing
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const listingId = req.params.id;
    const isSaved = user.savedListings.includes(listingId);
    if (isSaved) {
      user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);
    } else {
      user.savedListings.push(listingId);
    }
    await user.save();
    res.json({ saved: !isSaved, savedListings: user.savedListings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get saved listings for current user
router.get('/saved/all', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedListings',
      populate: { path: 'seller', select: 'name email' }
    });
    res.json(user.savedListings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
