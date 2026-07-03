const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing connection to MongoDB...');
console.log('URI:', process.env.MONGO_URI.replace(/:([^:@]{8})[^:@]*@/, ':<hidden>@')); // hide full password

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connection successful!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Connection failed!');
  console.error(err);
  process.exit(1);
});
