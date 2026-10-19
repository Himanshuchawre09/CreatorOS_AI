import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { CollaborationRequest, Campaign, User, Contract } from '../models';
import { AppError } from '../utils/AppError';
import {
  createRequestSchema,
  respondRequestSchema,
  requestQuerySchema,
} from '../validations/collaborationRequest.validation';

export const createCollaborationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = createRequestSchema.parse(req.body);
    const { campaignId, recipientId, pitch, proposedRate, currency } = validated;

    if (!mongoose.Types.ObjectId.isValid(campaignId)) {
      throw AppError.badRequest('Invalid campaign identifier');
    }

    if (!mongoose.Types.ObjectId.isValid(recipientId)) {
      throw AppError.badRequest('Invalid recipient identifier');
    }

    if (req.user._id.toString() === recipientId) {
      throw AppError.badRequest('Cannot send a collaboration request to yourself');
    }

    const [campaign, recipient] = await Promise.all([
      Campaign.findById(campaignId),
      User.findById(recipientId),
    ]);

    if (!campaign) {
      throw AppError.notFound('Campaign not found');
    }

    if (!recipient) {
      throw AppError.notFound('Recipient user not found');
    }

    let brandId: mongoose.Types.ObjectId;
    let creatorId: mongoose.Types.ObjectId;

    // Check sender role and campaign ownership/status
    if (req.user.role === 'brand') {
      if (campaign.brand.toString() !== req.user._id.toString()) {
        throw AppError.forbidden('You can only send requests for campaigns your brand owns');
      }

      if (recipient.role !== 'creator' && recipient.role !== 'freelancer') {
        throw AppError.badRequest('Recipient must be a creator or freelancer');
      }

      brandId = req.user._id;
      creatorId = recipient._id;
    } else if (req.user.role === 'creator' || req.user.role === 'freelancer') {
      if (campaign.status !== 'open') {
        throw AppError.badRequest('You can only apply to campaigns that are currently open');
      }

      if (recipient._id.toString() !== campaign.brand.toString()) {
        throw AppError.badRequest('Applications must be addressed to the campaign brand owner');
      }

      brandId = campaign.brand;
      creatorId = req.user._id;
    } else {
      throw AppError.forbidden('Only brands and creators can initiate collaboration requests');
    }

    // Check for duplicate request between this campaign and creator
    const existing = await CollaborationRequest.findOne({
      campaign: campaign._id,
      creator: creatorId,
    });

    if (existing) {
      throw AppError.conflict(
        'A collaboration request already exists for this creator and campaign'
      );
    }

    const request = await CollaborationRequest.create({
      campaign: campaign._id,
      brand: brandId,
      creator: creatorId,
      sender: req.user._id,
      recipient: recipient._id,
      pitch,
      proposedRate,
      currency,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getCollaborationRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validatedQuery = requestQuerySchema.parse(req.query);
    const { type, status, page, limit } = validatedQuery;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 12;
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    if (type === 'inbox') {
      filter.recipient = req.user._id;
    } else if (type === 'outbox') {
      filter.sender = req.user._id;
    } else {
      filter.$or = [{ sender: req.user._id }, { recipient: req.user._id }];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const [requests, total] = await Promise.all([
      CollaborationRequest.find(filter)
        .populate('campaign', 'title brief budget currency deadline status deliverables')
        .populate('sender', 'name role orgName')
        .populate('recipient', 'name role orgName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CollaborationRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: requests,
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

export const getCollaborationRequestById = async (
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
      throw AppError.notFound('Collaboration request not found');
    }

    const request = await CollaborationRequest.findById(id)
      .populate('campaign', 'title brief budget currency deadline status deliverables')
      .populate('sender', 'name role orgName')
      .populate('recipient', 'name role orgName')
      .lean();

    if (!request) {
      throw AppError.notFound('Collaboration request not found');
    }

    const isParticipant =
      (request.sender && request.sender._id
        ? request.sender._id.toString()
        : request.sender.toString()) === req.user._id.toString() ||
      (request.recipient && request.recipient._id
        ? request.recipient._id.toString()
        : request.recipient.toString()) === req.user._id.toString();

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this collaboration request');
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToRequest = async (
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
      throw AppError.notFound('Collaboration request not found');
    }

    const validated = respondRequestSchema.parse(req.body);
    const { action } = validated;

    const request = await CollaborationRequest.findById(id);

    if (!request) {
      throw AppError.notFound('Collaboration request not found');
    }

    // Only the recipient can accept or reject
    if (request.recipient.toString() !== req.user._id.toString()) {
      throw AppError.forbidden(
        'Only the recipient can accept or reject this collaboration request'
      );
    }

    // Only pending requests can be accepted or rejected
    if (request.status !== 'pending') {
      throw AppError.badRequest(
        `Cannot respond to a collaboration request that is already ${request.status}`
      );
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    request.respondedAt = new Date();
    await request.save();

    if (action === 'accept') {
      const existingContract = await Contract.findOne({
        collaborationRequest: request._id,
      });

      if (!existingContract) {
        const campaign = await Campaign.findById(request.campaign);
        if (campaign) {
          await Contract.create({
            collaborationRequest: request._id,
            campaign: campaign._id,
            brand: campaign.brand,
            creator: request.creator,
            deliverables: campaign.deliverables || [],
            budget: campaign.budget,
            currency: campaign.currency,
            deadline: campaign.deadline,
            notes: 'Standard collaboration agreement based on campaign brief.',
            status: 'draft',
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: request,
      message: `Collaboration request ${request.status}`,
    });
  } catch (error) {
    next(error);
  }
};

export const withdrawRequest = async (
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
      throw AppError.notFound('Collaboration request not found');
    }

    const request = await CollaborationRequest.findById(id);

    if (!request) {
      throw AppError.notFound('Collaboration request not found');
    }

    // Only the sender can withdraw
    if (request.sender.toString() !== req.user._id.toString()) {
      throw AppError.forbidden(
        'Only the sender can withdraw this collaboration request'
      );
    }

    // Only pending requests can be withdrawn
    if (request.status !== 'pending') {
      throw AppError.badRequest(
        `Cannot withdraw a collaboration request that is already ${request.status}`
      );
    }

    request.status = 'withdrawn';
    await request.save();

    res.status(200).json({
      success: true,
      data: request,
      message: 'Collaboration request withdrawn',
    });
  } catch (error) {
    next(error);
  }
};
