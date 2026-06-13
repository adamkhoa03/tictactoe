/**
 * Shared singleton instances để đảm bảo các lớp Use Cases và Adapters
 * khác nhau (REST routes, Socket handlers) dùng chung một instance Repository.
 */
import { InMemoryRoomRepository } from '../adapters/repositories/InMemoryRoomRepository';

export const sharedRoomRepository = new InMemoryRoomRepository();
