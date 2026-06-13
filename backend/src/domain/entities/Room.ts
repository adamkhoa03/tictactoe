export type RoomStatus = 'waiting' | 'playing' | 'finished';
export type PlayerSymbol = 'X' | 'O';

export interface RoomPlayer {
  userId: string;
  username: string;
  symbol: PlayerSymbol;
}

export interface Room {
  id: string;
  boardSize: number;
  winCondition: number;
  players: RoomPlayer[];
  status: RoomStatus;
  board: string[][]; // Bàn cờ 2D, các ô chứa: '', 'X', hoặc 'O'
  currentTurn: string; // userId của người chơi đang đến lượt
  winnerId: string | null; // userId của người thắng, 'draw' khi hòa, hoặc null khi đang chơi
  reason?: 'normal' | 'surrender' | 'timeout';
  createdAt: Date;
  updatedAt: Date;
}
