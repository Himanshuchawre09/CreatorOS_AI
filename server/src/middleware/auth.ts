import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyToken, AUTH_COOKIE_NAME } from '../utils/auth';
import { User, IUser, UserRole } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME] || req.signedCookies?.[AUTH_COOKIE_NAME];
    const headerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const token = cookieToken || headerToken;

    if (!token) {
      throw AppError.unauthorized('Authentication required');
    }

    let decoded: { userId: string; role: UserRole };
    try {
      decoded = verifyToken(token);
    } catch {
      throw AppError.unauthorized('Invalid or expired authentication token');
    }

    if (!decoded || !decoded.userId) {
      throw AppError.unauthorized('Invalid authentication token');
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw AppError.unauthorized('User not found');
    }

    if (user.status === 'suspended') {
      throw AppError.forbidden('User account is suspended');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cookieToken = req.cookies?.[AUTH_COOKIE_NAME] || req.signedCookies?.[AUTH_COOKIE_NAME];
    const headerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    const token = cookieToken || headerToken;

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId);
        if (user && user.status !== 'suspended') {
          req.user = user;
        }
      }
    } catch {
      // Ignore token verification errors for optional auth
    }

    next();
  } catch {
    next();
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(AppError.forbidden('Access denied: insufficient permissions'));
    }

    next();
  };
};
