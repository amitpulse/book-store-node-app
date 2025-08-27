import mongoose from 'mongoose';

const connectDB = async () => {
  try {
const mongoURI = process.env.MONGODB_URI;
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      // bufferMaxEntries: 0,
      
      ...(process.env.NODE_ENV === 'production' && {
        ssl: true,
        sslValidate: true,
        retryWrites: true,
        w: 'majority'
      })
    };

    const conn = await mongoose.connect(mongoURI, options);
    
    console.log(`MongoDB atlas connected.`);
    // console.log(`TEST: Database: ${conn.connection.name}`);
    
    mongoose.connection.on('error', (error) => {
      console.error('WARNING: MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('WARNING: MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    return conn;
    
  } catch (error) {
    console.error('WARNING: Database connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;