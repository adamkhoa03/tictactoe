import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SocketState {
  isConnected: boolean;
  error: string | null;
}

const initialState: SocketState = {
  isConnected: false,
  error: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setConnectionError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setConnected, setConnectionError } = socketSlice.actions;
export default socketSlice.reducer;
