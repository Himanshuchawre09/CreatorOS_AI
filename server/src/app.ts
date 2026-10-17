import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/AppError';
import { env } from './config/env';
import { logger } from './utils/logger';

export const createApp = (): Application => {
  const app = express();

  // CORS Configuration
  const allowedOrigins = [
    env.CLIENT_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin) || env.NODE_ENV === 'development') {
          callback(null, true);
        } else {
          callback(new Error(`Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Standard Middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic Request Logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });

  // Base API Info Route
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'CreatorOS AI Backend API',
      version: '0.1.0',
      status: 'active',
      docs: '/api/health',
    });
  });

  // Mount API Routes
  app.use('/api', apiRouter);

  // Catch-all 404 handler for unmatched routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(AppError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
  });

  // Central Error Handler Middleware
  app.use(errorHandler);

  return app;
};
