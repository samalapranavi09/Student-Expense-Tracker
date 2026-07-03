const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const SavingsGoal = require('../models/SavingsGoal');

// GET all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ user_id: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error('Error fetching goals:', err.message);
    res.status(500).json({ message: 'Server error while fetching savings goals.' });
  }
});

// POST a new goal
router.post(
  '/',
  [
    auth,
    body('name', 'Goal name is required').not().isEmpty(),
    body('target_amount', 'Valid target amount is required').isFloat({ gt: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, target_amount, deadline } = req.body;

    try {
      const newGoal = new SavingsGoal({
        user_id: req.user.id,
        name: name.trim(),
        target_amount: parseFloat(target_amount),
        deadline: deadline || null
      });

      const savedGoal = await newGoal.save();
      res.status(201).json(savedGoal);
    } catch (err) {
      console.error('Error creating goal:', err.message);
      res.status(500).json({ message: 'Server error while creating savings goal.' });
    }
  }
);

// PUT add funds to goal
router.put(
  '/:id/add-funds',
  [
    auth,
    body('amount', 'Valid amount is required').isFloat({ gt: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const goal = await SavingsGoal.findOne({ _id: req.params.id, user_id: req.user.id });
      if (!goal) {
        return res.status(404).json({ message: 'Goal not found' });
      }

      goal.current_amount += parseFloat(req.body.amount);
      if (goal.current_amount > goal.target_amount) {
        goal.current_amount = goal.target_amount;
      }

      await goal.save();
      res.json(goal);
    } catch (err) {
      console.error('Error adding funds to goal:', err.message);
      res.status(500).json({ message: 'Server error while adding funds.' });
    }
  }
);

// DELETE goal
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Savings goal removed' });
  } catch (err) {
    console.error('Error deleting goal:', err.message);
    res.status(500).json({ message: 'Server error while deleting goal.' });
  }
});

module.exports = router;
