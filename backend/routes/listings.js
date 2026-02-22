const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const { getEmbedding, cosineSimilarity } = require('../utils/embedding');
const authMiddleware = require('../middleware/auth');

// Get all listings with semantic search
router.get('/', async (req, res) => {
  try {
    const { search, category, semantic } = req.query;

    // Traditional search
    if (!semantic) {
      let query = { status: 'Available' };

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      if (category && category !== 'All') {
        query.category = category;
      }

      const listings = await Listing.find(query)
        .populate('seller', 'name email')
        .sort({ createdAt: -1 });

      return res.json(listings);
    }

    // Semantic search
    if (!search) {
      return res.status(400).json({ message: 'Search query required for semantic search' });
    }

    try {
      const searchEmbedding = await getEmbedding(search);

      // Get all available listings
      let listings = await Listing.find({ status: 'Available' })
        .populate('seller', 'name email');

      if (category && category !== 'All') {
        listings = listings.filter(l => l.category === category);
      }

      // Score by semantic similarity
      const scored = listings.map(listing => {
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
      });

      // Sort by semantic score
      scored.sort((a, b) => b.semanticScore - a.semanticScore);

      res.json(scored.filter(l => l.semanticScore > 0.3));
    } catch (err) {
      console.error('Semantic search error:', err);
      res.status(500).json({ message: 'Semantic search failed' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listings', error: err.message });
  }
});

// Create listing with embeddings
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, price, type, images } = req.body;

    // Get embeddings
    const titleEmbedding = await getEmbedding(title);
    const descriptionEmbedding = await getEmbedding(description);

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

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name email');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listing', error: err.message });
  }
});

// Update listing
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(listing, req.body);

    // Re-embed if title/description changed
    if (req.body.title || req.body.description) {
      listing.titleEmbedding = await getEmbedding(listing.title);
      listing.descriptionEmbedding = await getEmbedding(listing.description);
    }

    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: 'Error updating listing', error: err.message });
  }
});

// Delete listing
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
