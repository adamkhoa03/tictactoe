import { Request, Response } from 'express';
import { RegisterUser } from '../../use-cases/auth/RegisterUser';
import { LoginUser } from '../../use-cases/auth/LoginUser';
import { IUserRepository } from '../../use-cases/repositories/IUserRepository';
import { AuthRequest } from '../../infrastructure/webserver/middlewares/auth.types';
import { registerSchema, loginSchema } from '../../schemas/auth.schema';
import { ZodError } from 'zod';
import { t } from '../../shared/i18n';

export class AuthController {
  constructor(
    private registerUser: RegisterUser,
    private loginUser: LoginUser,
    private userRepository: IUserRepository
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const parsedBody = registerSchema.parse(req.body);

      const result = await this.registerUser.execute(parsedBody);
      const { token, user } = result;

      this.setCookie(res, token);

      res.status(201).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      this.handleError(req, res, error);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const parsedBody = loginSchema.parse(req.body);

      const result = await this.loginUser.execute(parsedBody);
      const { token, user } = result;

      this.setCookie(res, token);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error: any) {
      this.handleError(req, res, error);
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      this.clearCookie(res);
      res.status(200).json({
        success: true,
        message: t(req, 'Logged out successfully'),
      });
    } catch (error: any) {
      this.handleError(req, res, error);
    }
  };

  me = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          success: false,
          message: t(req, 'Not authenticated'),
        });
        return;
      }

      const user = await this.userRepository.findById(req.user.userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: t(req, 'User not found'),
        });
        return;
      }

      // Strip password
      const { password, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        data: { user: userWithoutPassword },
      });
    } catch (error: any) {
      this.handleError(req, res, error);
    }
  };

  private setCookie(res: Response, token: string): void {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  private clearCookie(res: Response): void {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  private handleError(req: Request, res: Response, error: any): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: t(req, 'Validation failed'),
        errors: error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
      return;
    }

    const message = error.message || 'Internal server error';
    let statusCode = 400;

    if (message.includes('already taken') || message.includes('already registered')) {
      statusCode = 409;
    } else if (message.includes('Invalid username/email or password')) {
      statusCode = 401;
    }

    res.status(statusCode).json({
      success: false,
      message: t(req, message),
    });
  }
}
