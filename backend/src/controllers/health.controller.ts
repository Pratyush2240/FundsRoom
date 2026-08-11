import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const getHealthStatus = async (req: Request, res: Response) => {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.status(200).json({
    status: 'success',
    message: 'Backend server is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
  });
};
