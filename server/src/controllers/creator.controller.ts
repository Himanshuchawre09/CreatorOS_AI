import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CreatorProfile, PortfolioItem } from '../models';
import { AppError } from '../utils/AppError';
import { creatorQuerySchema } from '../validations/profile.validation';
import { escapeRegex } from '../utils/sanitize';

export const getCreators = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedQuery = creatorQuerySchema.parse(req.query);
    const {
      q,
      niche,
      platform,
      minFollowers,
      maxFollowers,
      page,
      limit,
    } = validatedQuery;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 12;
    const skip = (pageNum - 1) * limitNum;

    // Filter strictly by isPublic: true
    const filter: Record<string, any> = { isPublic: true };

    if (niche && niche.trim()) {
      filter.niche = { $regex: new RegExp(`^${escapeRegex(niche.trim())}$`, 'i') };
    }

    if (platform && platform.trim()) {
      filter['platforms.platform'] = platform.trim().toLowerCase();
    }

    if (minFollowers !== undefined || maxFollowers !== undefined) {
      filter.totalFollowers = {};
      if (minFollowers !== undefined) {
        filter.totalFollowers.$gte = minFollowers;
      }
      if (maxFollowers !== undefined) {
        filter.totalFollowers.$lte = maxFollowers;
      }
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { displayName: searchRegex },
        { bio: searchRegex },
        { niche: searchRegex },
      ];
    }

    const [creators, total] = await Promise.all([
      CreatorProfile.find(filter)
        .sort({ totalFollowers: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CreatorProfile.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: creators,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCreatorById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Creator profile not found');
    }

    const objectId = new mongoose.Types.ObjectId(id);

    // Look up by CreatorProfile _id or associated User _id
    const creator = await CreatorProfile.findOne({
      $or: [{ _id: objectId }, { user: objectId }],
    }).lean();

    if (!creator) {
      throw AppError.notFound('Creator profile not found');
    }

    // Private profiles are hidden from discovery and /:id for other users
    const isOwner = req.user && req.user._id.toString() === creator.user.toString();
    if (!creator.isPublic && !isOwner) {
      throw AppError.notFound('Creator profile not found');
    }

    // Fetch associated portfolio items
    const portfolio = await PortfolioItem.find({ owner: creator.user })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      creator,
      portfolio,
    });
  } catch (error) {
    next(error);
  }
};
