const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
  liters: { type: Number, required: true, min: 0 },
  duration: { type: Number, default: 0 }, // minutes
  notes: { type: String, default: '' },
  recordedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('UsageLog', usageLogSchema);
