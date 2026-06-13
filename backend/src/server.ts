import http from 'http';
import app from './app';
import { connectDB } from './infrastructure/database/mongoose';
import { initSocketServer } from './infrastructure/socket-server';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Khởi tạo Socket.io Server
initSocketServer(server);

const startServer = async () => {
  // Kết nối Database
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
  });
};

startServer();

