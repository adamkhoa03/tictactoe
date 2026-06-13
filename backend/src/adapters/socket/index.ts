import { Server, Socket } from 'socket.io';
import { ZodError } from 'zod';
import { CreateRoom } from '../../use-cases/game/CreateRoom';
import { JoinRoom } from '../../use-cases/game/JoinRoom';
import { MakeMove } from '../../use-cases/game/MakeMove';
import { GetWaitingRooms } from '../../use-cases/game/GetWaitingRooms';
import { createRoomSchema, joinRoomSchema, makeMoveSchema } from '../../schemas/room.schema';
import { sharedRoomRepository } from '../../infrastructure/shared-instances';
import { RoomPlayer } from '../../domain/entities/Room';
import { MongooseUserRepository } from '../repositories/MongooseUserRepository';
import { UserModel } from '../../infrastructure/database/models/User';
import { MatchModel } from '../../infrastructure/database/models/Match';

const createRoomUseCase = new CreateRoom(sharedRoomRepository);
const joinRoomUseCase = new JoinRoom(sharedRoomRepository);
const makeMoveUseCase = new MakeMove(sharedRoomRepository);
const getWaitingRoomsUseCase = new GetWaitingRooms(sharedRoomRepository);
const mongooseUserRepository = new MongooseUserRepository();

// Trạng thái người chơi online
const onlineUsers = new Map<string, { socketId: string; username: string }>();

// Hàm phát sóng danh sách phòng sảnh chờ
async function broadcastLobbyRooms(io: Server) {
  try {
    const waitingRooms = await getWaitingRoomsUseCase.execute();
    const publicRooms = waitingRooms.map((room) => ({
      id: room.id,
      boardSize: room.boardSize,
      winCondition: room.winCondition,
      hostUsername: room.players[0]?.username || 'Host',
      createdAt: room.createdAt.toISOString(),
    }));
    io.emit('lobby_rooms', { rooms: publicRooms });
  } catch (err) {
    console.error('Error broadcasting lobby rooms:', err);
  }
}

// Hàm phát sóng danh sách người chơi sảnh chờ
async function broadcastLobbyPlayers(io: Server) {
  try {
    const allUsers = await mongooseUserRepository.findAll();
    
    // Tìm tất cả người chơi đang trong các phòng chờ hoặc đang chơi
    const allRooms = await sharedRoomRepository.findAllRooms();
    const busyUserIds = new Set<string>();
    for (const r of allRooms) {
      if (r.status === 'waiting' || r.status === 'playing') {
        for (const p of r.players) {
          busyUserIds.add(p.userId);
        }
      }
    }

    const sortedPlayers = allUsers.map((user) => {
      const isOnline = onlineUsers.has(user.id || '');
      const isPlaying = busyUserIds.has(user.id || '');
      const elo = user.eloRating ?? 1200;
      let rankLabel = 'Bronze';
      if (elo >= 2000) rankLabel = 'Grandmaster';
      else if (elo >= 1700) rankLabel = 'Diamond';
      else if (elo >= 1500) rankLabel = 'Platinum';
      else if (elo >= 1300) rankLabel = 'Gold';
      else if (elo >= 1100) rankLabel = 'Silver';

      return {
        id: user.id || '',
        username: user.username,
        rank: rankLabel,
        isPlaying,
        isOnline,
      };
    }).sort((a, b) => {
      if (a.isOnline === b.isOnline) return 0;
      return a.isOnline ? -1 : 1; // Online trước offline
    });

    io.emit('lobby_players', { players: sortedPlayers, totalOnline: onlineUsers.size });
  } catch (err) {
    console.error('Error broadcasting lobby players:', err);
  }
}

// Hàm phát sóng bảng xếp hạng
async function broadcastLeaderboard(io: Server) {
  try {
    const topUsers = await UserModel.find({})
      .sort({ eloRating: -1 })
      .limit(10);
    const leaderboard = topUsers.map((u, idx) => ({
      rank: idx + 1,
      id: u._id.toString(),
      username: u.username,
      eloRating: u.eloRating ?? 1200,
      wins: u.wins ?? 0,
      losses: u.losses ?? 0,
      gamesPlayed: u.gamesPlayed ?? 0,
      winStreak: u.winStreak ?? 0,
    }));
    io.emit('leaderboard_data', { leaderboard });
  } catch (err) {
    console.error('Error broadcasting leaderboard:', err);
  }
}

