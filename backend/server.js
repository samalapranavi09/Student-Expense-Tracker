const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and parsing of request bodies
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// Main Root endpoint for health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'Student Expense Tracker & AI Financial Advisor API',
    institution: 'Vardhaman College of Engineering',
    department: 'Computer Science & Engineering',
    author: 'CSE Summer Project Team'
  });
});

// Import API routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budgets');
const categoryRoutes = require('./routes/categories');
const alertRoutes = require('./routes/alerts');
const advisorRoutes = require('./routes/advisor');
const goalsRoutes = require('./routes/goals');

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/goals', goalsRoutes);

// Global Error Handler middleware for unhandled exceptions
app.use((err, req, res, next) => {
  console.error('Unhandled Exception caught:', err.stack);
  res.status(500).json({
    message: 'Something went wrong inside the server! Please contact support or retry.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const connectDB = require('./config/db');

// Start Express Server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server spinning up on http://localhost:${PORT}`);
  console.log(`📡 Health Check URL: http://localhost:${PORT}/`);
  console.log('📌 API endpoints mounted under:');
  console.log('  - Auth API:       /api/auth');
  console.log('  - Expense CRUD:   /api/expenses');
  console.log('  - Budget Limits:  /api/budgets');
  console.log('  - Categories:     /api/categories');
  console.log('  - Alerts:         /api/alerts');
  console.log('  - AI Advisor:     /api/advisor');
});
