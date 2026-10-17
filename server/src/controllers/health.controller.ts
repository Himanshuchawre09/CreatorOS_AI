import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service';

export const getHealth = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const health = HealthService.getHealthStatus();
    // Return 200 OK even if degraded so monitors can inspect detailed JSON
    res.status(200).json({
      success: true,
      data: health,
    });
  } catch (error) {
    next(error);
  }
};
