const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const { checkBudgetAndAlert } = require('../services/alertService');

// @route   GET /api/budgets
// @desc    Get all monthly budgets set by the student
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user_id: req.user.id })
      .populate('category_id', 'name')
      .sort({ year: -1, month: -1 });

    const formattedBudgets = budgets.map(b => {
      const budget = b.toJSON();
      budget.category_name = b.category_id ? b.category_id.name : 'Unknown';
      budget.category_id = b.category_id ? b.category_id._id.toString() : null;
      return budget;
    });

    // Also sort by category name ascending
    formattedBudgets.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      if (a.month !== b.month) return b.month - a.month;
      return a.category_name.localeCompare(b.category_name);
    });

    res.json(formattedBudgets);
  } catch (err) {
    console.error('Error fetching budgets:', err.message);
    res.status(500).json({ message: 'Server error while fetching budgets.' });
  }
});

// @route   POST /api/budgets
// @desc    Create or Update a monthly category budget (Upsert)
// @access  Private
router.post(
  '/',
  [
    auth,
    body('category_id', 'Category ID is required').isMongoId(),
    body('month', 'Month must be between 1 and 12').isInt({ min: 1, max: 12 }),
    body('year', 'Year must be a valid 4-digit integer').isInt({ min: 2000, max: 2100 }),
    body('limit_amount', 'Budget limit must be a positive number').isFloat({ gt: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category_id, month, year, limit_amount } = req.body;

    try {
      // 1. Ensure category is valid and accessible by the user
      const category = await Category.findOne({
        _id: category_id,
        $or: [{ user_id: null }, { user_id: req.user.id }]
      });

      if (!category) {
        return res.status(400).json({ message: 'Invalid category selection.' });
      }

      // 2. Perform an Upsert operation
      const budget = await Budget.findOneAndUpdate(
        { user_id: req.user.id, category_id, month, year },
        { limit_amount },
        { new: true, upsert: true }
      );

      // 3. Trigger alert check for that category in case they just reduced budget below their spend
      const testDateString = `${year}-${String(month).padStart(2, '0')}-01`;
      checkBudgetAndAlert(req.user.id, category_id, testDateString);

      res.status(201).json({
        message: 'Monthly budget configured successfully!',
        budget
      });

    } catch (err) {
      console.error('Error setting budget:', err.message);
      res.status(500).json({ message: 'Server error while setting budget.' });
    }
  }
);

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget limit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Budget.findOneAndDelete({ _id: id, user_id: req.user.id });
    
    if (!result) {
      return res.status(404).json({ message: 'Budget target not found or unauthorized.' });
    }

    res.json({ message: 'Budget limit removed successfully.' });
  } catch (err) {
    console.error('Error deleting budget:', err.message);
    res.status(500).json({ message: 'Server error while removing budget.' });
  }
});

module.exports = router;
