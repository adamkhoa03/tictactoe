import { Request, Response } from 'express';
import { RegisterUser } from '../../use-cases/auth/RegisterUser';
import { LoginUser } from '../../use-cases/auth/LoginUser';
import { registerSchema, loginSchema } from '../../schemas/auth.schema';
import { ZodError } from 'zod';

export class AuthController {
  constructor(
    private registerUser: RegisterUser,
    private loginUser: LoginUser
  ) {}

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const parsedBody = registerSchema.parse(req.body);

      const result = await this.registerUser.execute(parsedBody);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request body
      const parsedBody = loginSchema.parse(req.body);

      const result = await this.loginUser.execute(parsedBody);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  };

  private handleError(res: Response, error: any): void {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
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
      message,
    });
  }
}
