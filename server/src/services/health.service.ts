import { getDatabaseStatus, DatabaseStatus } from '../config/db';
import { env } from '../config/env';

export interface HealthCheckResult {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  database: DatabaseStatus;
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
}

export class HealthService {
  static getHealthStatus(): HealthCheckResult {
    const memory = process.memoryUsage();
    const dbStatus = getDatabaseStatus();

    // The service is 'ok' if server is up, degraded if database is down
    const status = dbStatus.isConnected ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: env.NODE_ENV,
      version: '0.1.0',
      database: dbStatus,
      memory: {
        heapUsedMB: Math.round((memory.heapUsed / 1024 / 1024) * 100) / 100,
        heapTotalMB: Math.round((memory.heapTotal / 1024 / 1024) * 100) / 100,
        rssMB: Math.round((memory.rss / 1024 / 1024) * 100) / 100,
      },
    };
  }
}
