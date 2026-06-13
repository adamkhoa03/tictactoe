"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoom = void 0;
class CreateRoom {
    roomRepository;
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }
    async execute(params) {
        const { userId, username, boardSize, winCondition } = params;
        // Tạo mã phòng ngẫu nhiên 6 ký tự chữ hoa
        const roomId = this.generateRoomId();
        const host = {
            userId,
            username,
            symbol: 'X', // Người tạo phòng mặc định là quân X
        };
        // Khởi tạo bàn cờ rỗng theo kích thước
        const board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
        const now = new Date();
        const room = {
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
    generateRoomId() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
}
exports.CreateRoom = CreateRoom;
