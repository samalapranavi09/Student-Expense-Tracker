const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Register a new student user
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Name is required').notEmpty().trim(),
    body('email', 'Please provide a valid email address').isEmail().normalizeEmail(),
    body('password', 'Password must be at least 6 characters long').isLength({ min: 6 })
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // 1. Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'A student account with this email already exists.' });
      }

      // 2. Hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 3. Insert user into Database
      const newUser = await User.create({
        name,
        email,
        password_hash: passwordHash
      });

      const userId = newUser.id;

      // 4. Generate JWT
      const payload = { id: userId, email: email };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'vardhaman_cse_advisor_secret_key_2026', {
        expiresIn: '24h'
      });

      res.status(201).json({
        message: 'Student registration successful!',
        token,
        user: { id: userId, name, email }
      });
    } catch (err) {
      console.error('Registration Error:', err.message);
      res.status(500).json({ message: 'Server error during registration. Please try again.' });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Please provide a valid email address').isEmail().normalizeEmail(),
    body('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // 1. Fetch user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials. User does not exist.' });
      }

      // 2. Verify password hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials. Password matches fail.' });
      }

      // 3. Generate JWT
      const payload = { id: user.id, email: user.email };
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'vardhaman_cse_advisor_secret_key_2026', {
        expiresIn: '24h'
      });

      res.json({
        message: 'Login successful!',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (err) {
      console.error('Login Error:', err.message);
      res.status(500).json({ message: 'Server error during login. Please try again.' });
    }
  }
);

module.exports = router;
