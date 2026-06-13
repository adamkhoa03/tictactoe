import mongoose from 'mongoose';

let mongoMemoryServer: any = null;

export const connectDB = async (): Promise<void> => {
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

  try {
    // Thử kết nối tới MongoDB chính với thời gian chờ ngắn (3 giây)
    console.log(`Connecting to MongoDB at: ${mongoUri}...`);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
  } catch (error: any) {
    console.warn(`⚠️ Failed to connect to primary MongoDB at ${mongoUri}: ${error.message}`);

    // Trong môi trường production, không dùng in-memory fallback
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Database connection failed in production. Exiting...');
      process.exit(1);
    }

    try {
      console.log('🚀 Local MongoDB is not running. Starting in-memory MongoDB server for development...');
      
      // Sử dụng require động để tránh load trong production build nếu không cài devDependencies
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();

      console.log(`📡 In-memory MongoDB server started at: ${memoryUri}`);

      // Kết nối tới database in-memory
      await mongoose.connect(memoryUri);
    } catch (fallbackError: any) {
      console.error('❌ Failed to start and connect to in-memory MongoDB:', fallbackError);
      process.exit(1);
    }
  }
};

// Đăng ký dọn dẹp tài nguyên khi dừng process
const cleanup = async () => {
  if (mongoMemoryServer) {
    console.log('Stopping in-memory MongoDB server...');
    await mongoMemoryServer.stop();
  }
  await mongoose.disconnect();
};

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await cleanup();
  process.exit(0);
});

