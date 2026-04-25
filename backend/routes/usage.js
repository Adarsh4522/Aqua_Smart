const express = require('express');
const { logUsage, getUsage, getUsageSummary, updateUsage, deleteUsage } = require('../controllers/usageController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUsage)
  .post(logUsage);

router.route('/:id')
  .put(updateUsage)
  .delete(deleteUsage);

router.get('/summary', getUsageSummary);

module.exports = router;
