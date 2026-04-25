const User = require('../models/User');
const Tip = require('../models/Tip');
const Device = require('../models/Device');
const UsageLog = require('../models/UsageLog');

// @desc    Get all users (for management)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve/Revoke provider account
// @route   PUT /api/admin/users/:id/approve
// @access  Private/Admin
const approveUser = async (req, res) => {
  try {
    const { approved } = req.body;
    
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isApproved = approved;
    await user.save();

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'provider', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isApproved: role === 'admin' ? true : false },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get pending tips
// @route   GET /api/admin/tips/pending
// @access  Private/Admin
const getPendingTips = async (req, res) => {
  try {
    const tips = await Tip.find({ isApproved: false })
      .populate('authorId', 'name role email')
      .sort({ createdAt: 1 });
      
    res.json({ success: true, count: tips.length, tips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Approve a tip
// @route   PUT /api/admin/tips/:id/approve
// @access  Private/Admin
const approveTip = async (req, res) => {
  try {
    let tip = await Tip.findById(req.params.id);
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });

    tip.isApproved = true;
    await tip.save();

    res.json({ success: true, tip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Delete any tip
// @route   DELETE /api/admin/tips/:id
// @access  Private/Admin
const deleteTip = async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id);
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });

    await tip.deleteOne();
    res.json({ success: true, message: 'Tip deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get platform-wide statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingProviders = await User.countDocuments({ role: 'provider', isApproved: false });
    const totalDevices = await Device.countDocuments();
    const totalTips = await Tip.countDocuments({ isApproved: true });
    
    // Sum all water logged ever
    const waterResult = await UsageLog.aggregate([
      { $group: { _id: null, total: { $sum: '$liters' } } }
    ]);
    const totalWaterLogged = waterResult.length > 0 ? waterResult[0].total : 0;

    res.json({
      success: true,
      stats: {
        totalUsers,
        pendingProviders,
        totalDevices,
        totalTips,
        totalWaterLogged
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get all devices (for management/oversight)
// @route   GET /api/admin/devices
// @access  Private/Admin
const getAllDevices = async (req, res) => {
  try {
    const devices = await Device.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: devices.length, devices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getUsers,
  approveUser,
  changeUserRole,
  getPendingTips,
  approveTip,
  deleteTip,
  getStats,
  getAllDevices
};
