import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Campaign, CampaignStatus, BrandProfile, User } from '../models';
import { AppError } from '../utils/AppError';
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignQuerySchema,
} from '../validations/campaign.validation';
import { escapeRegex } from '../utils/sanitize';

const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  draft: ['open', 'cancelled'],
  open: ['draft', 'inProgress', 'cancelled'],
  inProgress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const createCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (req.user.role !== 'brand') {
      throw AppError.forbidden('Only brands can create campaigns');
    }

    const validated = createCampaignSchema.parse(req.body);

    const campaign = await Campaign.create({
      ...validated,
      brand: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const getCampaigns = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validatedQuery = campaignQuerySchema.parse(req.query);
    const { q, status, minBudget, maxBudget, page, limit } = validatedQuery;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 12;
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    // Brands manage their own campaigns; creators and others view OPEN campaigns only
    if (req.user.role === 'brand') {
      filter.brand = req.user._id;
      if (status && status !== 'all') {
        filter.status = status;
      }
    } else {
      // Creators, freelancers, talent managers can list OPEN campaigns only
      filter.status = 'open';
    }

    if (minBudget !== undefined || maxBudget !== undefined) {
      filter.budget = {};
      if (minBudget !== undefined) filter.budget.$gte = minBudget;
      if (maxBudget !== undefined) filter.budget.$lte = maxBudget;
    }

    if (q && q.trim()) {
      const searchRegex = new RegExp(escapeRegex(q.trim()), 'i');
      filter.$or = [
        { title: searchRegex },
        { brief: searchRegex },
        { audience: searchRegex },
      ];
    }

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .populate('brand', 'name email orgName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Campaign.countDocuments(filter),
    ]);

    // Sanitize brand emails from responses for security
    const sanitized = campaigns.map((c) => {
      if (c.brand && typeof c.brand === 'object' && 'email' in c.brand) {
        const { email, ...restBrand } = c.brand as Record<string, any>;
        return { ...c, brand: restBrand };
      }
      return c;
    });

    res.status(200).json({
      success: true,
      data: sanitized,
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

export const getCampaignById = async (
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
      throw AppError.notFound('Campaign not found');
    }

    const campaign = await Campaign.findById(id)
      .populate('brand', 'name orgName')
      .lean();

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    const isOwner = campaign.brand && campaign.brand._id
      ? campaign.brand._id.toString() === req.user._id.toString()
      : campaign.brand.toString() === req.user._id.toString();

    // If viewer is not the brand owner, they can ONLY view OPEN campaigns
    if (!isOwner) {
      if (campaign.status !== 'open') {
        throw AppError.notFound('Campaign not found');
      }
    }

    // Attach brand profile details if available
    const brandProfile = await BrandProfile.findOne({
      user: campaign.brand._id || campaign.brand,
    }).lean();

    res.status(200).json({
      success: true,
      data: {
        ...campaign,
        brandProfile: brandProfile
          ? {
              companyName: brandProfile.companyName,
              industry: brandProfile.industry,
              website: brandProfile.website,
              about: brandProfile.about,
              logoUrl: brandProfile.logoUrl,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (req.user.role !== 'brand') {
      throw AppError.forbidden('Only brands can update campaigns');
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Campaign not found');
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    if (campaign.brand.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('You are not authorized to update this campaign');
    }

    const validated = updateCampaignSchema.parse(req.body);

    // Enforce legal status transitions
    if (validated.status && validated.status !== campaign.status) {
      const allowed = ALLOWED_TRANSITIONS[campaign.status];
      if (!allowed || !allowed.includes(validated.status)) {
        throw AppError.badRequest(
          `Invalid status transition from "${campaign.status}" to "${validated.status}". Allowed: [${allowed.join(', ')}]`
        );
      }
    }

    // If campaign is in a terminal state, don't allow general modifications
    if ((campaign.status === 'completed' || campaign.status === 'cancelled') && !validated.status) {
      throw AppError.badRequest(`Cannot modify a ${campaign.status} campaign`);
    }

    Object.assign(campaign, validated);
    await campaign.save();

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (req.user.role !== 'brand') {
      throw AppError.forbidden('Only brands can delete campaigns');
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw AppError.notFound('Campaign not found');
    }

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    if (campaign.brand.toString() !== req.user._id.toString()) {
      throw AppError.forbidden('You are not authorized to delete this campaign');
    }

    // Only draft campaigns can be permanently deleted; open/in-progress should be cancelled
    if (campaign.status === 'draft') {
      await Campaign.findByIdAndDelete(id);
    } else {
      campaign.status = 'cancelled';
      await campaign.save();
    }

    res.status(200).json({
      success: true,
      message: campaign.status === 'cancelled'
        ? 'Campaign cancelled successfully'
        : 'Campaign deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
