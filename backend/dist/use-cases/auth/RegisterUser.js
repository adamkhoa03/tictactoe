"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUser = void 0;
const PasswordHasher_1 = require("../../shared/PasswordHasher");
const TokenManager_1 = require("../../shared/TokenManager");
class RegisterUser {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        // Check if username already exists
        const existingUsername = await this.userRepository.findByUsername(input.username);
        if (existingUsername) {
            throw new Error('Username is already taken');
        }
        // Check if email already exists
        const existingEmail = await this.userRepository.findByEmail(input.email);
        if (existingEmail) {
            throw new Error('Email is already registered');
        }
        // Hash password
        const hashedPassword = await PasswordHasher_1.PasswordHasher.hash(input.password);
        // Save user
        const newUser = {
            username: input.username,
            email: input.email,
            password: hashedPassword,
        };
        const savedUser = await this.userRepository.create(newUser);
        // Generate token
        const token = TokenManager_1.TokenManager.generateToken({
            userId: savedUser.id,
            username: savedUser.username,
        });
        // Strip password
        const { password, ...userWithoutPassword } = savedUser;
        return {
            user: userWithoutPassword,
            token,
        };
    }
}
exports.RegisterUser = RegisterUser;
