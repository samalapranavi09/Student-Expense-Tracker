const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Alert = require('../models/Alert');

// @route   GET /api/alerts
// @desc    Get all alerts for the authenticated student
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const alerts = await Alert.find({ user_id: req.user.id }).sort({ created_at: -1 });
    res.json(alerts);
  } catch (err) {
    console.error('Error fetching alerts:', err.message);
    res.status(500).json({ message: 'Server error while fetching alerts.' });
  }
});

// @route   PUT /api/alerts/:id/read
// @desc    Mark an alert as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: id, user_id: req.user.id },
      { is_read: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found or unauthorized.' });
    }

    res.json({ message: 'Alert marked as read successfully.' });
  } catch (err) {
    console.error('Error updating alert:', err.message);
    res.status(500).json({ message: 'Server error while marking alert as read.' });
  }
});

// @route   PUT /api/alerts/read-all
// @desc    Mark all alerts of the student as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    await Alert.updateMany(
      { user_id: req.user.id },
      { is_read: true }
    );
    res.json({ message: 'All alerts marked as read successfully.' });
  } catch (err) {
    console.error('Error marking all alerts read:', err.message);
    res.status(500).json({ message: 'Server error while marking all alerts read.' });
  }
});

module.exports = router;
