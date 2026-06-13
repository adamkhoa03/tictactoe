"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_schema_1 = require("../../schemas/auth.schema");
const zod_1 = require("zod");
class AuthController {
    registerUser;
    loginUser;
    constructor(registerUser, loginUser) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
    }
    register = async (req, res) => {
        try {
            // Validate request body
            const parsedBody = auth_schema_1.registerSchema.parse(req.body);
            const result = await this.registerUser.execute(parsedBody);
            res.status(201).json({
                success: true,
                data: result,
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
            res.status(200).json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    };
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
