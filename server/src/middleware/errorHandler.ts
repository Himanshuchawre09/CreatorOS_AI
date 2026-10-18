import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const currentEnv = process.env.NODE_ENV || env.NODE_ENV;
  const isDev = currentEnv === 'development';
  const isProd = currentEnv === 'production';

  // Server-side logging
  logger.error(`Error: ${err.message}`, {
    name: err.name,
    stack: err.stack,
  });

  // Handle known operational AppError
  if (err instanceof AppError) {
    if (isDev) {
      res.status(err.statusCode).json({
        success: false,
        status: 'error',
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
        stack: err.stack,
      });
      return;
    }

    // In production and test: return just { success: false, status, message }
    res.status(err.statusCode).json({
      success: false,
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    if (isDev) {
      const formattedErrors = err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        status: 'fail',
        message: 'Validation failed',
        errors: formattedErrors,
        stack: err.stack,
      });
      return;
    }

    // In production and test: return just { success: false, status, message }
    res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Validation failed',
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      status: 'fail',
      message: isProd ? 'Invalid identifier' : `Invalid ${err.path}: ${err.value}`,
      ...(isDev ? { stack: err.stack } : {}),
    });
    return;
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Database validation failed',
      ...(isDev ? { stack: err.stack } : {}),
    });
    return;
  }

  // Handle Mongo duplicate key error (code 11000)
  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      status: 'fail',
      message: 'Duplicate key error: A record with that value already exists.',
      ...(isDev ? { stack: err.stack } : {}),
    });
    return;
  }

  // Fallback for unexpected (non-operational) errors
  // In production, return generic message "Something went wrong" and log real error server-side only
  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    status: 'error',
    message: isProd ? 'Something went wrong' : err.message,
    ...(isDev ? { stack: err.stack } : {}),
  });
};
