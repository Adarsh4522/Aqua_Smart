const Tip = require('../models/Tip');

// @desc    Get all approved tips (optionally filtered by category/location)
// @route   GET /api/tips
// @access  Public
const getTips = async (req, res) => {
  try {
    // Build query
    const query = { isApproved: true };

    if (req.query.category) query.category = req.query.category;
    if (req.query.season) query.season = req.query.season;
    if (req.query.location) {
      // Simple text search for location
      query.location = { $regex: req.query.location, $options: 'i' };
    }

    const tips = await Tip.find(query)
      .populate('authorId', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: tips.length, tips });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single tip
// @route   GET /api/tips/:id
// @access  Public
const getTipById = async (req, res) => {
  try {
    const tip = await Tip.findById(req.params.id).populate('authorId', 'name role');
    if (!tip) return res.status(404).json({ success: false, message: 'Tip not found' });
    
    if (!tip.isApproved && req.user?.role !== 'admin' && req.user?.id !== tip.authorId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, tip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new tip (Providers & Admins)
// @route   POST /api/tips
// @access  Private (Provider/Admin)
const createTip = async (req, res) => {
  try {
    const { title, body, category, season, location, imageUrl } = req.body;

    const isApproved = req.user.role === 'admin'; // Auto-approve if admin created

    const tip = await Tip.create({
      title,
      body,
      category,
      season,
      location,
      imageUrl,
      authorId: req.user.id,
      isApproved
    });

    res.status(201).json({ success: true, tip });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get tips submitted by current provider
// @route   GET /api/tips/my/tips
// @access  Private (Provider/Admin)
const getMyTips = async (req, res) => {
  try {
    const tips = await Tip.find({ authorId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: tips.length, tips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getTips,
  getTipById,
  createTip,
  getMyTips
};
