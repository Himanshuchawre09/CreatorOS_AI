import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/user.model';
import { Campaign } from '../models/campaign.model';
import { Contract } from '../models/contract.model';
import { Submission } from '../models/submission.model';
import { CreatorProfile } from '../models/creatorProfile.model';
import { BrandProfile } from '../models/brandProfile.model';
import { AppError } from '../utils/AppError';
import { escapeRegex } from '../utils/sanitize';

export const listUsersQuerySchema = z
  .object({
    q: z
      .string()
      .max(100)
      .optional()
      .refine((val) => val === undefined || typeof val === 'string', {
        message: 'q must be a plain string',
      }),
    role: z
      .enum(['creator', 'brand', 'freelancer', 'talentManager', 'admin'])
      .optional()
      .refine((val) => val === undefined || typeof val === 'string', {
        message: 'role must be a plain string',
      }),
    status: z
      .enum(['active', 'suspended'])
      .optional()
      .refine((val) => val === undefined || typeof val === 'string', {
        message: 'status must be a plain string',
      }),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(20),
  })
  .strict();

export const updateUserStatusSchema = z
  .object({
    status: z.enum(['active', 'suspended']),
  })
  .strict();

export const updateVisibilitySchema = z
  .object({
    isPublic: z.boolean(),
  })
  .strict();

export const listUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = listUsersQuerySchema.parse(req.query);
    const { q, role, status, page, limit } = validated;

    const filter: any = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (q && q.trim().length > 0) {
      const escaped = escapeRegex(q.trim());
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
        { orgName: { $regex: escaped, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw AppError.badRequest('Invalid user ID');
    }

    const validated = updateUserStatusSchema.parse(req.body);

    if (req.user && req.user._id.toString() === id && validated.status === 'suspended') {
      throw AppError.badRequest('Cannot suspend your own admin account');
    }

    const user = await User.findById(id);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    user.status = validated.status;
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        orgName: user.orgName,
      },
      message: `User status successfully updated to ${validated.status}`,
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      creatorsCount,
      brandsCount,
      freelancersCount,
      talentManagersCount,
      adminsCount,
      activeUsersCount,
      suspendedUsersCount,
      totalCampaigns,
      openCampaigns,
      inProgressCampaigns,
      completedCampaigns,
      totalContracts,
      signedContracts,
      totalSubmissions,
      pendingReviewSubmissions,
    ] = await Promise.all([
      User.countDocuments({ role: 'creator' }),
      User.countDocuments({ role: 'brand' }),
      User.countDocuments({ role: 'freelancer' }),
      User.countDocuments({ role: 'talentManager' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      Campaign.countDocuments({}),
      Campaign.countDocuments({ status: 'open' }),
      Campaign.countDocuments({ status: 'inProgress' }),
      Campaign.countDocuments({ status: 'completed' }),
      Contract.countDocuments({}),
      Contract.countDocuments({ status: 'signed' }),
      Submission.countDocuments({}),
      Submission.countDocuments({ status: 'pending_review' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: activeUsersCount + suspendedUsersCount,
          active: activeUsersCount,
          suspended: suspendedUsersCount,
          byRole: {
            creator: creatorsCount,
            brand: brandsCount,
            freelancer: freelancersCount,
            talentManager: talentManagersCount,
            admin: adminsCount,
          },
        },
        campaigns: {
          total: totalCampaigns,
          open: openCampaigns,
          inProgress: inProgressCampaigns,
          completed: completedCampaigns,
        },
        contracts: {
          total: totalContracts,
          signed: signedContracts,
        },
        submissions: {
          total: totalSubmissions,
          pendingReview: pendingReviewSubmissions,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfileVisibility = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { type, id } = req.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw AppError.badRequest('Invalid profile ID');
    }

    if (type !== 'creator' && type !== 'brand') {
      throw AppError.badRequest("Profile type must be 'creator' or 'brand'");
    }

    const validated = updateVisibilitySchema.parse(req.body);

    let updatedProfile;
    if (type === 'creator') {
      updatedProfile = await CreatorProfile.findByIdAndUpdate(
        id,
        { isPublic: validated.isPublic },
        { new: true }
      );
    } else {
      updatedProfile = await BrandProfile.findByIdAndUpdate(
        id,
        { isPublic: validated.isPublic },
        { new: true }
      );
    }

    if (!updatedProfile) {
      throw AppError.notFound(`${type} profile not found`);
    }

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: `${type} profile visibility set to ${validated.isPublic ? 'public' : 'hidden'}`,
    });
  } catch (error) {
    next(error);
  }
};
