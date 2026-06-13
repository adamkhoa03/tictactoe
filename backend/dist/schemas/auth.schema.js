"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3)
        .max(20)
        .trim(),
    email: zod_1.z.string()
        .email()
        .trim()
        .toLowerCase(),
    password: zod_1.z.string()
        .min(6),
});
exports.loginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1).trim(),
    password: zod_1.z.string().min(1),
});
