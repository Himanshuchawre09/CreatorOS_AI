import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BrandProfile } from '../models';
import { AppError } from '../utils/AppError';

export const getBrands = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, industry, page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(24, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = { isPublic: true };

    if (industry && typeof industry === 'string' && industry.trim()) {
      filter.industry = { $regex: new RegExp(`^${industry.trim()}$`, 'i') };
    }

    if (q && typeof q === 'string' && q.trim()) {
      const searchRegex = new RegExp(q.trim(), 'i');
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
