"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const mongoose_1 = require("./infrastructure/database/mongoose");
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
// Khởi tạo Socket.io Server
const io = new socket_io_1.Server(server, {
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
    await (0, mongoose_1.connectDB)();
    server.listen(PORT, () => {
        console.log(`🚀 Server is listening on port ${PORT}`);
    });
};
startServer();
