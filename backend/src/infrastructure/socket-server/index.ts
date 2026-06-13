import http from 'http';
import { Server } from 'socket.io';
import { registerSocketHandlers } from '../../adapters/socket';
import { TokenManager, TokenPayload } from '../../shared/TokenManager';

let io: Server | null = null;

export interface SocketData {
  user?: TokenPayload;
}

export function initSocketServer(server: http.Server): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Socket.io authentication middleware
  io.use((socket, next) => {
    let token = socket.handshake.auth?.token;

    // If token not provided in handshake auth, check cookies
    if (!token) {
      const cookieHeader = socket.handshake.headers.cookie;
      if (cookieHeader) {
        const cookies = parseCookies(cookieHeader);
        token = cookies['token'];
      }
    }

    // In TicTacToe, players must be authenticated to join rooms and play.
    if (!token) {
      return next(new Error('Authentication error: Token required'));
    }

    try {
      const decoded = TokenManager.verifyToken(token);
      socket.data = {
        ...socket.data,
        user: decoded,
      };
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // Register socket event handlers
  registerSocketHandlers(io);

  return io;
}

export function getSocketServer(): Server {
  if (!io) {
    throw new Error('Socket.io server has not been initialized');
  }
  return io;
}

function parseCookies(cookieString: string): Record<string, string> {
  const list: Record<string, string> = {};
  cookieString.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts[0].trim();
    if (name) {
      list[name] = decodeURIComponent((parts[1] || '').trim());
    }
  });
  return list;
}
