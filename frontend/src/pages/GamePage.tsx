import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlayerCard } from "@/features/game/components/PlayerCard/PlayerCard";
import { TurnTimer } from "@/features/game/components/TurnTimer/TurnTimer";
import { GameBoard } from "@/features/game/components/GameBoard/GameBoard";
import { MatchChat } from "@/features/game/components/MatchChat/MatchChat";
import { SurrenderButton } from "@/features/game/components/SurrenderButton/SurrenderButton";
import { GameOverModal } from "@/features/game/components/GameOverModal/GameOverModal";
import { OnlinePlayersPanel } from "@/features/game/components/OnlinePlayersPanel";
import { ChatMessage, GameOverReason } from "@/features/game/types/game.types";
import { useSocket, useSocketEvent } from "@/features/socket/hooks/useSocket";
import { useAppSelector } from "@/store/hooks";

interface SocketRoomStatePayload {
  room: {
    id: string;
    boardSize: number;
    winCondition: number;
    board: string[][];
    currentTurn: string;
    status: string;
    winnerId: string | null;
    reason?: GameOverReason;
    players: {
      userId: string;
      username: string;
      symbol: "X" | "O";
    }[];
  };
}

interface SocketGameStartPayload {
  room: SocketRoomStatePayload["room"];
  playerX: { userId: string; username: string };
  playerO: { userId: string; username: string };
  currentTurn: { userId: string; username: string; symbol: "X" | "O" };
}

interface SocketGameOverPayload {
  winnerId: string | null;
  reason: GameOverReason;
}

const BOARD_SIZES = [
  { size: 3, label: "Classic 3×3", description: "Win with 3 in a row", winOptions: [3] },
  { size: 6, label: "Pro 6×6", description: "Win with 4 in a row", winOptions: [3, 4] },
  { size: 9, label: "Expert 9×9", description: "Win with 5 in a row", winOptions: [3, 4, 5] },
  { size: 11, label: "Master 11×11", description: "Win with 5 in a row", winOptions: [4, 5] },
  { size: 15, label: "Mega 15×15", description: "Win with 5 in a row", winOptions: [5] },
];

