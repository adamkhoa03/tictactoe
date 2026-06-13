import { Router, Request, Response } from 'express';
import { GetWaitingRooms } from '../../../use-cases/game/GetWaitingRooms';
import { sharedRoomRepository } from '../../shared-instances';

const roomRouter = Router();

const getWaitingRooms = new GetWaitingRooms(sharedRoomRepository);

// GET /api/rooms/waiting - Lấy danh sách phòng đang chờ người chơi
roomRouter.get('/waiting', async (_req: Request, res: Response): Promise<void> => {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, message });
  }
});

export default roomRouter;
