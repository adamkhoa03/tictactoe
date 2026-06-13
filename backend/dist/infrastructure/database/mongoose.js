"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tictactoe';
        // Đăng ký các sự kiện kết nối
        mongoose_1.default.connection.on('connected', () => {
            console.log('🔌 Connected to MongoDB successfully.');
        });
        mongoose_1.default.connection.on('error', (err) => {
            console.error(`❌ MongoDB connection error: ${err}`);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected.');
        });
        await mongoose_1.default.connect(mongoUri);
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
