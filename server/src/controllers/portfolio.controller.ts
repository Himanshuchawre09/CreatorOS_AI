import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { PortfolioItem } from '../models';
import { AppError } from '../utils/AppError';
import { portfolioItemSchema, portfolioUpdateSchema } from '../validations/profile.validation';

export const getMyPortfolio = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const items = await PortfolioItem.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const createPortfolioItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = portfolioItemSchema.parse(req.body);

    const item = await PortfolioItem.create({
      ...validated,
      owner: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePortfolioItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Portfolio item not found');
    }

    const item = await PortfolioItem.findById(id);
    if (!item) {
      throw AppError.notFound('Portfolio item not found');
    }

    // Owner check: only the owner may modify
    if (item.owner.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('You are not authorized to update this portfolio item');
    }

    const validated = portfolioUpdateSchema.parse(req.body);
    Object.assign(item, validated);
    await item.save();

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePortfolioItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Portfolio item not found');
    }

    const item = await PortfolioItem.findById(id);
    if (!item) {
      throw AppError.notFound('Portfolio item not found');
    }

    // Owner check: only the owner may modify/delete
    if (item.owner.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('You are not authorized to delete this portfolio item');
    }

    await PortfolioItem.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Portfolio item deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

