import { Request, Response } from 'express';

export const getHealthStatus = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend server is healthy and running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
};
