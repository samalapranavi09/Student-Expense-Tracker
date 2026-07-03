const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('../models/Category');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student_finance_db';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB database successfully.');

    // Seed default categories if they don't exist
    const defaultCategories = ['Food', 'Transport', 'Entertainment', 'Books & Academics', 'Rent & Utilities', 'Groceries', 'Others'];
    
    for (const catName of defaultCategories) {
      const exists = await Category.findOne({ name: catName, user_id: null });
      if (!exists) {
        await Category.create({ name: catName, user_id: null });
      }
    }
    console.log('🌱 Default categories verified/seeded successfully.');
    
  } catch (err) {
    console.error('❌ Database connection failed. Details:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
