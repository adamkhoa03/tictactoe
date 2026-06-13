"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../../../adapters/controllers/AuthController");
const RegisterUser_1 = require("../../../use-cases/auth/RegisterUser");
const LoginUser_1 = require("../../../use-cases/auth/LoginUser");
const MongooseUserRepository_1 = require("../../../adapters/repositories/MongooseUserRepository");
const authRouter = (0, express_1.Router)();
// Instantiate dependencies
const userRepository = new MongooseUserRepository_1.MongooseUserRepository();
const registerUser = new RegisterUser_1.RegisterUser(userRepository);
const loginUser = new LoginUser_1.LoginUser(userRepository);
const authController = new AuthController_1.AuthController(registerUser, loginUser);
// Bind controller endpoints
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
exports.default = authRouter;
