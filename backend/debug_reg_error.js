const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const existing = await User.findOne({ email: 'test500@test.com' });
    console.log('existingUser check passed');
    
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    console.log('hash passed');
    
    const newUser = await User.create({
      name: 'Test',
      email: 'test500@test.com',
      password_hash: passwordHash
    });
    console.log('User created:', newUser.id);
  } catch (err) {
    console.error('Server error', err);
  }
  process.exit();
}
test();
