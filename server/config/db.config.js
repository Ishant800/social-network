const mongoose = require('mongoose');

function getMongoUri() {
  return (
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    process.env.CNS ||
    ''
  );
}

async function connectDb() {
  const uri = getMongoUri();
  try {
    console.log('Connecting to MongoDB...');
    if (!uri || typeof uri !== 'string') {
      throw new Error(
        'Missing MongoDB URI. Set MONGODB_URI (or MONGO_URI, or legacy CNS) in server/.env or the project root .env',
      );
    }

    await mongoose.connect(uri);
    console.log('mongoose connected sucessfully');
  } catch (error) {
    console.error('mongoose connection failed: ', error.message);
    process.exit(1);
  }
}

module.exports = connectDb;
