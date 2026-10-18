import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CreatorProfile, PortfolioItem } from '../models';
import { AppError } from '../utils/AppError';

export const getCreators = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      q,
      niche,
      platform,
      minFollowers,
      maxFollowers,
      page = '1',
      limit = '12',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(24, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Filter strictly by isPublic: true
    const filter: Record<string, any> = { isPublic: true };

    if (niche && typeof niche === 'string' && niche.trim()) {
      filter.niche = { $regex: new RegExp(`^${niche.trim()}$`, 'i') };
    }

    if (platform && typeof platform === 'string' && platform.trim()) {
      filter['platforms.platform'] = platform.trim().toLowerCase();
    }

    const minF = minFollowers ? Number(minFollowers) : undefined;
    const maxF = maxFollowers ? Number(maxFollowers) : undefined;

    if (minF !== undefined || maxF !== undefined) {
      filter.totalFollowers = {};
      if (minF !== undefined && !isNaN(minF)) {
        filter.totalFollowers.$gte = minF;
      }
      if (maxF !== undefined && !isNaN(maxF)) {
        filter.totalFollowers.$lte = maxF;
      }
    }

    if (q && typeof q === 'string' && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
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
