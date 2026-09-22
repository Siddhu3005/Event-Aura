const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventaura';
  const fallbackUri = 'mongodb://127.0.0.1:27017/eventaura';

  const connectOptions = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000
  };

  try {
    console.log(`Connecting to MongoDB at: ${primaryUri}...`);
    await mongoose.connect(primaryUri, connectOptions);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn(`Primary MongoDB connection failed (${error.message}). Trying fallback to local MongoDB...`);
    try {
      await mongoose.connect(fallbackUri, connectOptions);
      console.log('Connected successfully to fallback local MongoDB');
    } catch (fallbackError) {
      console.error('Database connection failed:', fallbackError.message);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
};

module.exports = connectDB;