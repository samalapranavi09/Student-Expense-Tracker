const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true }, // Keeping as String YYYY-MM-DD for simpler frontend compatibility
  description: { type: String, default: null }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.user_id = ret.user_id.toString();
      ret.category_id = ret.category_id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
