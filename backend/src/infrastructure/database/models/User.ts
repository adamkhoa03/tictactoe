import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../../../domain/entities/User';

export interface IUserDocument extends Omit<User, 'id'>, Document {
  username: string;
  email: string;
  password?: string;
  wins: number;
  losses: number;
  draws: number;
  gamesPlayed: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'is invalid'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    draws: {
      type: Number,
      default: 0,
    },
    gamesPlayed: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Tùy biến hàm toJSON để trả về dữ liệu an toàn cho client
UserSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    delete ret.password; // Bảo mật: Không trả về mật khẩu
    return ret;
  },
});

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
