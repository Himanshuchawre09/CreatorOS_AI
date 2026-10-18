import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { connectDatabase, disconnectDatabase } from '../config/db';
import { logger } from '../utils/logger';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const seedAdmin = async (): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    logger.error('ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables.');
    process.exit(1);
  }

  try {
    await connectDatabase();

    const normalizedEmail = adminEmail.toLowerCase().trim();
    const existingAdmin = await User.findOne({ email: normalizedEmail });

    if (existingAdmin) {
      logger.info(`Admin user already exists with email: ${normalizedEmail}`);
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: 'System Admin',
        email: normalizedEmail,
        passwordHash,
        role: 'admin',
        status: 'active',
      });
      logger.info(`Admin user created successfully with email: ${normalizedEmail}`);
    }

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error(`Error during admin seeding: ${error instanceof Error ? error.message : error}`);
    await disconnectDatabase().catch(() => {});
    process.exit(1);
  }
};

void seedAdmin();

