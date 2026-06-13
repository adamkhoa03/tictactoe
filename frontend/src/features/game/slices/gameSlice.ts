import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// --- Types ---
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
  board: string[][];
  currentTurn: string;
  winnerId: string | null;
  reason?: 'normal' | 'surrender' | 'timeout';
  createdAt: string;
  updatedAt: string;
}

// Thông tin phòng hiển thị ở Lobby (chỉ dữ liệu cơ bản)
export interface PublicRoom {
  id: string;
  boardSize: number;
  winCondition: number;
  hostUsername: string;
  createdAt: string;
}

export interface GameState {
  currentRoom: Room | null;
  waitingRooms: PublicRoom[];
  timeLeft: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: GameState = {
  currentRoom: null,
  waitingRooms: [],
  timeLeft: 30,
  isLoading: false,
  error: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<Room | null>) => {
      state.currentRoom = action.payload;
    },
    setWaitingRooms: (state, action: PayloadAction<PublicRoom[]>) => {
      state.waitingRooms = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTimeLeft: (state, action: PayloadAction<number>) => {
      state.timeLeft = action.payload;
    },
    clearGame: (state) => {
      state.currentRoom = null;
      state.timeLeft = 30;
      state.error = null;
    },
  },
});

export const { setCurrentRoom, setWaitingRooms, setLoading, setError, setTimeLeft, clearGame } = gameSlice.actions;
export default gameSlice.reducer;
