"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GetWaitingRooms_1 = require("../../../use-cases/game/GetWaitingRooms");
const shared_instances_1 = require("../../shared-instances");
const roomRouter = (0, express_1.Router)();
const getWaitingRooms = new GetWaitingRooms_1.GetWaitingRooms(shared_instances_1.sharedRoomRepository);
// GET /api/rooms/waiting - Lấy danh sách phòng đang chờ người chơi
roomRouter.get('/waiting', async (_req, res) => {
    try {
        const rooms = await getWaitingRooms.execute();
        // Che bàn cờ khi gửi về Lobby (chỉ gửi thông tin cần thiết)
        const publicRooms = rooms.map((room) => ({
            id: room.id,
            boardSize: room.boardSize,
            winCondition: room.winCondition,
            hostUsername: room.players[0]?.username ?? 'Unknown',
            createdAt: room.createdAt,
        }));
        res.status(200).json({ success: true, data: publicRooms });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Internal server error';
        res.status(500).json({ success: false, message });
    }
});
exports.default = roomRouter;
