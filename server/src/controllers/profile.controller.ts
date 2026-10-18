import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import {
  CreatorProfile,
  BrandProfile,
  FreelancerProfile,
  TalentManagerProfile,
} from '../models';
import {
  creatorProfileSchema,
  brandProfileSchema,
  freelancerProfileSchema,
  talentManagerProfileSchema,
} from '../validations/profile.validation';

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const userId = req.user._id;
    let profile = null;

    switch (req.user.role) {
      case 'creator':
        profile = await CreatorProfile.findOne({ user: userId });
        break;
      case 'brand':
        profile = await BrandProfile.findOne({ user: userId });
        break;
      case 'freelancer':
        profile = await FreelancerProfile.findOne({ user: userId });
        break;
      case 'talentManager':
        profile = await TalentManagerProfile.findOne({ user: userId });
        break;
      case 'admin':
        profile = null;
        break;
      default:
        throw AppError.badRequest('Unknown user role');
    }

    res.status(200).json({
      success: true,
      role: req.user.role,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const userId = req.user._id;
    let updatedProfile = null;

    switch (req.user.role) {
      case 'creator': {
        const validated = creatorProfileSchema.parse(req.body);
        const totalFollowers = validated.platforms.reduce(
          (sum, p) => sum + (Number(p.followers) || 0),
          0
        );

        updatedProfile = await CreatorProfile.findOneAndUpdate(
          { user: userId },
          { ...validated, user: userId, totalFollowers },
          { new: true, upsert: true, runValidators: true }
        );
        break;
      }
      case 'brand': {
        const validated = brandProfileSchema.parse(req.body);
        updatedProfile = await BrandProfile.findOneAndUpdate(
          { user: userId },
          { ...validated, user: userId },
          { new: true, upsert: true, runValidators: true }
        );
        break;
      }
      case 'freelancer': {
        const validated = freelancerProfileSchema.parse(req.body);
        updatedProfile = await FreelancerProfile.findOneAndUpdate(
          { user: userId },
          { ...validated, user: userId },
          { new: true, upsert: true, runValidators: true }
        );
        break;
      }
      case 'talentManager': {
        const validated = talentManagerProfileSchema.parse(req.body);
        updatedProfile = await TalentManagerProfile.findOneAndUpdate(
          { user: userId },
          { ...validated, user: userId },
          { new: true, upsert: true, runValidators: true }
        );
        break;
      }
      default:
        throw AppError.badRequest('Profiles are not configurable for this role');
    }

    res.status(200).json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

