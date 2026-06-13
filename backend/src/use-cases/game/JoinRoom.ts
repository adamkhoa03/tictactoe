import { Room, RoomPlayer } from '../../domain/entities/Room';
import { IRoomRepository } from '../repositories/IRoomRepository';
import { JoinRoomInput } from '../../schemas/room.schema';

interface JoinRoomParams {
  userId: string;
  username: string;
  roomId: JoinRoomInput['roomId'];
}

export class JoinRoom {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(params: JoinRoomParams): Promise<Room> {
    const { roomId, userId, username } = params;

    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new Error('Phòng không tồn tại.');
    }

    // Kiểm tra người chơi đã ở trong phòng chưa (do ghép nhanh hoặc reload)
    const alreadyJoined = room.players.some((p) => p.userId === userId);
    if (alreadyJoined) {
      return room;
    }

    if (room.status !== 'waiting') {
      throw new Error('Phòng đã bắt đầu chơi hoặc đã kết thúc.');
    }

    if (room.players.length >= 2) {
      throw new Error('Phòng đã đủ người chơi.');
    }

    const joiner: RoomPlayer = {
      userId,
      username,
      symbol: 'O', // Người vào sau là quân O
    };

    room.players.push(joiner);

    return this.roomRepository.save(room);
  }
}
