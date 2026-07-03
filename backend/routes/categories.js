const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const Category = require('../models/Category');

// @route   GET /api/categories
// @desc    Get all default categories and user-specific custom categories
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ user_id: null }, { user_id: req.user.id }]
    }).sort({ user_id: 1, name: 1 });
    
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ message: 'Server error while fetching categories.' });
  }
});

// @route   POST /api/categories
// @desc    Add a custom category
// @access  Private
router.post(
  '/',
  [
    auth,
    body('name', 'Category name is required').notEmpty().trim().isLength({ max: 50 })
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;

    try {
      // 1. Check if category already exists (either as default or user-custom)
      const existing = await Category.findOne({
        $or: [{ user_id: null }, { user_id: req.user.id }],
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });

      if (existing) {
        return res.status(400).json({ message: 'This category already exists.' });
      }

      // 2. Insert custom category
      const newCategory = await Category.create({
        name,
        user_id: req.user.id
      });

      res.status(201).json({
        message: 'Custom category created!',
        category: newCategory
      });
    } catch (err) {
      console.error('Error creating custom category:', err.message);
      res.status(500).json({ message: 'Server error while creating category.' });
    }
  }
);

module.exports = router;
