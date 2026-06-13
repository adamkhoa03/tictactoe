import { IUserRepository } from '../repositories/IUserRepository';
import { LoginInput } from '../../schemas/auth.schema';
import { PasswordHasher } from '../../shared/PasswordHasher';
import { TokenManager } from '../../shared/TokenManager';
import { User } from '../../domain/entities/User';

export class LoginUser {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<{ user: Omit<User, 'password'>; token: string }> {
    // Find user by username or email
    let user: User | null = null;
    if (input.identifier.includes('@')) {
      user = await this.userRepository.findByEmail(input.identifier);
    } else {
      user = await this.userRepository.findByUsername(input.identifier);
    }

    if (!user || !user.password) {
      throw new Error('Invalid username/email or password');
    }

    // Check password
    const isPasswordValid = await PasswordHasher.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid username/email or password');
    }

    // Generate token
    const token = TokenManager.generateToken({
      userId: user.id!,
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
