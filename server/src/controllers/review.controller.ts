import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/review.model';
import { CollaborationRequest } from '../models/collaborationRequest.model';
import { Contract } from '../models/contract.model';
import { AppError } from '../utils/AppError';
import { sendNotification } from '../utils/notification';
import { createReviewSchema } from '../validations/calendarReviews.validation';

export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = createReviewSchema.parse(req.body);

    const collab = await CollaborationRequest.findById(validated.collaborationId);
    if (!collab) {
      throw AppError.notFound('Collaboration not found');
    }

    const userId = req.user._id.toString();
    const brandId = (collab.brand || collab.sender).toString();
    const creatorId = (collab.creator || collab.recipient).toString();

    const isParticipant = brandId === userId || creatorId === userId;
    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this collaboration');
    }

    // Determine reviewee (counterparty)
    const revieweeId = userId === brandId ? creatorId : brandId;

    // Check duplicate review
    const existing = await Review.findOne({
      collaborationRequest: collab._id,
      reviewer: req.user._id,
    });

    if (existing) {
      throw AppError.badRequest(
        'You have already submitted a review for this collaboration'
      );
    }

    const review = await Review.create({
      collaborationRequest: collab._id,
      reviewer: req.user._id,
      reviewee: new mongoose.Types.ObjectId(revieweeId),
      rating: validated.rating,
      comment: validated.comment,
    });

    const populated = await Review.findById(review._id)
      .populate('reviewer', 'name role avatarUrl')
      .populate('reviewee', 'name role avatarUrl');

    // Notify reviewee
    await sendNotification({
      recipient: new mongoose.Types.ObjectId(revieweeId),
      sender: req.user._id,
      type: 'general',
      title: 'New Review Received',
      message: `${req.user.name} left you a ${validated.rating}-star review: "${validated.comment.substring(0, 70)}"`,
      link: '/reviews',
    });

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Review submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw AppError.notFound('User not found');
    }

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name role orgName avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
            ).toFixed(1)
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        totalReviews,
        averageRating,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewsForCollaboration = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { collaborationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(collaborationId)) {
      throw AppError.notFound('Collaboration not found');
    }

    const reviews = await Review.find({
      collaborationRequest: collaborationId,
    })
      .populate('reviewer', 'name role orgName avatarUrl')
      .populate('reviewee', 'name role orgName avatarUrl')
      .lean();

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};
