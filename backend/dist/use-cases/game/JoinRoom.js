"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinRoom = void 0;
class JoinRoom {
    roomRepository;
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }
    async execute(params) {
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
        const joiner = {
            userId,
            username,
            symbol: 'O', // Người vào sau là quân O
        };
        room.players.push(joiner);
        return this.roomRepository.save(room);
    }
}
exports.JoinRoom = JoinRoom;
