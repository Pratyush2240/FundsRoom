import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { env } from '../config/env';

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
}

export const generateToken = (payload: AuthUserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '24h',
  });
};

export const verifyToken = (token: string): AuthUserPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
};
