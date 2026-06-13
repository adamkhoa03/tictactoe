import { Router } from 'express';
import { AuthController } from '../../../adapters/controllers/AuthController';
import { RegisterUser } from '../../../use-cases/auth/RegisterUser';
import { LoginUser } from '../../../use-cases/auth/LoginUser';
import { MongooseUserRepository } from '../../../adapters/repositories/MongooseUserRepository';

const authRouter = Router();

// Instantiate dependencies
const userRepository = new MongooseUserRepository();
const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository);
const authController = new AuthController(registerUser, loginUser);

// Bind controller endpoints
authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);

export default authRouter;
