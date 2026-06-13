import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRouter from './infrastructure/webserver/routes/auth.routes';
import roomRouter from './infrastructure/webserver/routes/room.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// API Health Check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TicTacToe Backend is running' });
});

// REST Routes
app.use('/api/auth', authRouter);
app.use('/api/rooms', roomRouter);

export default app;
