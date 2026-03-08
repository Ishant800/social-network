const mongoose = require('mongoose');

async function connectDb() {
  try {
    console.log("Connecting to MongoDB...");
    console.log("URI:", process.env.CNS);

    await mongoose.connect(process.env.CNS);
    console.log('mongoose connected sucessfully');
  } catch (error) {
    console.error('mongoose connection failed: ',error.message);
    process.exit(1);
  }
}

module.exports = connectDb;
