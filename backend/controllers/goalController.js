const Goal = require('../models/Goal');
const UsageLog = require('../models/UsageLog');

// @desc    Get current month's goal and progress
// @route   GET /api/goals
// @access  Private
const getGoal = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const year = now.getFullYear();

    // Find goal for current month
    const goal = await Goal.findOne({ userId: req.user.id, month, year });

    // Calculate actual usage this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const usageResult = await UsageLog.aggregate([
      {
        $match: {
          userId: req.user._id,
          recordedAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalLiters: { $sum: '$liters' }
        }
      }
    ]);

    const actualLiters = usageResult.length > 0 ? usageResult[0].totalLiters : 0;
    
    // Progress percentage
    let progress = 0;
    if (goal && goal.targetLiters > 0) {
      progress = (actualLiters / goal.targetLiters) * 100;
    }

    res.json({
      success: true,
      goal,
      actualLiters,
      progress
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Set or update goal for current month
// @route   POST /api/goals
// @access  Private
const setGoal = async (req, res) => {
  try {
    const { targetLiters } = req.body;
    
    if (!targetLiters || targetLiters <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid target amount' });
    }

    const now = new Date();
    
    // Upsert the goal (update if exists, create if not)
    const goal = await Goal.findOneAndUpdate(
      { 
        userId: req.user.id, 
        month: now.getMonth() + 1, 
        year: now.getFullYear() 
      },
      { targetLiters },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, goal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getGoal,
  setGoal
};
