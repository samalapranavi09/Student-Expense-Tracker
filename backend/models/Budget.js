const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  limit_amount: { type: Number, required: true }
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

BudgetSchema.index({ user_id: 1, category_id: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
