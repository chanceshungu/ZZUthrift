const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    validate: {
      validator: v => v.endsWith('@wsu.edu') || v.endsWith('@cougs.wsu.edu'),
      message: 'Must use a valid WSU email address (@wsu.edu or @cougs.wsu.edu)'
    }
  },
  // Password field removed - Authentication is now handled via Magic Link
  bio: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  savedListings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
}, { timestamps: true });

// Bcrypt middleware and password comparison methods removed 
// as we are now passwordless.

module.exports = mongoose.model('User', userSchema);