// Hàm xử lý kết quả khi kết thúc trận đấu (Cập nhật ELO, Win Streak, lưu lịch sử)
async function handleGameEnd(io: Server, roomId: string, winnerId: string, reason: 'normal' | 'surrender' | 'timeout') {
  try {
    const room = await sharedRoomRepository.findById(roomId);
    if (!room || room.players.length < 2) return;

    const player1Id = room.players[0].userId;
    const player2Id = room.players[1].userId;
    const player1Name = room.players[0].username;
    const player2Name = room.players[1].username;

    const u1Doc = await UserModel.findById(player1Id);
    const u2Doc = await UserModel.findById(player2Id);

    if (!u1Doc || !u2Doc) return;

    // Tính toán ELO
    const r1 = u1Doc.eloRating ?? 1200;
    const r2 = u2Doc.eloRating ?? 1200;

    const e1 = 1 / (1 + Math.pow(10, (r2 - r1) / 400));
    const e2 = 1 / (1 + Math.pow(10, (r1 - r2) / 400));

    let s1 = 0.5;
    let s2 = 0.5;

    if (winnerId === player1Id) {
      s1 = 1;
      s2 = 0;
    } else if (winnerId === player2Id) {
      s1 = 0;
      s2 = 1;
    }

    const K = 32;
    const eloChange1 = Math.round(K * (s1 - e1));
    const eloChange2 = Math.round(K * (s2 - e2));

    const newElo1 = Math.max(100, r1 + eloChange1);
    const newElo2 = Math.max(100, r2 + eloChange2);

    u1Doc.gamesPlayed = (u1Doc.gamesPlayed ?? 0) + 1;
    u2Doc.gamesPlayed = (u2Doc.gamesPlayed ?? 0) + 1;

    if (winnerId === 'draw') {
      u1Doc.draws = (u1Doc.draws ?? 0) + 1;
      u2Doc.draws = (u2Doc.draws ?? 0) + 1;
      u1Doc.winStreak = 0;
      u2Doc.winStreak = 0;
    } else if (winnerId === player1Id) {
      u1Doc.wins = (u1Doc.wins ?? 0) + 1;
      u2Doc.losses = (u2Doc.losses ?? 0) + 1;
      u1Doc.winStreak = (u1Doc.winStreak ?? 0) + 1;
      u1Doc.maxWinStreak = Math.max(u1Doc.maxWinStreak ?? 0, u1Doc.winStreak);
      u2Doc.winStreak = 0;
    } else {
      u1Doc.losses = (u1Doc.losses ?? 0) + 1;
      u2Doc.wins = (u2Doc.wins ?? 0) + 1;
      u2Doc.winStreak = (u2Doc.winStreak ?? 0) + 1;
      u2Doc.maxWinStreak = Math.max(u2Doc.maxWinStreak ?? 0, u2Doc.winStreak);
      u1Doc.winStreak = 0;
    }

    u1Doc.eloRating = newElo1;
    u2Doc.eloRating = newElo2;

    await u1Doc.save();
    await u2Doc.save();

    // Lưu trận đấu vào DB
    const match = new MatchModel({
      player1: player1Id,
      player2: player2Id,
      player1Username: player1Name,
      player2Username: player2Name,
      winnerId,
      reason,
      boardSize: room.boardSize,
      winCondition: room.winCondition,
      eloChange1,
      eloChange2,
    });
    await match.save();

    // Gửi cập nhật profile cho từng người chơi
    const p1SocketId = onlineUsers.get(player1Id)?.socketId;
    const p2SocketId = onlineUsers.get(player2Id)?.socketId;

    if (p1SocketId) {
      io.to(p1SocketId).emit('profile_update', {
        user: u1Doc.toJSON(),
      });
    }
    if (p2SocketId) {
      io.to(p2SocketId).emit('profile_update', {
        user: u2Doc.toJSON(),
      });
    }

    // Phát sóng lại danh sách và leaderboard
    await broadcastLobbyPlayers(io);
    await broadcastLeaderboard(io);
  } catch (err) {
    console.error('Error handling game end stats update:', err);
  }
}

