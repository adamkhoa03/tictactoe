import { Response, NextFunction } from 'express';
import { TokenManager } from '../../../shared/TokenManager';
import { AuthRequest } from './auth.types';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = TokenManager.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
