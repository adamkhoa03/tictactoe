"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./infrastructure/webserver/routes/auth.routes"));
const room_routes_1 = __importDefault(require("./infrastructure/webserver/routes/room.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
// API Health Check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', message: 'TicTacToe Backend is running' });
});
// REST Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/rooms', room_routes_1.default);
exports.default = app;
