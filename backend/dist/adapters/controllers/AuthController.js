"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_schema_1 = require("../../schemas/auth.schema");
const zod_1 = require("zod");
class AuthController {
    registerUser;
    loginUser;
    userRepository;
    constructor(registerUser, loginUser, userRepository) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
        this.userRepository = userRepository;
    }
    register = async (req, res) => {
        try {
            // Validate request body
            const parsedBody = auth_schema_1.registerSchema.parse(req.body);
            const result = await this.registerUser.execute(parsedBody);
            const { token, user } = result;
            this.setCookie(res, token);
            res.status(201).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    };
    login = async (req, res) => {
        try {
            // Validate request body
            const parsedBody = auth_schema_1.loginSchema.parse(req.body);
            const result = await this.loginUser.execute(parsedBody);
            const { token, user } = result;
            this.setCookie(res, token);
            res.status(200).json({
                success: true,
                data: { user },
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    };
    logout = async (_req, res) => {
        try {
            this.clearCookie(res);
            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    };
    me = async (req, res) => {
        try {
            if (!req.user || !req.user.userId) {
                res.status(401).json({
                    success: false,
                    message: 'Not authenticated',
                });
                return;
            }
            const user = await this.userRepository.findById(req.user.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
                return;
            }
            // Strip password
            const { password, ...userWithoutPassword } = user;
            res.status(200).json({
                success: true,
                data: { user: userWithoutPassword },
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    };
    setCookie(res, token) {
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        });
    }
    clearCookie(res) {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });
    }
    handleError(res, error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            });
            return;
        }
        const message = error.message || 'Internal server error';
        let statusCode = 400;
        if (message.includes('already taken') || message.includes('already registered')) {
            statusCode = 409;
        }
        else if (message.includes('Invalid username/email or password')) {
            statusCode = 401;
        }
        res.status(statusCode).json({
            success: false,
            message,
        });
    }
}
exports.AuthController = AuthController;
