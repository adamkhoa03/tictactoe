import { Room } from '../../domain/entities/Room';
import { IRoomRepository } from '../repositories/IRoomRepository';

export class GetWaitingRooms {
  constructor(private roomRepository: IRoomRepository) {}

  async execute(): Promise<Room[]> {
    return this.roomRepository.findAllWaitingRooms();
  }
}
