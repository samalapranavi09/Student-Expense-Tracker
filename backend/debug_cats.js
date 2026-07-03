const mongoose = require('mongoose');
const Category = require('./models/Category');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const cats = await Category.find({
    $or: [{ user_id: null }]
  });
  
  console.log("Categories found:", cats.length);
  console.log("Docs:", cats);
  process.exit();
}
test();
