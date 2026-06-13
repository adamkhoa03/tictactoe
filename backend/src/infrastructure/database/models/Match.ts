import mongoose, { Schema, Document } from 'mongoose';

export interface IMatchDocument extends Document {
  player1: string; // userId
  player2: string; // userId
  player1Username: string;
  player2Username: string;
  winnerId: string; // userId or 'draw'
  reason: 'normal' | 'surrender' | 'timeout';
  boardSize: number;
  winCondition: number;
  eloChange1: number;
  eloChange2: number;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema = new Schema(
  {
    player1: {
      type: String,
      required: true,
    },
    player2: {
      type: String,
      required: true,
    },
    player1Username: {
      type: String,
      required: true,
    },
    player2Username: {
      type: String,
      required: true,
    },
    winnerId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      enum: ['normal', 'surrender', 'timeout'],
      default: 'normal',
    },
    boardSize: {
      type: Number,
      required: true,
    },
    winCondition: {
      type: Number,
      required: true,
    },
    eloChange1: {
      type: Number,
      default: 0,
    },
    eloChange2: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

MatchSchema.set('toJSON', {
  transform: (_doc, ret: Record<string, any>) => {
    if (ret._id) {
      ret.id = ret._id.toString();
    }
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const MatchModel = mongoose.model<IMatchDocument>('Match', MatchSchema);
