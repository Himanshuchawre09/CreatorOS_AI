import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/db';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  // Connect to MongoDB
  await connectDatabase();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 CreatorOS AI Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    logger.info(`👉 Health check available at: http://localhost:${env.PORT}/api/health`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    logger.info(`${signal} received. Initiating graceful shutdown...`);
    
    server.close(async () => {
      logger.info('HTTP server closed.');
      await disconnectDatabase();
      logger.info('Cleanup complete. Exiting process.');
      process.exit(0);
    });

    // Force exit if shutdown takes too long
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error('Fatal error starting server:', error);
  process.exit(1);
});
