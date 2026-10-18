import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/AppError';
import { env } from './config/env';
import { logger } from './utils/logger';

export const createApp = (): Application => {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration - allow credentials only from CLIENT_URL origin in env
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Cookie Parser for JWT authentication
  app.use(cookieParser());

  // Standard Body Parsing
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
