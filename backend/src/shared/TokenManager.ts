import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: string;
  username: string;
}

export class TokenManager {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-123456';
  private static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  static generateToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: this.JWT_EXPIRES_IN as any });
  }

  static verifyToken(token: string): TokenPayload {
    return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
  }
}