// Hàm xử lý khi người chơi thoát phòng
async function handlePlayerLeaveRoom(io: Server, socket: Socket, userId: string, roomId: string) {
  try {
    const room = await sharedRoomRepository.findById(roomId);
    if (!room) return;

    // Remove player
    room.players = room.players.filter((p) => p.userId !== userId);
    
    // Remove from socket room
    await socket.leave(roomId);

    if (room.players.length === 0) {
      await sharedRoomRepository.delete(roomId);
      console.log(`🗑️ Room ${roomId} deleted because all players left.`);
    } else {
      if (room.status === 'playing') {
        // Trận đấu đã bắt đầu, người còn lại thắng cuộc
        room.status = 'finished';
        room.winnerId = room.players[0].userId;
        room.reason = 'surrender'; // Coi như đối thủ đầu hàng khi thoát phòng
        
        // Reset bàn cờ rỗng theo kích thước hiện tại
        room.board = Array.from({ length: room.boardSize }, () => Array(room.boardSize).fill(''));
        
        io.to(roomId).emit('game_over', {
          winnerId: room.winnerId,
          reason: 'surrender',
        });
        
        await handleGameEnd(io, roomId, room.winnerId, 'surrender');
      } else if (room.status === 'finished') {
        // Trận đấu đã kết thúc trước đó, một người rời đi đưa phòng về trạng thái chờ ghép người chơi khác
        room.status = 'waiting';
        room.winnerId = null;
        delete room.reason;
        room.board = Array.from({ length: room.boardSize }, () => Array(room.boardSize).fill(''));
      } else {
        // Trận đấu chưa bắt đầu, phòng quay lại trạng thái chờ ghép cặp người chơi mới
        console.log(`🔄 Player left before game start. Room ${roomId} remains in waiting state.`);
      }
      
      await sharedRoomRepository.save(room);
      io.to(roomId).emit('room_state', { room });
      console.log(`🚪 Player ${userId} left Room ${roomId}. Players remaining: ${room.players.length}`);
    }

    // Broadcast updated rooms list to lobby
    broadcastLobbyRooms(io);
  } catch (err) {
    console.error('Error handling player leave room:', err);
  }
}

