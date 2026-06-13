import { Room } from '../../domain/entities/Room';
import { IRoomRepository } from '../../use-cases/repositories/IRoomRepository';

// Lưu trữ phòng chơi trong bộ nhớ RAM để đảm bảo hiệu suất real-time
const roomStore = new Map<string, Room>();

export class InMemoryRoomRepository implements IRoomRepository {
  async findById(id: string): Promise<Room | null> {
    return roomStore.get(id) ?? null;
  }

  async findAvailableRoom(boardSize?: number): Promise<Room | null> {
    for (const room of roomStore.values()) {
      if (room.status !== 'waiting') continue;
      if (room.players.length >= 2) continue;
      if (boardSize !== undefined && room.boardSize !== boardSize) continue;
      return room;
    }
    return null;
  }

  async findAllWaitingRooms(): Promise<Room[]> {
    return Array.from(roomStore.values()).filter(
      (room) => room.status === 'waiting' && room.players.length < 2
    );
  }

  async save(room: Room): Promise<Room> {
    room.updatedAt = new Date();
    roomStore.set(room.id, room);
    return room;
  }

  async delete(id: string): Promise<boolean> {
    return roomStore.delete(id);
  }
}
