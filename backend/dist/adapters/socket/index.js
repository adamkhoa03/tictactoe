"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const zod_1 = require("zod");
const CreateRoom_1 = require("../../use-cases/game/CreateRoom");
const JoinRoom_1 = require("../../use-cases/game/JoinRoom");
const MakeMove_1 = require("../../use-cases/game/MakeMove");
const GetWaitingRooms_1 = require("../../use-cases/game/GetWaitingRooms");
const room_schema_1 = require("../../schemas/room.schema");
const shared_instances_1 = require("../../infrastructure/shared-instances");
const MongooseUserRepository_1 = require("../repositories/MongooseUserRepository");
const createRoomUseCase = new CreateRoom_1.CreateRoom(shared_instances_1.sharedRoomRepository);
const joinRoomUseCase = new JoinRoom_1.JoinRoom(shared_instances_1.sharedRoomRepository);
const makeMoveUseCase = new MakeMove_1.MakeMove(shared_instances_1.sharedRoomRepository);
const getWaitingRoomsUseCase = new GetWaitingRooms_1.GetWaitingRooms(shared_instances_1.sharedRoomRepository);
const mongooseUserRepository = new MongooseUserRepository_1.MongooseUserRepository();
// Trạng thái người chơi online
const onlineUsers = new Map();
// Hàm phát sóng danh sách phòng sảnh chờ
async function broadcastLobbyRooms(io) {
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
    }
    catch (err) {
        console.error('Error broadcasting lobby rooms:', err);
    }
}
// Hàm phát sóng danh sách người chơi sảnh chờ
async function broadcastLobbyPlayers(io) {
    try {
        const allUsers = await mongooseUserRepository.findAll();
        // Tìm tất cả người chơi đang trong các phòng chờ hoặc đang chơi
        const allRooms = await shared_instances_1.sharedRoomRepository.findAllRooms();
        const busyUserIds = new Set();
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
            return {
                id: user.id || '',
                username: user.username,
                rank: (user.wins ?? 0) >= 20 ? 'Grandmaster' : (user.wins ?? 0) >= 10 ? 'Diamond I' : 'Gold I',
                isPlaying,
                isOnline,
            };
        }).sort((a, b) => {
            if (a.isOnline === b.isOnline)
                return 0;
            return a.isOnline ? -1 : 1; // Online trước offline
        });
        io.emit('lobby_players', { players: sortedPlayers, totalOnline: onlineUsers.size });
    }
    catch (err) {
        console.error('Error broadcasting lobby players:', err);
    }
}
// Hàm xử lý khi người chơi thoát phòng
async function handlePlayerLeaveRoom(io, socket, userId, roomId) {
    try {
        const room = await shared_instances_1.sharedRoomRepository.findById(roomId);
        if (!room)
            return;
        // Remove player
        room.players = room.players.filter((p) => p.userId !== userId);
        // Remove from socket room
        await socket.leave(roomId);
        if (room.players.length === 0) {
            await shared_instances_1.sharedRoomRepository.delete(roomId);
            console.log(`🗑️ Room ${roomId} deleted because all players left.`);
        }
        else {
            if (room.status === 'playing') {
                // Trận đấu đã bắt đầu, người còn lại thắng cuộc
                room.status = 'waiting'; // Quay về trạng thái chờ để sảnh nhìn thấy và ghép đôi lại
                room.winnerId = room.players[0].userId;
                room.reason = 'surrender'; // Coi như đối thủ đầu hàng khi thoát phòng
                // Reset bàn cờ rỗng theo kích thước hiện tại
                room.board = Array.from({ length: room.boardSize }, () => Array(room.boardSize).fill(''));
                io.to(roomId).emit('game_over', {
                    winnerId: room.winnerId,
                    reason: 'surrender',
                });
            }
            else if (room.status === 'finished') {
                // Trận đấu đã kết thúc trước đó, một người rời đi đưa phòng về trạng thái chờ ghép người chơi khác
                room.status = 'waiting';
                room.winnerId = null;
                delete room.reason;
                room.board = Array.from({ length: room.boardSize }, () => Array(room.boardSize).fill(''));
            }
            else {
                // Trận đấu chưa bắt đầu, phòng quay lại trạng thái chờ ghép cặp người chơi mới
                console.log(`🔄 Player left before game start. Room ${roomId} remains in waiting state.`);
            }
            await shared_instances_1.sharedRoomRepository.save(room);
            io.to(roomId).emit('room_state', { room });
            console.log(`🚪 Player ${userId} left Room ${roomId}. Players remaining: ${room.players.length}`);
        }
        // Broadcast updated rooms list to lobby
        broadcastLobbyRooms(io);
    }
    catch (err) {
        console.error('Error handling player leave room:', err);
    }
}
const quickMatchQueue = new Map();
function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        const user = socket.data.user;
        console.log(`🔌 Client connected: ${socket.id} (User: ${user?.username ?? 'Unknown'})`);
        if (user) {
            onlineUsers.set(user.userId, { socketId: socket.id, username: user.username });
            console.log(`👤 User ${user.username} is online. Total online: ${onlineUsers.size}`);
            broadcastLobbyPlayers(io);
            broadcastLobbyRooms(io);
        }
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
                if (!user)
                    return;
                // Tránh trùng lặp
                if (quickMatchQueue.has(user.userId)) {
                    return;
                }
                console.log(`🔍 User ${user.username} (${user.userId}) started quick match`);
                // Tìm đối thủ đang chờ ghép nhanh trong hàng đợi
                let opponentEntry = null;
                for (const [otherUserId, entry] of quickMatchQueue.entries()) {
                    if (otherUserId !== user.userId) {
                        if (entry.socket.connected) {
                            opponentEntry = entry;
                            break;
                        }
                        else {
                            if (entry.timer)
                                clearTimeout(entry.timer);
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
                const entry = {
                    socket,
                    userId: user.userId,
                    username: user.username,
                };
                // Đặt timer 5 giây để tìm phòng trống hiện có
                entry.timer = setTimeout(async () => {
                    const currentEntry = quickMatchQueue.get(user.userId);
                    if (!currentEntry || currentEntry.socket.id !== socket.id)
                        return;
                    console.log(`⏳ 5s timeout for ${user.username}. Checking for an available room...`);
                    const availableRoom = await shared_instances_1.sharedRoomRepository.findAvailableRoom();
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
                        }
                        catch (err) {
                            console.error(`Failed to join existing room automatically:`, err);
                            quickMatchQueue.set(user.userId, entry);
                        }
                    }
                    else {
                        console.log(`ℹ️ No rooms available for ${user.username}. Continuing search...`);
                    }
                }, 5000);
                quickMatchQueue.set(user.userId, entry);
            }
            catch (error) {
                console.error('Lỗi khi ghép nhanh:', error);
                socket.emit('error', { message: 'Không thể ghép phòng nhanh.' });
            }
        });
        // -------------------------------------------------------------------
        // cancel_quick_match: Hủy ghép phòng nhanh
        // -------------------------------------------------------------------
        socket.on('cancel_quick_match', () => {
            if (!user)
                return;
            const entry = quickMatchQueue.get(user.userId);
            if (entry) {
                if (entry.timer)
                    clearTimeout(entry.timer);
                quickMatchQueue.delete(user.userId);
                console.log(`❌ User ${user.username} cancelled quick match`);
            }
        });
        // -------------------------------------------------------------------
        // propose_board_size: Đề xuất kích thước bàn cờ và điều kiện thắng mới
        // -------------------------------------------------------------------
        socket.on('propose_board_size', (payload) => {
            if (!user)
                return;
            const { roomId, boardSize, winCondition } = payload;
            console.log(`💬 User ${user.username} proposed board size ${boardSize} and winCondition ${winCondition} in room ${roomId}`);
            io.to(roomId).emit('board_size_proposed', { boardSize, winCondition, proposedBy: user.userId });
        });
        // -------------------------------------------------------------------
        // confirm_board_size: Đồng ý đổi kích thước bàn cờ và điều kiện thắng
        // -------------------------------------------------------------------
        socket.on('confirm_board_size', async (payload) => {
            try {
                if (!user)
                    return;
                const { roomId, boardSize, winCondition } = payload;
                const room = await shared_instances_1.sharedRoomRepository.findById(roomId);
                if (!room)
                    return;
                room.boardSize = boardSize;
                room.winCondition = winCondition;
                room.board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
                await shared_instances_1.sharedRoomRepository.save(room);
                console.log(`✅ Board size confirmed to ${boardSize}x${boardSize} (win: ${winCondition}) in room ${roomId}`);
                io.to(roomId).emit('board_size_confirmed', { boardSize, winCondition });
                io.to(roomId).emit('room_state', { room });
            }
            catch (err) {
                console.error('Error confirming board size:', err);
            }
        });
        // -------------------------------------------------------------------
        // surrender: Đầu hàng
        // -------------------------------------------------------------------
        socket.on('surrender', async (payload) => {
            try {
                if (!user)
                    return;
                const { roomId } = payload;
                const room = await shared_instances_1.sharedRoomRepository.findById(roomId);
                if (!room || room.status !== 'playing')
                    return;
                // Xác định đối thủ là người chiến thắng
                const opponent = room.players.find((p) => p.userId !== user.userId);
                if (!opponent)
                    return;
                room.status = 'finished';
                room.winnerId = opponent.userId;
                room.reason = 'surrender';
                await shared_instances_1.sharedRoomRepository.save(room);
                console.log(`🏳️ User ${user.username} surrendered in Room: ${room.id}. Winner: ${opponent.username}`);
                io.to(roomId).emit('game_over', {
                    winnerId: room.winnerId,
                    reason: 'surrender',
                });
            }
            catch (err) {
                console.error('Error on surrender:', err);
            }
        });
        // -------------------------------------------------------------------
        // decline_board_size: Từ chối đổi kích thước bàn cờ
        // -------------------------------------------------------------------
        socket.on('decline_board_size', (payload) => {
            if (!user)
                return;
            const { roomId } = payload;
            console.log(`❌ Board size proposal declined in room ${roomId}`);
            io.to(roomId).emit('board_size_declined');
        });
        // -------------------------------------------------------------------
        // start_game: Bắt đầu trận đấu
        // -------------------------------------------------------------------
        socket.on('start_game', async (payload) => {
            try {
                if (!user)
                    return;
                const { roomId } = payload;
                const room = await shared_instances_1.sharedRoomRepository.findById(roomId);
                if (!room || room.players.length < 2)
                    return;
                room.status = 'playing';
                // Chọn ngẫu nhiên người đi trước
                const firstPlayer = room.players[Math.floor(Math.random() * 2)];
                room.currentTurn = firstPlayer.userId;
                await shared_instances_1.sharedRoomRepository.save(room);
                const playerX = room.players.find((p) => p.symbol === 'X');
                const playerO = room.players.find((p) => p.symbol === 'O');
                const currentTurnPlayer = room.players.find((p) => p.userId === room.currentTurn);
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
            }
            catch (err) {
                console.error('Error starting game:', err);
            }
        });
        // -------------------------------------------------------------------
        // play_again: Yêu cầu chơi lại (Đưa về phòng chuẩn bị)
        // -------------------------------------------------------------------
        socket.on('play_again', async (payload) => {
            try {
                if (!user)
                    return;
                const { roomId } = payload;
                const room = await shared_instances_1.sharedRoomRepository.findById(roomId);
                if (!room)
                    return;
                // Đưa phòng về trạng thái waiting để chuẩn bị chơi ván mới
                room.status = 'waiting';
                room.winnerId = null;
                delete room.reason;
                // Reset bàn cờ rỗng theo kích thước hiện tại
                room.board = Array.from({ length: room.boardSize }, () => Array(room.boardSize).fill(''));
                await shared_instances_1.sharedRoomRepository.save(room);
                console.log(`🔄 Room ${room.id} reset to preparation lobby (waiting) by ${user.username}`);
                // Phát trạng thái mới cho cả phòng
                io.to(roomId).emit('room_state', { room });
                broadcastLobbyRooms(io);
            }
            catch (err) {
                console.error('Error on play again:', err);
            }
        });
        // -------------------------------------------------------------------
        // hover_cell: Đồng bộ di chuột của đối thủ trên bàn cờ
        // -------------------------------------------------------------------
        socket.on('hover_cell', (payload) => {
            if (!user)
                return;
            const { roomId, row, col } = payload;
            socket.to(roomId).emit('opponent_hovered', { userId: user.userId, row, col });
        });
        // -------------------------------------------------------------------
        // chat_message: Nhắn tin trong trận đấu
        // -------------------------------------------------------------------
        socket.on('chat_message', (payload) => {
            if (!user)
                return;
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
        socket.on('make_move', async (payload) => {
            try {
                const input = room_schema_1.makeMoveSchema.parse(payload);
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
                }
                console.log(`♟️ Move in Room: ${room.id} by ${user.username} at (${input.row}, ${input.col})`);
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    socket.emit('error', { message: 'Nước đi không hợp lệ: ' + error.errors[0]?.message });
                }
                else {
                    const message = error instanceof Error ? error.message : 'Lỗi khi đi cờ.';
                    socket.emit('error', { message });
                }
            }
        });
        // -------------------------------------------------------------------
        // create_room: Tạo phòng chơi mới
        // -------------------------------------------------------------------
        socket.on('create_room', async (payload) => {
            try {
                const input = room_schema_1.createRoomSchema.parse(payload);
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
                let waitingPlayer = null;
                for (const [waitingUserId, entry] of quickMatchQueue.entries()) {
                    if (waitingUserId !== user.userId && entry.socket.connected) {
                        waitingPlayer = entry;
                        break;
                    }
                }
                if (waitingPlayer) {
                    if (waitingPlayer.timer)
                        clearTimeout(waitingPlayer.timer);
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
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    socket.emit('error', { message: 'Dữ liệu không hợp lệ: ' + error.errors[0]?.message });
                }
                else {
                    const message = error instanceof Error ? error.message : 'Không thể tạo phòng.';
                    socket.emit('error', { message });
                }
            }
        });
        // -------------------------------------------------------------------
        // join_room: Tham gia phòng chơi hiện có
        // -------------------------------------------------------------------
        socket.on('join_room', async (payload) => {
            try {
                const input = room_schema_1.joinRoomSchema.parse(payload);
                const room = await joinRoomUseCase.execute({
                    ...input,
                    userId: user.userId,
                    username: user.username,
                });
                await socket.join(room.id);
                // Nếu phòng đang chơi (ví dụ do reconnect)
                if (room.status === 'playing') {
                    const playerX = room.players.find((p) => p.symbol === 'X');
                    const playerO = room.players.find((p) => p.symbol === 'O');
                    const currentTurnPlayer = room.players.find((p) => p.userId === room.currentTurn);
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
                }
                else {
                    // Nếu vẫn đang chờ, phát room_state
                    io.to(room.id).emit('room_state', { room });
                }
                io.emit('lobby_updated');
                broadcastLobbyRooms(io);
                console.log(`🚪 Player ${user.username} joined room ${room.id}`);
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    socket.emit('error', { message: 'Dữ liệu không hợp lệ: ' + error.errors[0]?.message });
                }
                else {
                    const message = error instanceof Error ? error.message : 'Không thể tham gia phòng.';
                    socket.emit('error', { message });
                }
            }
        });
        // -------------------------------------------------------------------
        // invite_player: Mời người chơi vào phòng đấu
        // -------------------------------------------------------------------
        socket.on('invite_player', (payload) => {
            if (!user)
                return;
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
        socket.on('leave_room', (payload) => {
            if (!user)
                return;
            handlePlayerLeaveRoom(io, socket, user.userId, payload.roomId);
        });
        // -------------------------------------------------------------------
        // Disconnect
        // -------------------------------------------------------------------
        socket.on('disconnect', (reason) => {
            if (user) {
                const entry = quickMatchQueue.get(user.userId);
                if (entry && entry.socket.id === socket.id) {
                    if (entry.timer)
                        clearTimeout(entry.timer);
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
                        const allRooms = await shared_instances_1.sharedRoomRepository.findAllRooms();
                        for (const r of allRooms) {
                            if (r.players.some((p) => p.userId === user.userId)) {
                                await handlePlayerLeaveRoom(io, socket, user.userId, r.id);
                            }
                        }
                    }
                    catch (err) {
                        console.error('Error handling disconnect room cleanup:', err);
                    }
                })();
            }
            console.log(`🔌 Client disconnected: ${socket.id} (User: ${user?.username ?? 'Unknown'}, Reason: ${reason})`);
        });
    });
}
