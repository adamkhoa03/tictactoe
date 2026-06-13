import { User } from '../../domain/entities/User';

export interface IUserRepository {
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}
