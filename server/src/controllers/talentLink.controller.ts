import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { TalentLink } from '../models/talentLink.model';
import { User } from '../models/user.model';
import { CreatorProfile } from '../models/creatorProfile.model';
import { AppError } from '../utils/AppError';

export const inviteCreatorSchema = z
  .object({
    creatorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID').optional(),
    creatorEmail: z.string().email().optional(),
    notes: z.string().max(300).optional(),
  })
  .strict()
  .refine((data) => data.creatorId || data.creatorEmail, {
    message: 'Either creatorId or creatorEmail must be provided',
  });

export const respondInviteSchema = z
  .object({
    action: z.enum(['accept', 'decline']),
  })
  .strict();

export const inviteCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }
    if (req.user.role !== 'talentManager' && req.user.role !== 'admin') {
      throw AppError.forbidden('Only talent managers can send representation invites');
    }

    const validated = inviteCreatorSchema.parse(req.body);

    let creatorUser;
    if (validated.creatorId) {
      creatorUser = await User.findOne({ _id: validated.creatorId, role: 'creator' });
    } else if (validated.creatorEmail) {
      creatorUser = await User.findOne({
        email: validated.creatorEmail.toLowerCase().trim(),
        role: 'creator',
      });
    }

    if (!creatorUser) {
      throw AppError.notFound('Creator not found or specified user is not a creator');
    }

    const existing = await TalentLink.findOne({
      talentManager: req.user._id,
      creator: creatorUser._id,
    });

    if (existing) {
      throw AppError.conflict('An invite or representation link already exists for this creator');
    }

    const link = await TalentLink.create({
      talentManager: req.user._id,
      creator: creatorUser._id,
      status: 'pending',
      notes: validated.notes,
    });

    const populated = await TalentLink.findById(link._id)
      .populate('creator', 'name email avatarUrl')
      .populate('talentManager', 'name email orgName');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Representation invite sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getTalentLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    let filter: any = {};
    if (req.user.role === 'talentManager') {
      filter.talentManager = req.user._id;
    } else if (req.user.role === 'creator') {
      filter.creator = req.user._id;
    } else if (req.user.role === 'admin') {
      // admin can view all
    } else {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    const links = await TalentLink.find(filter)
      .populate('creator', 'name email avatarUrl')
      .populate('talentManager', 'name email orgName')
      .sort({ createdAt: -1 })
      .lean();

    // Attach creator profile data if manager is viewing
    const creatorIds = links.map((l: any) => l.creator?._id).filter(Boolean);
    const profiles = await CreatorProfile.find({ user: { $in: creatorIds } }).lean();
    const profileMap = new Map(profiles.map((p: any) => [p.user.toString(), p]));

    const enriched = links.map((l: any) => ({
      ...l,
      creatorProfile: l.creator?._id ? profileMap.get(l.creator._id.toString()) : undefined,
    }));

    res.status(200).json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToInvite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw AppError.badRequest('Invalid talent link ID');
    }

    const validated = respondInviteSchema.parse(req.body);

    const link = await TalentLink.findById(id);
    if (!link) {
      throw AppError.notFound('Talent link not found');
    }

    // Only the targeted creator can accept or decline
    if (link.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      throw AppError.forbidden('Only the invited creator can respond to this invite');
    }

    if (link.status !== 'pending') {
      throw AppError.badRequest(`Invite has already been ${link.status}`);
    }

    link.status = validated.action === 'accept' ? 'accepted' : 'declined';
    await link.save();

    const updated = await TalentLink.findById(link._id)
      .populate('creator', 'name email avatarUrl')
      .populate('talentManager', 'name email orgName');

    res.status(200).json({
      success: true,
      data: updated,
      message: `Invite successfully ${link.status}`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTalentLink = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { id } = req.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      throw AppError.badRequest('Invalid talent link ID');
    }

    const link = await TalentLink.findById(id);
    if (!link) {
      throw AppError.notFound('Talent link not found');
    }

    const isParty =
      link.talentManager.toString() === req.user._id.toString() ||
      link.creator.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParty) {
      throw AppError.forbidden('Not authorized to remove this representation link');
    }

    await TalentLink.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Representation link removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
