import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Message } from '../models/message.model';
import { CollaborationRequest } from '../models/collaborationRequest.model';
import { Contract } from '../models/contract.model';
import { AppError } from '../utils/AppError';
import { sendNotification } from '../utils/notification';

export const getMessagesQuerySchema = z
  .object({
    collaborationId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid collaboration ID')
      .refine((val) => typeof val === 'string', {
        message: 'collaborationId must be a plain string',
      }),
    limit: z.coerce.number().int().positive().max(100).default(50),
  })
  .strict();

export const createMessageSchema = z
  .object({
    collaborationId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid collaboration ID'),
    content: z
      .string()
      .min(1, 'Message cannot be empty')
      .max(1000, 'Message cannot exceed 1000 characters')
      .trim(),
  })
  .strict();

// Helper to resolve collaboration and check participant permission
async function resolveCollaborationAndVerifyParticipant(
  collaborationId: string,
  userId: string
): Promise<{
  collab: any;
  recipientId: string;
}> {
  // First check CollaborationRequest
  let collab = await CollaborationRequest.findById(collaborationId);
  if (!collab) {
    // Check Contract
    const contract = await Contract.findById(collaborationId);
    if (contract) {
      collab = await CollaborationRequest.findById(contract.collaborationRequest);
    }
  }

  if (!collab) {
    throw AppError.notFound('Collaboration thread not found');
  }

  const senderId = collab.sender ? collab.sender.toString() : '';
  const recipientId = collab.recipient ? collab.recipient.toString() : '';
  const brandId = collab.brand ? collab.brand.toString() : '';
  const creatorId = collab.creator ? collab.creator.toString() : '';

  const isParticipant =
    userId === senderId ||
    userId === recipientId ||
    userId === brandId ||
    userId === creatorId;

  if (!isParticipant) {
    throw AppError.forbidden('You are not a participant in this collaboration');
  }

  // Determine counterparty
  const counterpartyId = userId === senderId ? recipientId : senderId;

  return { collab, recipientId: counterpartyId };
}

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { collaborationId, limit } = getMessagesQuerySchema.parse(req.query);
    const { collab } = await resolveCollaborationAndVerifyParticipant(
      collaborationId,
      req.user._id.toString()
    );

    const messages = await Message.find({ collaborationRequest: collab._id })
      .populate('sender', 'name avatarUrl')
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    // Mark counterparty's unread messages as read
    await Message.updateMany(
      {
        collaborationRequest: collab._id,
        sender: { $ne: req.user._id },
        read: false,
      },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = createMessageSchema.parse(req.body);
    const { collab, recipientId } = await resolveCollaborationAndVerifyParticipant(
      validated.collaborationId,
      req.user._id.toString()
    );

    const message = await Message.create({
      collaborationRequest: collab._id,
      sender: req.user._id,
      content: validated.content,
      read: false,
    });

    const populated = await Message.findById(message._id).populate('sender', 'name avatarUrl');

    // Notify the other participant
    if (recipientId) {
      await sendNotification({
        recipient: recipientId,
        sender: req.user._id,
        type: 'new_message',
        title: 'New Collaboration Message',
        message: `${req.user.name}: "${validated.content.substring(0, 80)}"`,
        link: `/messages?collaborationId=${collab._id}`,
      });
    }

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const userId = req.user._id;

    // Find all collaborations where the user is a participant
    const collabs = await CollaborationRequest.find({
      $or: [{ sender: userId }, { recipient: userId }, { brand: userId }, { creator: userId }],
    })
      .populate('campaign', 'title budget deliverables')
      .populate('brand', 'name orgName avatarUrl')
      .populate('creator', 'name avatarUrl')
      .populate('sender', 'name avatarUrl')
      .populate('recipient', 'name avatarUrl')
      .sort({ updatedAt: -1 })
      .lean();

    // Fetch latest message and unread count for each collaboration
    const conversations = await Promise.all(
      collabs.map(async (c: any) => {
        const [lastMessage, unreadCount] = await Promise.all([
          Message.findOne({ collaborationRequest: c._id })
            .sort({ createdAt: -1 })
            .lean(),
          Message.countDocuments({
            collaborationRequest: c._id,
            sender: { $ne: userId },
            read: false,
          }),
        ]);

        const partner =
          c.sender?._id.toString() === userId.toString() ? c.recipient : c.sender;

        return {
          collaborationId: c._id,
          campaign: c.campaign,
          status: c.status,
          partner,
          lastMessage,
          unreadCount,
          updatedAt: lastMessage ? lastMessage.createdAt : c.updatedAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};
