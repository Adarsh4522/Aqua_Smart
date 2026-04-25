const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetLiters: { type: Number, required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  achieved: { type: Boolean, default: false }
}, { timestamps: true });

// Unique goal per user per month/year
goalSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Goal', goalSchema);
