const express = require('express');
const router = express.Router();
const { body, param, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const { checkBudgetAndAlert } = require('../services/alertService');

// @route   GET /api/expenses
// @desc    Get all expenses for the authenticated student
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ user_id: req.user.id })
      .populate('category_id', 'name')
      .sort({ date: -1, _id: -1 });
    
    // Transform output to match expected frontend structure: { ..., category_name: 'Food' }
    const formattedExpenses = expenses.map(e => {
      const exp = e.toJSON();
      exp.category_name = e.category_id ? e.category_id.name : 'Unknown';
      exp.category_id = e.category_id ? e.category_id._id.toString() : null;
      return exp;
    });

    res.json(formattedExpenses);
  } catch (err) {
    console.error('Error fetching expenses:', err.message);
    res.status(500).json({ message: 'Server error while fetching expenses.' });
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense record
// @access  Private
router.post(
  '/',
  [
    auth,
    body('amount', 'Amount is required and must be a positive number').isFloat({ gt: 0 }),
    body('date', 'Date must be a valid YYYY-MM-DD date').isDate(),
    body('category_id', 'Category ID is required').isMongoId(),
    body('description', 'Description cannot exceed 255 characters').optional({ checkFalsy: true }).isLength({ max: 255 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, date, category_id, description } = req.body;

    try {
      // 1. Ensure category is valid and accessible by user (default or custom)
      const category = await Category.findOne({
        _id: category_id,
        $or: [{ user_id: null }, { user_id: req.user.id }]
      });

      if (!category) {
        return res.status(400).json({ message: 'Invalid category selection.' });
      }

      // 2. Insert expense
      const newExpense = await Expense.create({
        user_id: req.user.id,
        category_id,
        amount,
        date,
        description: description || null
      });

      // 3. Trigger Alert Check in the background
      checkBudgetAndAlert(req.user.id, category_id, date);

      res.status(201).json({
        message: 'Expense added successfully!',
        expense: newExpense
      });
    } catch (err) {
      console.error('Error creating expense:', err.message);
      res.status(500).json({ message: 'Server error while adding expense.' });
    }
  }
);

// @route   PUT /api/expenses/:id
// @desc    Update an existing expense record
// @access  Private
router.put(
  '/:id',
  [
    auth,
    param('id', 'Invalid expense ID').isMongoId(),
    body('amount', 'Amount must be a positive number').isFloat({ gt: 0 }),
    body('date', 'Date must be a valid YYYY-MM-DD date').isDate(),
    body('category_id', 'Category ID is required').isMongoId(),
    body('description', 'Description cannot exceed 255 characters').optional({ checkFalsy: true }).isLength({ max: 255 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { amount, date, category_id, description } = req.body;

    try {
      // 1. Ensure expense exists and belongs to the authenticated user
      const expense = await Expense.findOne({ _id: id, user_id: req.user.id });
      if (!expense) {
        return res.status(404).json({ message: 'Expense not found or unauthorized.' });
      }

      // 2. Ensure target category is valid and accessible
      const category = await Category.findOne({
        _id: category_id,
        $or: [{ user_id: null }, { user_id: req.user.id }]
      });

      if (!category) {
        return res.status(400).json({ message: 'Invalid category selection.' });
      }

      const previousCategoryId = expense.category_id.toString();
      const previousDate = expense.date;

      // 3. Update expense
      expense.amount = amount;
      expense.date = date;
      expense.category_id = category_id;
      expense.description = description || null;
      await expense.save();

      // 4. Trigger Alert checks
      checkBudgetAndAlert(req.user.id, category_id, date);
      if (previousCategoryId !== category_id || previousDate !== date) {
        checkBudgetAndAlert(req.user.id, previousCategoryId, previousDate);
      }

      res.json({
        message: 'Expense updated successfully!',
        expense
      });
    } catch (err) {
      console.error('Error updating expense:', err.message);
      res.status(500).json({ message: 'Server error while updating expense.' });
    }
  }
);

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense record
// @access  Private
router.delete('/:id', [
  auth,
  param('id', 'Invalid expense ID').isMongoId()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { id } = req.params;

  try {
    const expense = await Expense.findOneAndDelete({ _id: id, user_id: req.user.id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found or unauthorized.' });
    }

    checkBudgetAndAlert(req.user.id, expense.category_id, expense.date);

    res.json({ message: 'Expense deleted successfully!' });
  } catch (err) {
    console.error('Error deleting expense:', err.message);
    res.status(500).json({ message: 'Server error while deleting expense.' });
  }
});

module.exports = router;