// Hàng chờ ghép phòng nhanh toàn cục
interface QuickMatchPlayer {
  socket: Socket;
  userId: string;
  username: string;
  timer?: NodeJS.Timeout;
}
const quickMatchQueue = new Map<string, QuickMatchPlayer>();

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    console.log(`🔌 Client connected: ${socket.id} (User: ${user?.username ?? 'Unknown'})`);

    if (user) {
      onlineUsers.set(user.userId, { socketId: socket.id, username: user.username });
      console.log(`👤 User ${user.username} is online. Total online: ${onlineUsers.size}`);
      broadcastLobbyPlayers(io);
      broadcastLobbyRooms(io);
      broadcastLeaderboard(io);
    }

    // -------------------------------------------------------------------
    // get_leaderboard: Yêu cầu bảng xếp hạng
    // -------------------------------------------------------------------
    socket.on('get_leaderboard', () => {
      broadcastLeaderboard(io);
    });

    // -------------------------------------------------------------------
    // get_match_history: Yêu cầu lịch sử đấu
    // -------------------------------------------------------------------
    socket.on('get_match_history', async () => {
      try {
        if (!user) return;
        const matches = await MatchModel.find({
          $or: [{ player1: user.userId }, { player2: user.userId }],
        })
          .sort({ createdAt: -1 })
          .limit(20);
        socket.emit('match_history_data', { matches });
      } catch (err) {
        console.error('Error getting match history:', err);
      }
    });

    // -------------------------------------------------------------------
    // get_lobby_players: Yêu cầu danh sách người chơi ở sảnh chờ
    // -------------------------------------------------------------------
    socket.on('get_lobby_players', () => {
      broadcastLobbyPlayers(io);
    });

    // -------------------------------------------------------------------
    // get_lobby_rooms: Yêu cầu danh sách phòng ở sảnh chờ
    // -------------------------------------------------------------------
    socket.on('get_lobby_rooms', () => {
      broadcastLobbyRooms(io);
    });

    // -------------------------------------------------------------------
    // quick_match: Ghép phòng nhanh
    // -------------------------------------------------------------------
    socket.on('quick_match', async () => {
      try {
        if (!user) return;

        // Tránh trùng lặp
        if (quickMatchQueue.has(user.userId)) {
          return;
        }

        console.log(`🔍 User ${user.username} (${user.userId}) started quick match`);

        // Tìm đối thủ đang chờ ghép nhanh trong hàng đợi
        let opponentEntry: QuickMatchPlayer | null = null;
        for (const [otherUserId, entry] of quickMatchQueue.entries()) {
          if (otherUserId !== user.userId) {
            if (entry.socket.connected) {
              opponentEntry = entry;
              break;
            } else {
              if (entry.timer) clearTimeout(entry.timer);
              quickMatchQueue.delete(otherUserId);
            }
          }
        }

        if (opponentEntry) {
          // Thắt cặp thành công!
          if (opponentEntry.timer) {
            clearTimeout(opponentEntry.timer);
          }
          quickMatchQueue.delete(opponentEntry.userId);

          // Tạo phòng mới mặc định 15x15, win condition 5, trạng thái là waiting
          const room = await createRoomUseCase.execute({
            boardSize: 15,
            winCondition: 5,
            userId: opponentEntry.userId,
            username: opponentEntry.username,
          });

          await opponentEntry.socket.join(room.id);
          await socket.join(room.id);

          const updatedRoom = await joinRoomUseCase.execute({
            roomId: room.id,
            userId: user.userId,
            username: user.username,
          });

          // Thông báo cho cả 2 là đã ghép phòng thành công và chuyển hướng game page
          io.to(updatedRoom.id).emit('match_found', { roomId: room.id });
          io.to(updatedRoom.id).emit('room_state', { room: updatedRoom });

          io.emit('lobby_updated');
          console.log(`⚡ Match made! Room: ${room.id} between ${opponentEntry.username} and ${user.username}`);
          return;
        }

        // Đưa người chơi vào hàng chờ ghép
        const entry: QuickMatchPlayer = {
          socket,
          userId: user.userId,
          username: user.username,
        };

        // Đặt timer 5 giây để tìm phòng trống hiện có
        entry.timer = setTimeout(async () => {
          const currentEntry = quickMatchQueue.get(user.userId);
          if (!currentEntry || currentEntry.socket.id !== socket.id) return;

          console.log(`⏳ 5s timeout for ${user.username}. Checking for an available room...`);

          const availableRoom = await sharedRoomRepository.findAvailableRoom();
          if (availableRoom) {
            quickMatchQueue.delete(user.userId);

            try {
              const room = await joinRoomUseCase.execute({
                roomId: availableRoom.id,
                userId: user.userId,
                username: user.username,
              });

              await socket.join(room.id);

              // Phát sự kiện chuyển trang và trạng thái phòng
              io.to(room.id).emit('match_found', { roomId: room.id });
              io.to(room.id).emit('room_state', { room });

              io.emit('lobby_updated');
              console.log(`🚪 ${user.username} joined existing Room ${room.id} after 5s waiting`);
            } catch (err) {
              console.error(`Failed to join existing room automatically:`, err);
              quickMatchQueue.set(user.userId, entry);
            }
          } else {
            console.log(`ℹ️ No rooms available for ${user.username}. Continuing search...`);
          }
        }, 5000);

        quickMatchQueue.set(user.userId, entry);

      } catch (error: unknown) {
        console.error('Lỗi khi ghép nhanh:', error);
        socket.emit('error', { message: 'Không thể ghép phòng nhanh.' });
      }
    });

    // -------------------------------------------------------------------
    // cancel_quick_match: Hủy ghép phòng nhanh
    // -------------------------------------------------------------------
    socket.on('cancel_quick_match', () => {
      if (!user) return;
      const entry = quickMatchQueue.get(user.userId);
      if (entry) {
        if (entry.timer) clearTimeout(entry.timer);
        quickMatchQueue.delete(user.userId);
        console.log(`❌ User ${user.username} cancelled quick match`);
      }
    });

    // -------------------------------------------------------------------
    // propose_board_size: Đề xuất kích thước bàn cờ và điều kiện thắng mới
    // -------------------------------------------------------------------
    socket.on('propose_board_size', (payload: { roomId: string, boardSize: number, winCondition: number }) => {
      if (!user) return;
      const { roomId, boardSize, winCondition } = payload;
      console.log(`💬 User ${user.username} proposed board size ${boardSize} and winCondition ${winCondition} in room ${roomId}`);
      io.to(roomId).emit('board_size_proposed', { boardSize, winCondition, proposedBy: user.userId });
    });

    // -------------------------------------------------------------------
    // confirm_board_size: Đồng ý đổi kích thước bàn cờ và điều kiện thắng
    // -------------------------------------------------------------------
    socket.on('confirm_board_size', async (payload: { roomId: string, boardSize: number, winCondition: number }) => {
      try {
        if (!user) return;
        const { roomId, boardSize, winCondition } = payload;
        const room = await sharedRoomRepository.findById(roomId);
        if (!room) return;

        room.boardSize = boardSize;
        room.winCondition = winCondition;
        room.board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));

        await sharedRoomRepository.save(room);

        console.log(`✅ Board size confirmed to ${boardSize}x${boardSize} (win: ${winCondition}) in room ${roomId}`);
        io.to(roomId).emit('board_size_confirmed', { boardSize, winCondition });
        io.to(roomId).emit('room_state', { room });
      } catch (err) {
        console.error('Error confirming board size:', err);
      }
    });

    // -------------------------------------------------------------------
    // surrender: Đầu hàng
    // -------------------------------------------------------------------
    socket.on('surrender', async (payload: { roomId: string }) => {
      try {
        if (!user) return;
        const { roomId } = payload;
        const room = await sharedRoomRepository.findById(roomId);
        if (!room || room.status !== 'playing') return;

        // Xác định đối thủ là người chiến thắng
        const opponent = room.players.find((p) => p.userId !== user.userId);
        if (!opponent) return;

        room.status = 'finished';
        room.winnerId = opponent.userId;
        room.reason = 'surrender';

        await sharedRoomRepository.save(room);

        console.log(`🏳️ User ${user.username} surrendered in Room: ${room.id}. Winner: ${opponent.username}`);

        io.to(roomId).emit('game_over', {
          winnerId: room.winnerId,
          reason: 'surrender',
        });

        await handleGameEnd(io, roomId, room.winnerId, 'surrender');
      } catch (err) {
        console.error('Error on surrender:', err);
      }
    });

    // -------------------------------------------------------------------
    // decline_board_size: Từ chối đổi kích thước bàn cờ
    // -------------------------------------------------------------------
    socket.on('decline_board_size', (payload: { roomId: string }) => {
      if (!user) return;
      const { roomId } = payload;
      console.log(`❌ Board size proposal declined in room ${roomId}`);
      io.to(roomId).emit('board_size_declined');
    });

    // -------------------------------------------------------------------
    // start_game: Bắt đầu trận đấu
    // -------------------------------------------------------------------
    socket.on('start_game', async (payload: { roomId: string }) => {
      try {
        if (!user) return;
        const { roomId } = payload;
        const room = await sharedRoomRepository.findById(roomId);
        if (!room || room.players.length < 2) return;

        room.status = 'playing';
        // Chọn ngẫu nhiên người đi trước
        const firstPlayer = room.players[Math.floor(Math.random() * 2)];
        room.currentTurn = firstPlayer.userId;

        await sharedRoomRepository.save(room);

        const playerX = room.players.find((p) => p.symbol === 'X')!;
        const playerO = room.players.find((p) => p.symbol === 'O')!;
        const currentTurnPlayer = room.players.find((p) => p.userId === room.currentTurn)!;

        io.to(roomId).emit('game_start', {
          room,
          playerX: { userId: playerX.userId, username: playerX.username },
          playerO: { userId: playerO.userId, username: playerO.username },
          currentTurn: {
            userId: currentTurnPlayer.userId,
            username: currentTurnPlayer.username,
            symbol: currentTurnPlayer.symbol,
          },
        });

        io.emit('lobby_updated');
        broadcastLobbyRooms(io);
        console.log(`🎮 Game started manually in Room: ${room.id}`);
      } catch (err) {
        console.error('Error starting game:', err);
      }
    });

    // -------------------------------------------------------------------
    // play_again: Yêu cầu chơi lại (Đưa về phòng chuẩn bị)
    // -------------------------------------------------------------------
    socket.on('play_again', async (payload: { roomId: string }) => {
      try {
        if (!user) return;
        const { roomId } = payload;
        const room = await sharedRoomRepository.findById(roomId);
        if (!room) return;

        // Đưa phòng về trạng thái waiting để chuẩn bị chơi ván mới
        room.status = 'waiting';
        room.winnerId = null;
        delete room.reason;

        // Reset bàn cờ rỗng theo kích thước hiện tại
        room.board = Array.from({ length: room.boardSize }, () => Array(room.boardSize).fill(''));

        await sharedRoomRepository.save(room);

        console.log(`🔄 Room ${room.id} reset to preparation lobby (waiting) by ${user.username}`);

        // Phát trạng thái mới cho cả phòng
        io.to(roomId).emit('room_state', { room });
        broadcastLobbyRooms(io);
      } catch (err) {
        console.error('Error on play again:', err);
      }
    });

    // -------------------------------------------------------------------
    // hover_cell: Đồng bộ di chuột của đối thủ trên bàn cờ
    // -------------------------------------------------------------------
    socket.on('hover_cell', (payload: { roomId: string, row: number | null, col: number | null }) => {
      if (!user) return;
      const { roomId, row, col } = payload;
      socket.to(roomId).emit('opponent_hovered', { userId: user.userId, row, col });
    });

    // -------------------------------------------------------------------
    // chat_message: Nhắn tin trong trận đấu
    // -------------------------------------------------------------------
    socket.on('chat_message', (payload: { roomId: string, message: string }) => {
      if (!user) return;
      const { roomId, message } = payload;

      const chatMsg = {
        id: `${roomId}-${Date.now()}`,
        senderId: user.userId,
        senderUsername: user.username,
        message,
        timestamp: new Date().toISOString(),
      };

      io.to(roomId).emit('chat_received', chatMsg);
      console.log(`💬 Chat in Room ${roomId} by ${user.username}: ${message}`);
    });

    // -------------------------------------------------------------------
    // make_move: Đánh cờ
    // Payload: { roomId: string, row: number, col: number }
    // -------------------------------------------------------------------
    socket.on('make_move', async (payload: unknown) => {
      try {
        const input = makeMoveSchema.parse(payload);
        const room = await makeMoveUseCase.execute({
          ...input,
          userId: user.userId,
        });

        // Gửi thông tin nước đi mới cho tất cả các bên trong phòng
        io.to(room.id).emit('move_update', { room });

        // Nếu trận đấu đã kết thúc (thắng hoặc hòa)
        if (room.status === 'finished') {
          io.to(room.id).emit('game_over', {
            winnerId: room.winnerId,
            reason: room.reason,
          });
          await handleGameEnd(io, room.id, room.winnerId!, room.reason || 'normal');
        }

        console.log(`♟️ Move in Room: ${room.id} by ${user.username} at (${input.row}, ${input.col})`);
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          socket.emit('error', { message: 'Nước đi không hợp lệ: ' + error.errors[0]?.message });
        } else {
          const message = error instanceof Error ? error.message : 'Lỗi khi đi cờ.';
          socket.emit('error', { message });
        }
      }
    });

    // -------------------------------------------------------------------
    // create_room: Tạo phòng chơi mới
    // -------------------------------------------------------------------
    socket.on('create_room', async (payload: unknown) => {
      try {
        const input = createRoomSchema.parse(payload);
        const room = await createRoomUseCase.execute({
          ...input,
          userId: user.userId,
          username: user.username,
        });

        // Đăng ký socket vào room Socket.io
        await socket.join(room.id);

        // Phản hồi người tạo phòng với trạng thái phòng mới
        socket.emit('room_state', { room });

        // Thông báo cho toàn bộ client trong sảnh chờ có phòng mới
        io.emit('lobby_updated');

        console.log(`🏠 Room created: ${room.id} by ${user.username} (${room.boardSize}x${room.boardSize}, win: ${room.winCondition})`);

        // Tự động kéo một người chơi đang tìm trận (ghép phòng nhanh) vào phòng này ngay lập tức
        let waitingPlayer: QuickMatchPlayer | null = null;
        for (const [waitingUserId, entry] of quickMatchQueue.entries()) {
          if (waitingUserId !== user.userId && entry.socket.connected) {
            waitingPlayer = entry;
            break;
          }
        }

        if (waitingPlayer) {
          if (waitingPlayer.timer) clearTimeout(waitingPlayer.timer);
          quickMatchQueue.delete(waitingPlayer.userId);

          const updatedRoom = await joinRoomUseCase.execute({
            roomId: room.id,
            userId: waitingPlayer.userId,
            username: waitingPlayer.username,
          });

          await waitingPlayer.socket.join(room.id);

          // Phát sự kiện tìm trận thành công
          io.to(updatedRoom.id).emit('match_found', { roomId: room.id });
          io.to(updatedRoom.id).emit('room_state', { room: updatedRoom });

          io.emit('lobby_updated');
          console.log(`⚡ Waiting player ${waitingPlayer.username} matched into newly created Room: ${room.id}`);
        }
        broadcastLobbyRooms(io);
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
    // -------------------------------------------------------------------
    socket.on('join_room', async (payload: unknown) => {
      try {
        const input = joinRoomSchema.parse(payload);
        const room = await joinRoomUseCase.execute({
          ...input,
          userId: user.userId,
          username: user.username,
        });

        await socket.join(room.id);

        // Nếu phòng đang chơi (ví dụ do reconnect)
        if (room.status === 'playing') {
          const playerX = room.players.find((p: RoomPlayer) => p.symbol === 'X')!;
          const playerO = room.players.find((p: RoomPlayer) => p.symbol === 'O')!;
          const currentTurnPlayer = room.players.find((p: RoomPlayer) => p.userId === room.currentTurn)!;

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
        } else {
          // Nếu vẫn đang chờ, phát room_state
          io.to(room.id).emit('room_state', { room });
        }

        io.emit('lobby_updated');
        broadcastLobbyRooms(io);
        console.log(`🚪 Player ${user.username} joined room ${room.id}`);
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
    // invite_player: Mời người chơi vào phòng đấu
    // -------------------------------------------------------------------
    socket.on('invite_player', (payload: { roomId: string, targetUserId: string }) => {
      if (!user) return;
      const { roomId, targetUserId } = payload;
      const targetUser = onlineUsers.get(targetUserId);
      if (targetUser) {
        io.to(targetUser.socketId).emit('receive_invite', {
          roomId,
          inviterUsername: user.username,
        });
        console.log(`📩 Invitation sent from ${user.username} to ${targetUser.username} for room ${roomId}`);
      }
    });

    // -------------------------------------------------------------------
    // leave_room: Rời khỏi phòng đấu
    // -------------------------------------------------------------------
    socket.on('leave_room', (payload: { roomId: string }) => {
      if (!user) return;
      handlePlayerLeaveRoom(io, socket, user.userId, payload.roomId);
    });

    // -------------------------------------------------------------------
    // Disconnect
    // -------------------------------------------------------------------
    socket.on('disconnect', (reason) => {
      if (user) {
        const entry = quickMatchQueue.get(user.userId);
        if (entry && entry.socket.id === socket.id) {
          if (entry.timer) clearTimeout(entry.timer);
          quickMatchQueue.delete(user.userId);
          console.log(`🔌 Client disconnected, removed ${user.username} from quick match queue`);
        }

        const onlineEntry = onlineUsers.get(user.userId);
        if (onlineEntry && onlineEntry.socketId === socket.id) {
          onlineUsers.delete(user.userId);
          console.log(`👤 User ${user.username} went offline. Total online: ${onlineUsers.size}`);
          broadcastLobbyPlayers(io);
        }

        // Tự động cho người dùng thoát phòng khi ngắt kết nối
        (async () => {
          try {
            const allRooms = await sharedRoomRepository.findAllRooms();
            for (const r of allRooms) {
              if (r.players.some((p) => p.userId === user.userId)) {
                await handlePlayerLeaveRoom(io, socket, user.userId, r.id);
              }
            }
          } catch (err) {
            console.error('Error handling disconnect room cleanup:', err);
          }
        })();
      }
      console.log(`🔌 Client disconnected: ${socket.id} (User: ${user?.username ?? 'Unknown'}, Reason: ${reason})`);
    });
  });
}

