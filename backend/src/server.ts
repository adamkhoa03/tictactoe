import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { connectDB } from './infrastructure/database/mongoose';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Khởi tạo Socket.io Server
const io = new Server(server, {
  cors: {
    origin: '*', // Trong môi trường production, hãy cấu hình cụ thể tên miền của Frontend
    methods: ['GET', 'POST'],
  },
});

// Lắng nghe kết nối socket
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Định tuyến các sự kiện socket thông qua handlers ở các lớp Use Cases / Adapters sau này.
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  // Kết nối Database
  await connectDB();

  server.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
  });
};

startServer();

