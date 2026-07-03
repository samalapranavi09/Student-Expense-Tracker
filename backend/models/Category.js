const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, {
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      // Ensure user_id is a string or null
      if (ret.user_id) ret.user_id = ret.user_id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

// Create compound unique index for user_id and name
CategorySchema.index({ user_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema);
