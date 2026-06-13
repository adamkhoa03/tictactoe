import { IUserRepository } from '../repositories/IUserRepository';
import { RegisterInput } from '../../schemas/auth.schema';
import { PasswordHasher } from '../../shared/PasswordHasher';
import { TokenManager } from '../../shared/TokenManager';
import { User } from '../../domain/entities/User';

export class RegisterUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<{ user: Omit<User, 'password'>; token: string }> {
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
    const hashedPassword = await PasswordHasher.hash(input.password);

    // Save user
    const newUser: User = {
      username: input.username,
      email: input.email,
      password: hashedPassword,
    };

    const savedUser = await this.userRepository.create(newUser);

    // Generate token
    const token = TokenManager.generateToken({
      userId: savedUser.id!,
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
