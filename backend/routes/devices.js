const express = require('express');
const { getDevices, addDevice, updateDevice, deleteDevice } = require('../controllers/deviceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All device routes require auth

router.route('/')
  .get(getDevices)
  .post(addDevice);

router.route('/:id')
  .put(updateDevice)
  .delete(deleteDevice);

module.exports = router;
