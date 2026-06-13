"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const TokenManager_1 = require("../../../shared/TokenManager");
const i18n_1 = require("../../../shared/i18n");
const authMiddleware = (req, res, next) => {
    let token = req.cookies?.token;
    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }
    if (!token) {
        res.status(401).json({ success: false, message: (0, i18n_1.t)(req, 'Authorization token required') });
        return;
    }
    try {
        const decoded = TokenManager_1.TokenManager.verifyToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ success: false, message: (0, i18n_1.t)(req, 'Invalid or expired token') });
    }
};
exports.authMiddleware = authMiddleware;
