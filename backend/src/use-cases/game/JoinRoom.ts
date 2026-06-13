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

    if (room.status !== 'waiting') {
      throw new Error('Phòng đã bắt đầu chơi hoặc đã kết thúc.');
    }

    if (room.players.length >= 2) {
      throw new Error('Phòng đã đủ người chơi.');
    }

    // Kiểm tra người chơi đã ở trong phòng chưa
    const alreadyJoined = room.players.some((p) => p.userId === userId);
    if (alreadyJoined) {
      throw new Error('Bạn đã ở trong phòng này rồi.');
    }

    const joiner: RoomPlayer = {
      userId,
      username,
      symbol: 'O', // Người vào sau là quân O
    };

    room.players.push(joiner);
    room.status = 'playing';

    // Chọn ngẫu nhiên người đi trước
    const firstPlayer = room.players[Math.floor(Math.random() * 2)];
    room.currentTurn = firstPlayer.userId;

    return this.roomRepository.save(room);
  }
}
