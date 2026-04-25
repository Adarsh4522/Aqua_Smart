const express = require('express');
const { getTips, getTipById, createTip, getMyTips } = require('../controllers/tipController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getTips);
router.get('/:id', getTipById);

// Protected routes (providers and admins)
router.use(protect);

router.get('/my/tips', authorize('provider', 'admin'), getMyTips);
// Providers can submit tips even while account approval is pending.
// Submitted tips stay hidden from public until an admin approves them.
router.post('/', authorize('provider', 'admin'), createTip);

module.exports = router;
