import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BrandProfile } from '../models';
import { AppError } from '../utils/AppError';
import { brandQuerySchema } from '../validations/profile.validation';
import { escapeRegex } from '../utils/sanitize';

export const getBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedQuery = brandQuerySchema.parse(req.query);
    const { q, industry, page, limit } = validatedQuery;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 12;
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = { isPublic: true };

    if (industry && industry.trim()) {
      filter.industry = { $regex: new RegExp(`^${escapeRegex(industry.trim())}$`, 'i') };
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { companyName: searchRegex },
        { about: searchRegex },
        { industry: searchRegex },
      ];
    }

    const [brands, total] = await Promise.all([
      BrandProfile.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      BrandProfile.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: brands,
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

export const getBrandById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Brand profile not found');
    }

    const objectId = new mongoose.Types.ObjectId(id);

    const brand = await BrandProfile.findOne({
      $or: [{ _id: objectId }, { user: objectId }],
    }).lean();

    if (!brand) {
      throw AppError.notFound('Brand profile not found');
    }

    const isOwner = req.user && req.user._id.toString() === brand.user.toString();
    if (!brand.isPublic && !isOwner) {
      throw AppError.notFound('Brand profile not found');
    }

    res.status(200).json({
      success: true,
      brand,
    });
  } catch (error) {
    next(error);
  }
};
