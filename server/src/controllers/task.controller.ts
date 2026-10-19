import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task, CollaborationRequest, Contract } from '../models';
import { AppError } from '../utils/AppError';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../validations/task.validation';

// Helper to resolve participants for a collaboration (either CollaborationRequest or Contract)
async function getCollaborationAndParticipants(collaborationId: string): Promise<{
  collaborationRequest: any;
  participantIds: string[];
}> {
  if (!mongoose.Types.ObjectId.isValid(collaborationId)) {
    throw AppError.notFound('Collaboration not found');
  }

  // First try CollaborationRequest
  let colReq = await CollaborationRequest.findById(collaborationId);
  if (colReq) {
    const p1 = colReq.sender.toString();
    const p2 = colReq.recipient.toString();
    const p3 = colReq.creator ? colReq.creator.toString() : null;
    const participants = Array.from(new Set([p1, p2, p3].filter(Boolean) as string[]));
    return { collaborationRequest: colReq, participantIds: participants };
  }

  // Try Contract
  const contract = await Contract.findById(collaborationId);
  if (contract) {
    colReq = await CollaborationRequest.findById(contract.collaborationRequest);
    const p1 = contract.brand.toString();
    const p2 = contract.creator.toString();
    const participants = Array.from(new Set([p1, p2]));
    return {
      collaborationRequest: colReq || { _id: contract.collaborationRequest },
      participantIds: participants,
    };
  }

  throw AppError.notFound('Collaboration not found');
}

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validatedQuery = taskQuerySchema.parse(req.query);
    const { collaborationId, status } = validatedQuery;

    const filter: Record<string, any> = {};

    if (collaborationId) {
      const { participantIds, collaborationRequest } =
        await getCollaborationAndParticipants(collaborationId);

      const isParticipant =
        participantIds.includes(req.user._id.toString()) ||
        req.user.role === 'admin';

      if (!isParticipant) {
        throw AppError.forbidden('You are not a participant in this collaboration');
      }

      filter.collaborationRequest = collaborationRequest._id;
    } else {
      // Find all collaboration requests where user is participant
      if (req.user.role !== 'admin') {
        const userCollaborations = await CollaborationRequest.find({
          $or: [{ sender: req.user._id }, { recipient: req.user._id }],
          status: 'accepted',
        }).select('_id');

        const colIds = userCollaborations.map((c) => c._id);
        filter.collaborationRequest = { $in: colIds };
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const tasks = await Task.find(filter)
      .populate('assignee', 'name email role orgName')
      .populate('creator', 'name role')
      .sort({ order: 1, createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = createTaskSchema.parse(req.body);
    const { collaborationId, title, description, assigneeId, dueDate, status } =
      validated;

    const { participantIds, collaborationRequest } =
      await getCollaborationAndParticipants(collaborationId);

    const isParticipant =
      participantIds.includes(req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this collaboration');
    }

    // Verify assignee is among participants
    if (!participantIds.includes(assigneeId)) {
      throw AppError.badRequest(
        'Assignee must be an active participant in this collaboration'
      );
    }

    const task = await Task.create({
      collaborationRequest: collaborationRequest._id,
      title,
      description: description || '',
      assignee: assigneeId,
      creator: req.user._id,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status || 'todo',
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role orgName')
      .populate('creator', 'name role');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Task created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
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
      throw AppError.notFound('Task not found');
    }

    const task = await Task.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    const { participantIds } = await getCollaborationAndParticipants(
      task.collaborationRequest.toString()
    );

    const isParticipant =
      participantIds.includes(req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this collaboration');
    }

    const validated = updateTaskSchema.parse(req.body);

    if (validated.assigneeId !== undefined) {
      if (!participantIds.includes(validated.assigneeId)) {
        throw AppError.badRequest(
          'Assignee must be an active participant in this collaboration'
        );
      }
      task.assignee = new mongoose.Types.ObjectId(validated.assigneeId);
    }

    if (validated.title !== undefined) {
      task.title = validated.title;
    }
    if (validated.description !== undefined) {
      task.description = validated.description;
    }
    if (validated.dueDate !== undefined) {
      task.dueDate = validated.dueDate ? new Date(validated.dueDate) : undefined;
    }
    if (validated.status !== undefined) {
      task.status = validated.status;
    }
    if (validated.order !== undefined) {
      task.order = validated.order;
    }

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email role orgName')
      .populate('creator', 'name role');

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Task updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
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
      throw AppError.notFound('Task not found');
    }

    const task = await Task.findById(id);
    if (!task) {
      throw AppError.notFound('Task not found');
    }

    const { participantIds } = await getCollaborationAndParticipants(
      task.collaborationRequest.toString()
    );

    const isParticipant =
      participantIds.includes(req.user._id.toString()) ||
      req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this collaboration');
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
