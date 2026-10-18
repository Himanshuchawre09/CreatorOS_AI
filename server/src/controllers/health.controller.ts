import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service';

export const getHealth = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const health = HealthService.getHealthStatus();
    // Trimmed public response returning only status and timestamp
    res.status(200).json({
      status: health.status,
      timestamp: health.timestamp,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiagnostics = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const diagnostics = HealthService.getHealthStatus();
    res.status(200).json({
      success: true,
      data: diagnostics,
    });
  } catch (error) {
    next(error);
  }
};
