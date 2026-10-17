import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export interface DatabaseStatus {
  isConnected: boolean;
  state: string;
  host?: string;
  name?: string;
}

const connectionStates: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

export const getDatabaseStatus = (): DatabaseStatus => {
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1,
    state: connectionStates[readyState] || 'unknown',
    host: mongoose.connection.host || undefined,
    name: mongoose.connection.name || undefined,
  };
};

export const connectDatabase = async (): Promise<boolean> => {
  try {
    mongoose.set('strictQuery', true);

    logger.info(`Connecting to MongoDB at ${env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}...`);
    
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    logger.info('✅ Successfully connected to MongoDB database');
    return true;
  } catch (error) {
    logger.error('❌ Failed to connect to MongoDB:', error instanceof Error ? error.message : error);
    logger.warn('⚠️ Server will continue running, but database operations will fail until MongoDB is available.');
    return false;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed.');
  } catch (error) {
    logger.error('Error during MongoDB disconnect:', error);
  }
};
