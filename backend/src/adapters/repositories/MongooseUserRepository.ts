import { IUserRepository } from '../../use-cases/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { UserModel } from '../../infrastructure/database/models/User';

export class MongooseUserRepository implements IUserRepository {
  async findByUsername(username: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ username });
    if (!userDoc) return null;
    return this.toEntity(userDoc);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userDoc = await UserModel.findOne({ email });
    if (!userDoc) return null;
    return this.toEntity(userDoc);
  }

  async findById(id: string): Promise<User | null> {
    const userDoc = await UserModel.findById(id);
    if (!userDoc) return null;
    return this.toEntity(userDoc);
  }

  async create(user: User): Promise<User> {
    const userDoc = new UserModel({
      username: user.username,
      email: user.email,
      password: user.password,
      wins: user.wins || 0,
      losses: user.losses || 0,
      draws: user.draws || 0,
      gamesPlayed: user.gamesPlayed || 0,
      eloRating: user.eloRating || 1200,
      winStreak: user.winStreak || 0,
      maxWinStreak: user.maxWinStreak || 0,
    });
    const savedDoc = await userDoc.save();
    return this.toEntity(savedDoc);
  }

  async findAll(): Promise<User[]> {
    const userDocs = await UserModel.find({});
    return userDocs.map((doc) => this.toEntity(doc));
  }

  private toEntity(doc: any): User {
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      password: doc.password,
      wins: doc.wins,
      losses: doc.losses,
      draws: doc.draws,
      gamesPlayed: doc.gamesPlayed,
      eloRating: doc.eloRating,
      winStreak: doc.winStreak,
      maxWinStreak: doc.maxWinStreak,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}
