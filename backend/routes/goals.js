const express = require('express');
const { getGoal, setGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoal)
  .post(setGoal);

module.exports = router;
