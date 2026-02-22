const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number },
  type: { type: String, enum: ['Sell', 'Trade', 'Free'], default: 'Sell' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [String],
  status: { type: String, enum: ['Available', 'Sold', 'Traded'], default: 'Available' },
  // Embeddings for semantic search
  titleEmbedding: [Number],
  descriptionEmbedding: [Number],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for text search
listingSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Listing', listingSchema);

