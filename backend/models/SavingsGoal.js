const mongoose = require('mongoose');

const SavingsGoalSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  target_amount: { type: Number, required: true },
  current_amount: { type: Number, default: 0 },
  deadline: { type: Date }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      ret.user_id = ret.user_id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('SavingsGoal', SavingsGoalSchema);
