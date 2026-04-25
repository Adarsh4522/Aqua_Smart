const express = require('express');
const {
  getUsers,
  approveUser,
  changeUserRole,
  getPendingTips,
  approveTip,
  deleteTip,
  getStats,
  getAllDevices
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // All admin routes strictly require 'admin' role

// User Management
router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/role', changeUserRole);

// Tip Moderation
router.get('/tips/pending', getPendingTips);
router.put('/tips/:id/approve', approveTip);
router.delete('/tips/:id', deleteTip);

// Platform Stats
router.get('/stats', getStats);

// Device Oversight
router.get('/devices', getAllDevices);

module.exports = router;
