"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const mongoose_1 = require("./infrastructure/database/mongoose");
const socket_server_1 = require("./infrastructure/socket-server");
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
// Khởi tạo Socket.io Server
(0, socket_server_1.initSocketServer)(server);
const startServer = async () => {
    // Kết nối Database
    await (0, mongoose_1.connectDB)();
    server.listen(PORT, () => {
        console.log(`🚀 Server is listening on port ${PORT}`);
    });
};
startServer();