export const GamePage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const socket = useSocket();
  
  // Current user info from redux
  const { user } = useAppSelector((state) => state.auth);
  const currentUserId = user?.id || "my-id";
  const currentUsername = user?.username || "You";

  // Room config
  const [boardSize, setBoardSize] = useState<number>(9);
  const [winCondition, setWinCondition] = useState<number>(5);
  
  // Game states
  const [board, setBoard] = useState<string[][]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("");
  const [currentPlayerSymbol, setCurrentPlayerSymbol] = useState<"X" | "O" | "">("");
  const [mySymbol, setMySymbol] = useState<"X" | "O" | "">(""); 
  
  // Matchmaking & Setup states
  const [roomStatus, setRoomStatus] = useState<string>("waiting");
  const [players, setPlayers] = useState<any[]>([]);
  const [proposal, setProposal] = useState<{ boardSize: number; winCondition: number; proposerId: string } | null>(null);
  const [opponentHover, setOpponentHover] = useState<{ row: number | null; col: number | null } | null>(null);

  // Lobby players for inviting
  const [lobbyPlayers, setLobbyPlayers] = useState<any[]>([]);
  const [totalOnline, setTotalOnline] = useState<number>(0);

  // Player info
  const [playerXInfo, setPlayerXInfo] = useState({ username: "Player X", userId: "" });
  const [playerOInfo, setPlayerOInfo] = useState({ username: "Player O", userId: "" });
  
  // Scores (static placeholders for UI)
  const [myScore] = useState(12);
  const [opponentScore] = useState(14);

  // Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(30);
  
  // Winner states
  const [gameOver, setGameOver] = useState(false);
  const [isGameOverModalDismissed, setIsGameOverModalDismissed] = useState(false);
  const [winnerSymbol, setWinnerSymbol] = useState<"X" | "O" | "DRAW">("X");
  const [gameOverReason, setGameOverReason] = useState<GameOverReason>("normal");
  const [winningCells, setWinningCells] = useState<{ row: number; col: number }[]>([]);

  // Join room through Socket when entering page
  useEffect(() => {
    if (!roomId) return;
    
    // Connect socket if not connected
    if (!socket.connected) {
      socket.connect();
    }

    // Join room
    socket.emit("join_room", { roomId });
    socket.emit("get_lobby_players");

    return () => {
      // Clear game board state on clean up
    };
  }, [roomId, socket]);

  // Listen to lobby players updates
  useSocketEvent<any>("lobby_players", (data) => {
    setLobbyPlayers(data.players);
    setTotalOnline(data.totalOnline);
  });

  // Timer tick updates from socket or locally
  useSocketEvent<{ timeLeft: number }>("timer_tick", (data) => {
    setTimeLeft(data.timeLeft);
  });

  // Room state listener (for waiting state and player list updates)
  useSocketEvent<any>("room_state", (data) => {
    const { room } = data;
    setBoardSize(room.boardSize);
    setWinCondition(room.winCondition);
    setBoard(room.board);
    setRoomStatus(room.status);
    setPlayers(room.players);

    const playerX = room.players.find((p: any) => p.symbol === 'X');
    const playerO = room.players.find((p: any) => p.symbol === 'O');
    
    if (playerX) {
      setPlayerXInfo({ username: playerX.username, userId: playerX.userId });
    } else {
      setPlayerXInfo({ username: "Đã thoát", userId: "" });
    }
    
    if (playerO) {
      setPlayerOInfo({ username: playerO.username, userId: playerO.userId });
    } else {
      setPlayerOInfo({ username: "Đã thoát", userId: "" });
    }

    let computedMySymbol: "X" | "O" | "" = "";
    if (playerX && playerX.userId === currentUserId) {
      computedMySymbol = "X";
      setMySymbol("X");
    } else if (playerO && playerO.userId === currentUserId) {
      computedMySymbol = "O";
      setMySymbol("O");
    } else if (mySymbol) {
      computedMySymbol = mySymbol;
    }

    if (room.status === "finished") {
      setGameOver(true);
      if (room.winnerId === "draw") {
        setWinnerSymbol("DRAW");
      } else {
        if (room.winnerId === currentUserId) {
          setWinnerSymbol(computedMySymbol || "X");
        } else {
          setWinnerSymbol(computedMySymbol === "X" ? "O" : "X");
        }
      }
      if (room.reason) {
        setGameOverReason(room.reason);
      }
    } else {
      setGameOver((prev) => (prev ? prev : false));
    }
  });

  // Proposal listener
  useSocketEvent<any>("board_size_proposed", (data) => {
    setProposal({ boardSize: data.boardSize, winCondition: data.winCondition, proposerId: data.proposedBy });
  });

  useSocketEvent<any>("board_size_confirmed", () => {
    setProposal(null);
  });

  useSocketEvent<any>("board_size_declined", () => {
    setProposal(null);
  });

  // Opponent hover listener
  useSocketEvent<any>("opponent_hovered", (data) => {
    setOpponentHover({ row: data.row, col: data.col });
  });

  // Start game event listener
  useSocketEvent<SocketGameStartPayload>("game_start", (data) => {
    const { room, playerX, playerO, currentTurn } = data;
    setBoardSize(room.boardSize);
    setWinCondition(room.winCondition);
    setBoard(room.board);
    setCurrentPlayerId(currentTurn.userId);
    setCurrentPlayerSymbol(currentTurn.symbol);
    setPlayerXInfo(playerX);
    setPlayerOInfo(playerO);
    setGameOver(false);
    setIsGameOverModalDismissed(false);
    setWinningCells([]);
    setRoomStatus(room.status);
    setPlayers(room.players);
    
    // Find my symbol
    if (playerX.userId === currentUserId) {
      setMySymbol("X");
    } else if (playerO.userId === currentUserId) {
      setMySymbol("O");
    }
  });

  // Board move updates from server
  useSocketEvent<SocketRoomStatePayload>("move_update", (data) => {
    const { room } = data;
    setBoard(room.board);
    setCurrentPlayerId(room.currentTurn);
    
    const activePlayer = room.players.find((p) => p.userId === room.currentTurn);
    if (activePlayer) {
      setCurrentPlayerSymbol(activePlayer.symbol);
    }
    setTimeLeft(30);
  });

  // Game over event listener
  useSocketEvent<SocketGameOverPayload>("game_over", (data) => {
    const { winnerId, reason } = data;
    setGameOver(true);
    setGameOverReason(reason);
    
    if (winnerId === "draw") {
      setWinnerSymbol("DRAW");
    } else {
      if (winnerId === currentUserId) {
        setWinnerSymbol(mySymbol || "X");
      } else {
        setWinnerSymbol(mySymbol === "X" ? "O" : "X");
      }
    }
  });

  // Countdown timer local tick fallback if server timer tick is not active
  useEffect(() => {
    if (gameOver || !currentPlayerId) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayerId, gameOver]);

  // Handle cell click (Emits make_move socket event)
  const handleCellClick = (row: number, col: number) => {
    if (gameOver || currentPlayerId !== currentUserId) return;
    if (board[row] && board[row][col] !== "") return;

    // Send action to server
    socket.emit("make_move", {
      roomId,
      row,
      col,
    });
  };

  // Chat send callback
  const handleSendMessage = (text: string) => {
    // Send via socket message if supported, currently fall back to mock layout append
    const newMsg: ChatMessage = {
      id: String(messages.length + 1),
      senderId: currentUserId,
      senderUsername: currentUsername,
      message: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    socket.emit("chat_message", { roomId, message: text });
  };

  useSocketEvent<ChatMessage>("chat_received", (msg) => {
    if (msg.senderId !== currentUserId) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  // Surrender callback
  const handleSurrender = () => {
    socket.emit("surrender", { roomId });
  };

  const handleInvitePlayer = (targetUserId: string) => {
    socket.emit("invite_player", { roomId, targetUserId });
  };

  // Determine opponent name
  const opponentName = currentUserId === playerXInfo.userId ? playerOInfo.username : playerXInfo.username;
  const isMyTurn = currentPlayerId === currentUserId;

  if (roomStatus === "waiting") {
    return (
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch py-8">
        
        {/* Left Column: Online Players for Invitation */}
        <div className="col-span-1 lg:col-span-3 flex flex-col h-[600px]">
          <OnlinePlayersPanel
            players={lobbyPlayers.filter(p => !p.isPlaying)}
            totalOnline={totalOnline}
            currentUserId={currentUserId}
            showInviteButton={players.length < 2}
            onInvite={handleInvitePlayer}
          />
        </div>

        {/* Center Column: Room Status & Configuration */}
        <div className="col-span-1 lg:col-span-6 flex flex-col justify-between glass-panel p-8 rounded-3xl shadow-2xl border border-white/20 text-center relative h-[600px]">
          <div>
            <button
              onClick={() => {
                socket.emit("leave_room", { roomId });
                navigate("/lobby");
              }}
              className="absolute top-6 right-6 flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 rounded-2xl font-quicksand font-bold text-xs transition-all hover:scale-105 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Thoát
            </button>

            <h1 className="font-quicksand font-bold text-headline-sm text-on-surface mb-6 pr-20 text-left">
              Phòng chuẩn bị: #{roomId}
            </h1>

            {/* Sơ đồ 2 người chơi */}
            <div className="flex items-center justify-around my-6 relative bg-surface-container-low/40 p-6 rounded-3xl border border-outline-variant/10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-headline-sm relative">
                  X
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface animate-pulse" />
                </div>
                <div>
                  <p className="font-quicksand font-bold text-label-bold text-on-surface">
                    {players[0]?.username || "Người chơi 1"}
                  </p>
                  <p className="text-xs text-on-surface-variant">Chủ phòng</p>
                </div>
              </div>

              <div className="font-quicksand font-bold text-label-bold text-on-surface-variant bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/10">
                VS
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20 text-secondary font-bold text-headline-sm relative">
                  {players[1] ? "O" : "?"}
                  {players[1] && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-surface animate-pulse" />
                  )}
                </div>
                <div>
                  <p className="font-quicksand font-bold text-label-bold text-on-surface">
                    {players[1]?.username || "Đang chờ đối thủ..."}
                  </p>
                  <p className="text-xs text-on-surface-variant">Khách</p>
                </div>
              </div>
            </div>

            {players.length < 2 ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                <p className="font-nunito text-on-surface-variant text-sm max-w-sm">
                  Đang chờ người chơi khác tham gia. Bạn có thể sử dụng danh sách bên trái để mời người chơi online vào phòng.
                </p>
              </div>
            ) : proposal ? (
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  <p className="font-quicksand font-bold text-sm">Đề xuất cấu hình mới</p>
                </div>
                <p className="font-nunito text-on-surface-variant text-xs">
                  {proposal.proposerId === currentUserId ? (
                    <span>Đang chờ đối thủ đồng ý: Bàn cờ <strong>{proposal.boardSize}x{proposal.boardSize}</strong>, Điều kiện thắng <strong>{proposal.winCondition}</strong> quân.</span>
                  ) : (
                    <span>Đối thủ muốn đổi cấu hình thành: Bàn cờ <strong>{proposal.boardSize}x{proposal.boardSize}</strong>, Điều kiện thắng <strong>{proposal.winCondition}</strong> quân.</span>
                  )}
                </p>
                {proposal.proposerId !== currentUserId && (
                  <div className="flex gap-2 w-full mt-1">
                    <button
                      onClick={() => socket.emit("confirm_board_size", { roomId, boardSize: proposal.boardSize, winCondition: proposal.winCondition })}
                      className="flex-1 py-2 bg-primary text-on-primary font-quicksand font-bold text-xs rounded-xl shadow-md hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      Đồng ý
                    </button>
                    <button
                      onClick={() => socket.emit("decline_board_size", { roomId })}
                      className="flex-1 py-2 border border-outline-variant/40 text-on-surface-variant font-quicksand font-bold text-xs rounded-xl hover:bg-red-500/5 hover:text-error hover:border-red-400/40 transition-all"
                    >
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 text-left">
                {/* Chọn kích thước bàn cờ */}
                <div>
                  <p className="font-quicksand font-bold text-xs text-on-surface mb-2">
                    Chọn kích thước bàn cờ
                  </p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[3, 6, 9, 11, 15].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          const conf = BOARD_SIZES.find((b) => b.size === size);
                          const win = conf ? conf.winOptions[conf.winOptions.length - 1] : 5;
                          socket.emit("propose_board_size", { roomId, boardSize: size, winCondition: win });
                        }}
                        className={`py-2 rounded-xl border text-center transition-all ${
                          boardSize === size
                            ? "bg-primary/10 border-primary text-primary font-bold shadow-md shadow-primary/5"
                            : "glass-panel border-outline-variant/30 text-on-surface-variant hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        <div className="font-quicksand text-xs font-bold">{size}x{size}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chọn điều kiện thắng */}
                <div>
                  <p className="font-quicksand font-bold text-xs text-on-surface mb-2">
                    Chọn điều kiện thắng (số quân liên tiếp)
                  </p>
                  <div className="flex gap-2">
                    {(BOARD_SIZES.find((b) => b.size === boardSize)?.winOptions || [5]).map((win) => (
                      <button
                        key={win}
                        disabled={winCondition === win}
                        onClick={() => {
                          socket.emit("propose_board_size", { roomId, boardSize: boardSize, winCondition: win });
                        }}
                        className={`flex-1 py-2 rounded-xl font-quicksand text-xs font-bold transition-all ${
                          winCondition === win
                            ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/25 opacity-100 cursor-not-allowed"
                            : "glass-panel text-on-surface-variant border border-outline-variant/30 hover:border-primary/30 hover:text-primary"
                        }`}
                      >
                        {win} quân
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {/* Thông tin config hiện tại */}
            <div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-4 flex justify-between text-left items-center">
              <div>
                <p className="font-quicksand font-bold text-xs text-on-surface">Cấu hình hiện tại</p>
                <p className="text-[11px] text-on-surface-variant">Bàn cờ {boardSize}x{boardSize}</p>
              </div>
              <div>
                <p className="font-quicksand font-bold text-xs text-on-surface">Điều kiện thắng</p>
                <p className="text-[11px] text-on-surface-variant">{winCondition} quân liên tiếp</p>
              </div>
            </div>

            {/* Nút Bắt đầu */}
            {players.length >= 2 && (
              <button
                onClick={() => socket.emit("start_game", { roomId })}
                disabled={!!proposal}
                className="w-full py-3 bg-primary text-on-primary font-quicksand font-bold text-label-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-99 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bắt đầu chơi
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Match Chat */}
        <div className="col-span-1 lg:col-span-3 flex flex-col h-[600px]">
          <MatchChat
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
          />
        </div>

        {/* Game Over Outcome Modal */}
        <GameOverModal
          isOpen={gameOver && !isGameOverModalDismissed}
          winnerSymbol={winnerSymbol}
          mySymbol={mySymbol || "X"}
          reason={gameOverReason}
          opponentName={opponentName}
          onPlayAgain={() => {
            setGameOver(false);
            setIsGameOverModalDismissed(false);
            socket.emit("play_again", { roomId });
          }}
          onLeaveRoom={() => {
            socket.emit("leave_room", { roomId });
            navigate("/lobby");
          }}
          onClose={() => setIsGameOverModalDismissed(true)}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Top Bar for room status */}
      <div className="col-span-1 lg:col-span-12 glass-panel rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4 border border-outline-variant/20 shadow-md">
        <div>
          <h2 className="font-quicksand font-bold text-lg text-primary">
            Room: #{roomId || "WAITING"}
          </h2>
          <p className="text-xs text-on-surface-variant">
            Win Condition: {winCondition} in a row
          </p>
        </div>
        <div className="flex items-center gap-3">
          {gameOver && isGameOverModalDismissed && (
            <button
              onClick={() => setIsGameOverModalDismissed(false)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/25 rounded-full font-quicksand font-bold text-xs transition-all hover:scale-105 active:scale-95 animate-pulse"
            >
              <span className="material-symbols-outlined text-[16px]">info</span>
              Xem kết quả
            </button>
          )}
          <div className="text-xs bg-surface-container px-3 py-1.5 rounded-full font-quicksand font-bold text-on-surface-variant border border-outline-variant/10">
            Kích thước bàn cờ: {boardSize}x{boardSize}
          </div>
          <button
            onClick={() => {
              socket.emit("leave_room", { roomId });
              navigate("/lobby");
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/25 rounded-full font-quicksand font-bold text-xs transition-all hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            Thoát phòng
          </button>
        </div>
      </div>

      {/* Left Column: Player Info & Timer */}
      <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-2 lg:order-1">
        <PlayerCard
          username={currentUsername}
          symbol={mySymbol || "X"}
          score={myScore}
          level={42}
          isActive={!gameOver && isMyTurn}
          isCurrentUser={true}
        />
        <TurnTimer
          timeLeft={timeLeft}
          maxTime={30}
          symbolColor={currentPlayerSymbol || "X"}
        />
      </div>

      {/* Center Column: Game Board */}
      <div className="col-span-1 lg:col-span-6 flex flex-col items-center justify-center gap-6 order-1 lg:order-2">
       <GameBoard
          board={board}
          boardSize={boardSize}
          onCellClick={handleCellClick}
          onCellHover={(row, col) => socket.emit("hover_cell", { roomId, row, col })}
          opponentHover={opponentHover}
          opponentSymbol={mySymbol === "X" ? "O" : "X"}
          winningCells={winningCells}
          disabled={gameOver || !isMyTurn}
          currentPlayerSymbol={mySymbol || "X"}
        />
        <div className="w-full flex justify-center">
          <SurrenderButton onSurrender={handleSurrender} disabled={gameOver} />
        </div>
      </div>

      {/* Right Column: Opponent & Chat */}
      <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 order-3">
        <PlayerCard
          username={opponentName}
          symbol={mySymbol === "X" ? "O" : "X"}
          score={opponentScore}
          level={99}
          isActive={!gameOver && !isMyTurn && !!currentPlayerId}
          isCurrentUser={false}
        />
        <MatchChat
          messages={messages}
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
        />
      </div>

      {/* Game Over Outcome Modal */}
      <GameOverModal
        isOpen={gameOver && !isGameOverModalDismissed}
        winnerSymbol={winnerSymbol}
        mySymbol={mySymbol || "X"}
        reason={gameOverReason}
        opponentName={opponentName}
        onPlayAgain={() => {
          setGameOver(false);
          setIsGameOverModalDismissed(false);
          socket.emit("play_again", { roomId });
        }}
        onLeaveRoom={() => {
          socket.emit("leave_room", { roomId });
          navigate("/lobby");
        }}
        onClose={() => setIsGameOverModalDismissed(true)}
      />
    </div>
  );
};
