import { configureStore } from '@reduxjs/toolkit';
// Import slices from features here
// import authReducer from '../features/auth/slices/authSlice';
// import gameReducer from '../features/game/slices/gameSlice';

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // game: gameReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
