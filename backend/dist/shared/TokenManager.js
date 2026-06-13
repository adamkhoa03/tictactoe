"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenManager = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenManager {
    static JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-123456';
    static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN });
    }
    static verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
    }
}
exports.TokenManager = TokenManager;
