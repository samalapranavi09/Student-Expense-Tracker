require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testReg() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('connected to mongodb');
  
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('testpass', salt);
    
    const newUser = await User.create({
      name: 'Test',
      email: 'test' + Date.now() + '@test.com',
      password_hash: passwordHash
    });
    console.log('user created', newUser.id);
  } catch(e) {
    console.error('creation error', e);
  }
  process.exit();
}
testReg();
