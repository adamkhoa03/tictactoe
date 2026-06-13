import { Request } from 'express';
import { TokenPayload } from '../../../shared/TokenManager';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}
