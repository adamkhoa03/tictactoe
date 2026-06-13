import { Response, NextFunction } from 'express';
import { TokenManager } from '../../../shared/TokenManager';
import { AuthRequest } from './auth.types';
import { t } from '../../../shared/i18n';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  let token = req.cookies?.token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: t(req, 'Authorization token required') });
    return;
  }

  try {
    const decoded = TokenManager.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: t(req, 'Invalid or expired token') });
  }
};

