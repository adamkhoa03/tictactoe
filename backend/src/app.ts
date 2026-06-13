import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TicTacToe Backend is running' });
});

// REST Routes can be attached here in the future
// e.g. app.use('/api/auth', authRouter);

export default app;
