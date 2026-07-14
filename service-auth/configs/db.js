import mongoose from 'mongoose';

export const dbConnection = async () => {
  try {
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('connecting', () => {
      console.log('MongoDB: Connecting...');
    });

    mongoose.connection.on('connected', () => {
      console.log('MongoDB: Connected successfully.');
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB: Disconnected.');
    });

    const mongoUri = process.env.URI_MONGODB;
    if (!mongoUri) {
      throw new Error('URI_MONGODB is not defined in environment variables');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
