const UsageLog = require('../models/UsageLog');
const Device = require('../models/Device');

// @desc   Log water usage
// @route  POST /api/usage
// @access Private
const logUsage = async (req, res) => {
  try {
    const { deviceId, liters, duration, notes, recordedAt } = req.body;

    const device = await Device.findOne({ _id: deviceId, userId: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

    const log = await UsageLog.create({
      userId: req.user.id,
      deviceId,
      liters,
      duration,
      notes,
      recordedAt: recordedAt || new Date()
    });

    res.status(201).json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get usage history for user
// @route  GET /api/usage
// @access Private
const getUsage = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await UsageLog.find({ userId: req.user.id })
      .populate('deviceId', 'name type')
      .sort({ recordedAt: -1 })
      .limit(parseInt(limit));
    res.json({ success: true, count: logs.length, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Get usage summary (daily/weekly/monthly aggregates)
// @route  GET /api/usage/summary
// @access Private
const getUsageSummary = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);

    const [monthlyTotal, weeklyByDay, byDevice] = await Promise.all([
      // Total this month
      UsageLog.aggregate([
        { $match: { userId: req.user._id, recordedAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$liters' } } }
      ]),
      // Last 7 days breakdown
      UsageLog.aggregate([
        { $match: { userId: req.user._id, recordedAt: { $gte: startOfWeek } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$recordedAt' } },
            total: { $sum: '$liters' }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Usage by device this month
      UsageLog.aggregate([
        { $match: { userId: req.user._id, recordedAt: { $gte: startOfMonth } } },
        { $group: { _id: '$deviceId', total: { $sum: '$liters' } } },
        { $lookup: { from: 'devices', localField: '_id', foreignField: '_id', as: 'device' } },
        { $unwind: '$device' },
        { $project: { total: 1, deviceName: '$device.name', deviceType: '$device.type' } }
      ])
    ]);

    res.json({
      success: true,
      summary: {
        monthlyTotal: monthlyTotal[0]?.total || 0,
        weeklyByDay,
        byDevice
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update a usage log
// @route  PUT /api/usage/:id
// @access Private
const updateUsage = async (req, res) => {
  try {
    const log = await UsageLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    const updated = await UsageLog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, log: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a usage log
// @route  DELETE /api/usage/:id
// @access Private
const deleteUsage = async (req, res) => {
  try {
    const log = await UsageLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });

    await log.deleteOne();
    res.json({ success: true, message: 'Usage log removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { logUsage, getUsage, getUsageSummary, updateUsage, deleteUsage };
