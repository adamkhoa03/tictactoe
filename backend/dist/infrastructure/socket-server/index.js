"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
exports.getSocketServer = getSocketServer;
const socket_io_1 = require("socket.io");
const socket_1 = require("../../adapters/socket");
const TokenManager_1 = require("../../shared/TokenManager");
let io = null;
function initSocketServer(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST'],
        },
    });
    // Socket.io authentication middleware
    io.use((socket, next) => {
        let token = socket.handshake.auth?.token;
        // If token not provided in handshake auth, check cookies
        if (!token) {
            const cookieHeader = socket.handshake.headers.cookie;
            if (cookieHeader) {
                const cookies = parseCookies(cookieHeader);
                token = cookies['token'];
            }
        }
        // In TicTacToe, players must be authenticated to join rooms and play.
        if (!token) {
            return next(new Error('Authentication error: Token required'));
        }
        try {
            const decoded = TokenManager_1.TokenManager.verifyToken(token);
            socket.data = {
                ...socket.data,
                user: decoded,
            };
            next();
        }
        catch (err) {
            return next(new Error('Authentication error: Invalid or expired token'));
        }
    });
    // Register socket event handlers
    (0, socket_1.registerSocketHandlers)(io);
    return io;
}
function getSocketServer() {
    if (!io) {
        throw new Error('Socket.io server has not been initialized');
    }
    return io;
}
function parseCookies(cookieString) {
    const list = {};
    cookieString.split(';').forEach((cookie) => {
        const parts = cookie.split('=');
        const name = parts[0].trim();
        if (name) {
            list[name] = decodeURIComponent((parts[1] || '').trim());
        }
    });
    return list;
}
