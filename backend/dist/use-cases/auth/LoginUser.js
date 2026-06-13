"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUser = void 0;
const PasswordHasher_1 = require("../../shared/PasswordHasher");
const TokenManager_1 = require("../../shared/TokenManager");
class LoginUser {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(input) {
        // Find user by username or email
        let user = null;
        if (input.identifier.includes('@')) {
            user = await this.userRepository.findByEmail(input.identifier);
        }
        else {
            user = await this.userRepository.findByUsername(input.identifier);
        }
        if (!user || !user.password) {
            throw new Error('Invalid username/email or password');
        }
        // Check password
        const isPasswordValid = await PasswordHasher_1.PasswordHasher.compare(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid username/email or password');
        }
        // Generate token
        const token = TokenManager_1.TokenManager.generateToken({
            userId: user.id,
            username: user.username,
        });
        // Strip password
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };
    }
}
exports.LoginUser = LoginUser;
