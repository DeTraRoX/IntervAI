const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intervai');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // We don't exit the process immediately so developers can boot the server even without running mongo
    console.log('Ensure MongoDB is running or configure MONGODB_URI in your .env file.');
  }
};

module.exports = connectDB;
