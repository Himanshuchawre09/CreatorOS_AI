import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { signToken, sendAuthCookie, clearAuthCookie, sanitizeUser } from '../utils/auth';
import { registerSchema, loginSchema } from '../validations/auth.validation';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Specifically reject admin role with 403 Forbidden
    if ((req.body?.role as string) === 'admin') {
      throw AppError.forbidden('Admin registration is not allowed');
    }

    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw parseResult.error;
    }

    const { name, email, password, role, orgName } = parseResult.data;

    // Check for existing user with identical email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw AppError.conflict('Email is already registered');
    }

    // Hash password with bcrypt cost 12
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      orgName,
      status: 'active',
    });

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    sendAuthCookie(res, token);

    res.status(201).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw AppError.unauthorized('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw AppError.forbidden('User account is suspended');
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
    });

    sendAuthCookie(res, token);

    res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (_req: Request, res: Response, next: NextFunction): void => {
  try {
    clearAuthCookie(res);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    res.status(200).json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (error) {
    next(error);
  }
};

