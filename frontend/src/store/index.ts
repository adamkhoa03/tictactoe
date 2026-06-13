import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slices/authSlice';
import socketReducer from '../features/socket/slices/socketSlice';
import gameReducer from '../features/game/slices/gameSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
    game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
