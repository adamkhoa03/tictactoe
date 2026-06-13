import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tictactoe';
    
    // Đăng ký các sự kiện kết nối
    mongoose.connection.on('connected', () => {
      console.log('🔌 Connected to MongoDB successfully.');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected.');
    });

    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};
