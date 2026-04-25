const Device = require('../models/Device');

// @desc   Get all devices for logged-in user
// @route  GET /api/devices
// @access Private
const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: devices.length, devices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Add a device
// @route  POST /api/devices
// @access Private
const addDevice = async (req, res) => {
  try {
    const { name, type, brand, location, avgUsagePerDay } = req.body;
    const device = await Device.create({
      userId: req.user.id,
      name, type, brand, location, avgUsagePerDay
    });
    res.status(201).json({ success: true, device });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Update a device
// @route  PUT /api/devices/:id
// @access Private
const updateDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

    const updated = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, device: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   Delete a device
// @route  DELETE /api/devices/:id
// @access Private
const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOne({ _id: req.params.id, userId: req.user.id });
    if (!device) return res.status(404).json({ success: false, message: 'Device not found' });

    await device.deleteOne();
    res.json({ success: true, message: 'Device removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDevices, addDevice, updateDevice, deleteDevice };
