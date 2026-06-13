"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakeMove = void 0;
class MakeMove {
    roomRepository;
    constructor(roomRepository) {
        this.roomRepository = roomRepository;
    }
    async execute(params) {
        const { userId, roomId, row, col } = params;
        const room = await this.roomRepository.findById(roomId);
        if (!room) {
            throw new Error('Phòng không tồn tại.');
        }
        if (room.status !== 'playing') {
            throw new Error('Trận đấu chưa bắt đầu hoặc đã kết thúc.');
        }
        if (room.currentTurn !== userId) {
            throw new Error('Chưa đến lượt đi của bạn.');
        }
        // Kiểm tra giới hạn bàn cờ
        if (row < 0 || row >= room.boardSize || col < 0 || col >= room.boardSize) {
            throw new Error('Tọa độ nước đi ngoài phạm vi bàn cờ.');
        }
        // Kiểm tra ô trống
        if (room.board[row][col] !== '') {
            throw new Error('Ô này đã được đánh.');
        }
        // Tìm quân cờ của người chơi hiện tại
        const player = room.players.find((p) => p.userId === userId);
        if (!player) {
            throw new Error('Bạn không tham gia phòng chơi này.');
        }
        const symbol = player.symbol;
        room.board[row][col] = symbol;
        // Kiểm tra kết quả trận đấu
        const hasWon = this.checkWin(room.board, room.boardSize, room.winCondition, row, col, symbol);
        if (hasWon) {
            room.status = 'finished';
            room.winnerId = userId;
            room.reason = 'normal';
        }
        else {
            // Kiểm tra hòa (không còn ô trống)
            const isDraw = room.board.every((r) => r.every((cell) => cell !== ''));
            if (isDraw) {
                room.status = 'finished';
                room.winnerId = 'draw';
                room.reason = 'normal';
            }
            else {
                // Chuyển lượt đi
                const nextPlayer = room.players.find((p) => p.userId !== userId);
                if (nextPlayer) {
                    room.currentTurn = nextPlayer.userId;
                }
            }
        }
        return this.roomRepository.save(room);
    }
    // Thuật toán kiểm tra thắng thua động theo kích thước bàn cờ và winCondition
    checkWin(board, size, winLen, r, c, symbol) {
        const directions = [
            { dr: 0, dc: 1 }, // Ngang
            { dr: 1, dc: 0 }, // Dọc
            { dr: 1, dc: 1 }, // Chéo xuống-phải
            { dr: 1, dc: -1 }, // Chéo xuống-trái
        ];
        for (const { dr, dc } of directions) {
            let count = 1;
            // Hướng dương
            let nr = r + dr;
            let nc = c + dc;
            while (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === symbol) {
                count++;
                nr += dr;
                nc += dc;
            }
            // Hướng âm
            nr = r - dr;
            nc = c - dc;
            while (nr >= 0 && nr < size && nc >= 0 && nc < size && board[nr][nc] === symbol) {
                count++;
                nr -= dr;
                nc -= dc;
            }
            if (count >= winLen) {
                return true;
            }
        }
        return false;
    }
}
exports.MakeMove = MakeMove;
