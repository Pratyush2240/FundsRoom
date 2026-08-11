import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_FRONTEND_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGINS ?? DEFAULT_FRONTEND_ORIGINS.join(','))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!JWT_SECRET) {
  throw new Error(
    'FATAL: JWT_SECRET environment variable is not set. ' +
    'The application cannot start without a signing secret. ' +
    'Set JWT_SECRET in your .env file.'
  );
}

export const env = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL || '',
  FRONTEND_ORIGINS,
};
