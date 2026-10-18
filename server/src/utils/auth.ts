import jwt, { SignOptions } from 'jsonwebtoken';
import { Response, CookieOptions } from 'express';
import { env } from '../config/env';
import { IUser, UserRole } from '../models/user.model';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export const AUTH_COOKIE_NAME = 'token';

export const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
});

export const signToken = (payload: JwtPayload): string => {
  const options: SignOptions = {
    expiresIn: (env.JWT_EXPIRES_IN as any) || '7d',
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const sendAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
};

export const sanitizeUser = (user: IUser | Record<string, any>) => {
  const userObj = typeof (user as any).toObject === 'function' ? (user as any).toObject() : { ...user };
  delete userObj.passwordHash;
  delete userObj.__v;
  return userObj;
};

