const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { getEmbedding, cosineSimilarity } = require('../utils/embedding');
const authMiddleware = require('../middleware/auth');

// Helper to check if embeddings are available
let embeddingsAvailable = process.env.USE_EMBEDDINGS === 'true';

// GET all listings with optional semantic search
router.get('/', async (req, res) => {
  try {
    const { search, category, semantic } = req.query;

    // No search query - return all listings
    if (!search) {
      let query = { status: 'Available' };
      if (category && category !== 'All') query.category = category;

      const listings = await Listing.find(query)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 });

      return res.json(listings);
    }

    // Semantic search (only if embeddings are available)
    if (semantic === 'true' && embeddingsAvailable) {
      try {
        const searchEmbedding = await getEmbedding(search);

        let listings = await Listing.find({ status: 'Available' })
          .populate('seller', 'name email');

        if (category && category !== 'All') {
          listings = listings.filter(l => l.category === category);
        }

        // Score by semantic similarity
        const scored = listings
          .map(listing => {
            const titleSim = listing.titleEmbedding
              ? cosineSimilarity(searchEmbedding, listing.titleEmbedding)
              : 0;
            const descSim = listing.descriptionEmbedding
              ? cosineSimilarity(searchEmbedding, listing.descriptionEmbedding)
              : 0;

            return {
              ...listing.toObject(),
              semanticScore: (titleSim * 0.6) + (descSim * 0.4),
            };
          })
          .filter(l => l.semanticScore > 0.3)
          .sort((a, b) => b.semanticScore - a.semanticScore);

        return res.json(scored);
      } catch (err) {
        // Embeddings failed - fall back to keyword search silently
        embeddingsAvailable = false;
        console.warn('Semantic search unavailable, falling back to keyword search.');
      }
    }

    // Keyword search fallback
    let query = { status: 'Available' };
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    if (category && category !== 'All') query.category = category;

    const listings = await Listing.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    return res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listings', error: err.message });
  }
});

// POST create listing
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, price, type, images } = req.body;

    let titleEmbedding = null;
    let descriptionEmbedding = null;

    // Only generate embeddings if available
    if (embeddingsAvailable) {
      try {
        titleEmbedding = await getEmbedding(title);
        descriptionEmbedding = await getEmbedding(description);
      } catch (embeddingErr) {
        // Disable embeddings silently for the rest of the session
        embeddingsAvailable = false;
        console.warn('Embeddings unavailable, listing created without semantic data.');
      }
    }

    const listing = new Listing({
      title,
      description,
      category,
      price,
      type,
      images,
      seller: req.user._id,
      titleEmbedding,
      descriptionEmbedding,
    });

    await listing.save();
    await listing.populate('seller', 'name email');

    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: 'Error creating listing', error: err.message });
  }
});

// GET listings by user (must be before /:id)
router.get('/user/:userId', async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.params.userId })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user listings', error: err.message });
  }
});

// GET saved listings (must be before /:id)
router.get('/saved/all', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id).populate({
      path: 'savedListings',
      populate: { path: 'seller', select: 'name email' }
    });
    res.json(user.savedListings || []);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching saved listings', error: err.message });
  }
});

// GET single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listing', error: err.message });
  }
});

// POST toggle save listing
router.post('/:id/save', authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const idx = user.savedListings.indexOf(req.params.id);
    if (idx === -1) {
      user.savedListings.push(req.params.id);
    } else {
      user.savedListings.splice(idx, 1);
    }
    await user.save();
    res.json({ saved: idx === -1 });
  } catch (err) {
    res.status(500).json({ message: 'Error saving listing', error: err.message });
  }
});

// PUT update listing
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(listing, req.body);

    // Re-embed if title/description changed and embeddings are available
    if (embeddingsAvailable && (req.body.title || req.body.description)) {
      try {
        listing.titleEmbedding = await getEmbedding(listing.title);
        listing.descriptionEmbedding = await getEmbedding(listing.description);
      } catch (err) {
        embeddingsAvailable = false;
        console.warn('Embeddings unavailable, listing updated without semantic data.');
      }
    }

    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: 'Error updating listing', error: err.message });
  }
});

// DELETE listing
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Listing.deleteOne({ _id: req.params.id });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting listing', error: err.message });
  }
});

module.exports = router;
