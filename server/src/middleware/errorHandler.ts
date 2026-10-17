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
  logger.error(`Error: ${err.message}`, {
    name: err.name,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Handle known operational AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      status: 'error',
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Validation failed',
      errors: formattedErrors,
    });
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId, etc.)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      status: 'fail',
      message: `Invalid ${err.path}: ${err.value}`,
    });
    return;
  }

  // Handle Mongoose ValidationError
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((el) => el.message);
    res.status(400).json({
      success: false,
      status: 'fail',
      message: 'Database validation failed',
      errors,
    });
    return;
  }

  // Handle Mongo duplicate key error (code 11000)
  if ((err as { code?: number }).code === 11000) {
    res.status(409).json({
      success: false,
      status: 'fail',
      message: 'Duplicate key error: A record with that value already exists.',
    });
    return;
  }

  // Fallback for unhandled unexpected errors
  const statusCode = 500;
  res.status(statusCode).json({
    success: false,
    status: 'error',
    message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
