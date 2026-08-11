import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import customerRoutes from './routes/customer.routes';
import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import challanRoutes from './routes/challan.routes';
import { env } from './config/env';

const app = express();

// Middleware
const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // Requests made outside a browser (such as local health checks) have no Origin header.
    if (!origin || env.FRONTEND_ORIGINS.includes(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/challans', challanRoutes);

// Centralized 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Centralized Error Handling Middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;
