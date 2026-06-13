import { Room, RoomPlayer } from '../../domain/entities/Room';
import { IRoomRepository } from '../repositories/IRoomRepository';
import { CreateRoomInput } from '../../schemas/room.schema';

interface CreateRoomParams {
  userId: string;
  username: string;
  boardSize: CreateRoomInput['boardSize'];
  winCondition: CreateRoomInput['winCondition'];
}

export class CreateRoom {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(params: CreateRoomParams): Promise<Room> {
    const { userId, username, boardSize, winCondition } = params;

    // Tạo mã phòng ngẫu nhiên 6 ký tự chữ hoa
    const roomId = this.generateRoomId();

    const host: RoomPlayer = {
      userId,
      username,
      symbol: 'X', // Người tạo phòng mặc định là quân X
    };

    // Khởi tạo bàn cờ rỗng theo kích thước
    const board = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill('')
    );

    const now = new Date();
    const room: Room = {
      id: roomId,
      boardSize,
      winCondition,
      players: [host],
      status: 'waiting',
      board,
      currentTurn: userId, // Người X đi trước
      winnerId: null,
      createdAt: now,
      updatedAt: now,
    };

    return this.roomRepository.save(room);
  }

  private generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
