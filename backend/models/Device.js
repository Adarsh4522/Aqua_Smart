const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['shower', 'tap', 'irrigation', 'dishwasher', 'washing_machine', 'toilet', 'other'],
    required: true
  },
  brand: { type: String, default: '' },
  location: { type: String, default: 'Home' }, // e.g. "Kitchen", "Garden"
  avgUsagePerDay: { type: Number, default: 0 }, // litres
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);
