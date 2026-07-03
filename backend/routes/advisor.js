const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { generateSavingTips, generateFinancialScore, handleChatbotQuery } = require('../services/advisorService');

// @route   GET /api/advisor/tips
// @desc    Get rule-based custom AI saving tips and spending insights
// @access  Private
router.get('/tips', auth, async (req, res) => {
  try {
    const advisorData = await generateSavingTips(req.user.id);
    res.json(advisorData);
  } catch (err) {
    console.error('Advisor Route Error:', err.message);
    res.status(500).json({ message: 'Server error while generating saving recommendations.' });
  }
});

// @route   GET /api/advisor/score
// @desc    Get Financial Health Score
// @access  Private
router.get('/score', auth, async (req, res) => {
  try {
    const scoreData = await generateFinancialScore(req.user.id);
    res.json(scoreData);
  } catch (err) {
    console.error('Advisor Score Error:', err.message);
    res.status(500).json({ message: 'Server error while calculating score.' });
  }
});

// @route   POST /api/advisor/chat
// @desc    Handle Chatbot Query
// @access  Private
router.post('/chat', auth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'Query is required.' });
    }
    const response = await handleChatbotQuery(req.user.id, query);
    res.json(response);
  } catch (err) {
    console.error('Advisor Chat Error:', err.message);
    res.status(500).json({ message: 'Server error while processing chat query.' });
  }
});

module.exports = router;
