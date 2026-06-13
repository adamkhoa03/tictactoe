"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must be at most 20 characters long')
        .trim(),
    email: zod_1.z.string()
        .email('Invalid email address')
        .trim()
        .toLowerCase(),
    password: zod_1.z.string()
        .min(6, 'Password must be at least 6 characters long'),
});
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1, 'Username or Email is required').trim(),
    password: zod_1.z.string().min(1, 'Password is required'),
});
