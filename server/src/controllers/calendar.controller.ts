import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CalendarPost } from '../models/calendarPost.model';
import { AppError } from '../utils/AppError';
import {
  createCalendarPostSchema,
  updateCalendarPostSchema,
  calendarQuerySchema,
} from '../validations/calendarReviews.validation';

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = createCalendarPostSchema.parse(req.body);

    const post = await CalendarPost.create({
      owner: req.user._id,
      collaborationRequest: validated.collaborationId
        ? new mongoose.Types.ObjectId(validated.collaborationId)
        : undefined,
      title: validated.title,
      description: validated.description,
      platform: validated.platform,
      scheduledDate: validated.scheduledDate,
      status: validated.status,
    });

    const populated = await CalendarPost.findById(post._id).populate(
      'collaborationRequest',
      'campaign'
    );

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Calendar post scheduled successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { month, year, platform, status } = calendarQuerySchema.parse(
      req.query
    );

    const filter: any = { owner: req.user._id };

    if (month && year) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      filter.scheduledDate = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (platform) {
      filter.platform = platform;
    }

    if (status) {
      filter.status = status;
    }

    const posts = await CalendarPost.find(filter)
      .populate('collaborationRequest', 'campaign')
      .sort({ scheduledDate: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: posts,
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (
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
      throw AppError.notFound('Calendar post not found');
    }

    const post = await CalendarPost.findById(id).populate(
      'collaborationRequest',
      'campaign'
    );

    if (!post) {
      throw AppError.notFound('Calendar post not found');
    }

    if (
      post.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw AppError.forbidden('You do not have access to this calendar post');
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (
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
      throw AppError.notFound('Calendar post not found');
    }

    const post = await CalendarPost.findById(id);
    if (!post) {
      throw AppError.notFound('Calendar post not found');
    }

    if (
      post.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw AppError.forbidden('Only the post owner can update it');
    }

    const validated = updateCalendarPostSchema.parse(req.body);

    if (validated.title) post.title = validated.title;
    if (validated.description !== undefined)
      post.description = validated.description;
    if (validated.platform) post.platform = validated.platform;
    if (validated.scheduledDate) post.scheduledDate = validated.scheduledDate;
    if (validated.status) post.status = validated.status;

    await post.save();

    const populated = await CalendarPost.findById(post._id).populate(
      'collaborationRequest',
      'campaign'
    );

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Calendar post updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (
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
      throw AppError.notFound('Calendar post not found');
    }

    const post = await CalendarPost.findById(id);
    if (!post) {
      throw AppError.notFound('Calendar post not found');
    }

    if (
      post.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      throw AppError.forbidden('Only the post owner can delete it');
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Calendar post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
