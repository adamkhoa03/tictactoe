import { Server, Socket } from 'socket.io';
import { ZodError } from 'zod';
import { CreateRoom } from '../../use-cases/game/CreateRoom';
import { JoinRoom } from '../../use-cases/game/JoinRoom';
import { createRoomSchema, joinRoomSchema } from '../../schemas/room.schema';
import { sharedRoomRepository } from '../../infrastructure/shared-instances';
import { RoomPlayer } from '../../domain/entities/Room';

const createRoomUseCase = new CreateRoom(sharedRoomRepository);
const joinRoomUseCase = new JoinRoom(sharedRoomRepository);

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🔌 Client connected: ${socket.id} (User: ${user?.username ?? 'Unknown'})`);

    // -------------------------------------------------------------------
    // create_room: Tạo phòng chơi mới
    // Payload: { boardSize: 3|6|9|11|15, winCondition: 3|4|5 }
    // -------------------------------------------------------------------
    socket.on('create_room', async (payload: unknown) => {
      try {
        const input = createRoomSchema.parse(payload);
        const room = await createRoomUseCase.execute({
          ...input,
          userId: user.userId,
          username: user.username,
        });

        // Đăng ký socket vào room Socket.io để nhận broadcast sau này
        await socket.join(room.id);

        // Phản hồi người tạo phòng với trạng thái phòng mới
        socket.emit('room_state', { room });

        // Thông báo cho toàn bộ client trong sảnh chờ có phòng mới
        io.emit('lobby_updated');

        console.log(`🏠 Room created: ${room.id} by ${user.username} (${room.boardSize}x${room.boardSize}, win: ${room.winCondition})`);
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          socket.emit('error', { message: 'Dữ liệu không hợp lệ: ' + error.errors[0]?.message });
        } else {
          const message = error instanceof Error ? error.message : 'Không thể tạo phòng.';
          socket.emit('error', { message });
        }
      }
    });

    // -------------------------------------------------------------------
    // join_room: Tham gia phòng chơi hiện có
    // Payload: { roomId: string }
    // -------------------------------------------------------------------
    socket.on('join_room', async (payload: unknown) => {
      try {
        const input = joinRoomSchema.parse(payload);
        const room = await joinRoomUseCase.execute({
          ...input,
          userId: user.userId,
          username: user.username,
        });

        // Đăng ký socket vào room Socket.io
        await socket.join(room.id);

        // Xác định thông tin quân cờ và lượt đi của mỗi người chơi
        const playerX = room.players.find((p: RoomPlayer) => p.symbol === 'X')!;
        const playerO = room.players.find((p: RoomPlayer) => p.symbol === 'O')!;
        const currentTurnPlayer = room.players.find((p: RoomPlayer) => p.userId === room.currentTurn)!;

        // Gửi game_start cho tất cả 2 người trong phòng
        io.to(room.id).emit('game_start', {
          room,
          playerX: { userId: playerX.userId, username: playerX.username },
          playerO: { userId: playerO.userId, username: playerO.username },
          currentTurn: {
            userId: currentTurnPlayer.userId,
            username: currentTurnPlayer.username,
            symbol: currentTurnPlayer.symbol,
          },
        });

        // Cập nhật sảnh chờ (phòng này đã không còn waiting)
        io.emit('lobby_updated');

        console.log(`🎮 Game started in Room: ${room.id} | ${playerX.username} (X) vs ${playerO.username} (O) | First turn: ${currentTurnPlayer.username}`);
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          socket.emit('error', { message: 'Dữ liệu không hợp lệ: ' + error.errors[0]?.message });
        } else {
          const message = error instanceof Error ? error.message : 'Không thể tham gia phòng.';
          socket.emit('error', { message });
        }
      }
    });

    // -------------------------------------------------------------------
    // Disconnect
    // -------------------------------------------------------------------
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (User: ${user?.username ?? 'Unknown'}, Reason: ${reason})`);
    });
  });
}

