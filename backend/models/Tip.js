const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  category: {
    type: String,
    enum: ['shower', 'garden', 'kitchen', 'laundry', 'general', 'toilet', 'irrigation'],
    default: 'general'
  },
  location: { type: String, default: '' }, // city/region relevance
  season: {
    type: String,
    enum: ['summer', 'winter', 'monsoon', 'spring', 'all'],
    default: 'all'
  },
  isApproved: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Tip', tipSchema);
