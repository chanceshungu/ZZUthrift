const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String, required: true,
    enum: ['Clothing', 'Textbooks', 'Dorm Essentials', 'Electronics', 'Furniture', 'Other']
  },
  condition: {
    type: String, required: true,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
  },
  type: { type: String, enum: ['Sell', 'Trade', 'Free'], default: 'Sell' },
  image: { type: String, default: '' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Available', 'Reserved', 'Sold'], default: 'Available' },
  location: { type: String, default: 'WSU Campus' },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);

