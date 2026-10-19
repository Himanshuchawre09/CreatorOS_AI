import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CollaborationAnalytics } from '../models/collaborationAnalytics.model';
import { CollaborationRequest } from '../models/collaborationRequest.model';
import { AppError } from '../utils/AppError';
import { upsertAnalyticsSchema } from '../validations/calendarReviews.validation';

export const upsertAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = upsertAnalyticsSchema.parse(req.body);

    const collab = await CollaborationRequest.findById(validated.collaborationId);
    if (!collab) {
      throw AppError.notFound('Collaboration request not found');
    }

    const userId = req.user._id.toString();
    const brandId = (collab.brand || collab.sender).toString();
    const creatorId = (collab.creator || collab.recipient).toString();

    const isParticipant =
      brandId === userId || creatorId === userId || req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this collaboration');
    }

    const analytics = await CollaborationAnalytics.findOneAndUpdate(
      { collaborationRequest: collab._id },
      {
        collaborationRequest: collab._id,
        creator: collab.creator || collab.recipient,
        brand: collab.brand || collab.sender,
        views: validated.views,
        reach: validated.reach,
        clicks: validated.clicks,
        engagement: validated.engagement,
        notes: validated.notes,
        lastReportedAt: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      data: analytics,
      message: 'Campaign analytics recorded successfully (self-reported)',
    });
  } catch (error) {
    next(error);
  }
};

export const getAnalyticsByCollaboration = async (
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

    const collab = await CollaborationRequest.findById(collaborationId);
    if (!collab) {
      throw AppError.notFound('Collaboration not found');
    }

    const userId = req.user._id.toString();
    const brandId = (collab.brand || collab.sender).toString();
    const creatorId = (collab.creator || collab.recipient).toString();

    const isParticipant =
      brandId === userId || creatorId === userId || req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You do not have access to this collaboration');
    }

    const analytics = await CollaborationAnalytics.findOne({
      collaborationRequest: collab._id,
    });

    res.status(200).json({
      success: true,
      data: analytics || {
        collaborationRequest: collab._id,
        views: 0,
        reach: 0,
        clicks: 0,
        engagement: 0,
        hasData: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAnalyticsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const userId = req.user._id;

    const records = await CollaborationAnalytics.find({
      $or: [{ creator: userId }, { brand: userId }],
    })
      .populate({
        path: 'collaborationRequest',
        select: 'campaign status',
        populate: { path: 'campaign', select: 'title budget' },
      })
      .sort({ updatedAt: -1 })
      .lean();

    const summary = records.reduce(
      (acc, curr) => {
        acc.totalViews += curr.views || 0;
        acc.totalReach += curr.reach || 0;
        acc.totalClicks += curr.clicks || 0;
        acc.totalEngagement += curr.engagement || 0;
        return acc;
      },
      {
        totalViews: 0,
        totalReach: 0,
        totalClicks: 0,
        totalEngagement: 0,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        summary,
        records,
        totalCollaborations: records.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
