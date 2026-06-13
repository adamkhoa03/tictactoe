"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRoomRepository = void 0;
// Lưu trữ phòng chơi trong bộ nhớ RAM để đảm bảo hiệu suất real-time
const roomStore = new Map();
class InMemoryRoomRepository {
    async findById(id) {
        return roomStore.get(id) ?? null;
    }
    async findAvailableRoom(boardSize) {
        for (const room of roomStore.values()) {
            if (room.status !== 'waiting')
                continue;
            if (room.players.length >= 2)
                continue;
            if (boardSize !== undefined && room.boardSize !== boardSize)
                continue;
            return room;
        }
        return null;
    }
    async findAllWaitingRooms() {
        return Array.from(roomStore.values()).filter((room) => room.status === 'waiting' && room.players.length < 2);
    }
    async findAllRooms() {
        return Array.from(roomStore.values());
    }
    async save(room) {
        room.updatedAt = new Date();
        roomStore.set(room.id, room);
        return room;
    }
    async delete(id) {
        return roomStore.delete(id);
    }
}
exports.InMemoryRoomRepository = InMemoryRoomRepository;
