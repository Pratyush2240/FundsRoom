import { Request, Response } from 'express';
import { loginSchema } from '../validations/auth.validation';
import { AuthService } from '../services/auth.service';

export const login = async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: parseResult.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  try {
    const result = await AuthService.login(parseResult.data);
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
      });
    }

    console.error('Login Error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred during authentication',
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authenticated',
    });
  }

  return res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};
