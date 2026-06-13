"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const TokenManager_1 = require("../../../shared/TokenManager");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, message: 'Authorization token required' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = TokenManager_1.TokenManager.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
