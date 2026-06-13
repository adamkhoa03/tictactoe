import { Room } from '../../domain/entities/Room';

export interface IRoomRepository {
  findById(id: string): Promise<Room | null>;
  findAvailableRoom(boardSize?: number): Promise<Room | null>;
  findAllWaitingRooms(): Promise<Room[]>;
  save(room: Room): Promise<Room>;
  delete(id: string): Promise<boolean>;
}
