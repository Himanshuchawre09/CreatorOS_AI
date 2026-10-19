import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { Submission, CollaborationRequest, Contract } from '../models';
import { AppError } from '../utils/AppError';
import { verifyFileSignature } from '../utils/fileSignature';
import {
  reviewSubmissionSchema,
  submissionQuerySchema,
} from '../validations/submission.validation';
import { sendNotification } from '../utils/notification';

// Helper to resolve collaboration and participant IDs
async function getCollaborationInfo(collaborationId: string): Promise<{
  collaborationRequestId: mongoose.Types.ObjectId;
  contractId?: mongoose.Types.ObjectId;
  brandId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
}> {
  if (!mongoose.Types.ObjectId.isValid(collaborationId)) {
    throw AppError.notFound('Collaboration not found');
  }

  // Check CollaborationRequest
  const colReq = await CollaborationRequest.findById(collaborationId).populate('campaign');
  if (colReq) {
    const brandId = colReq.campaign
      ? (colReq.campaign as any).brand
      : colReq.sender.toString() === colReq.creator.toString()
      ? colReq.recipient
      : colReq.sender;

    return {
      collaborationRequestId: colReq._id,
      brandId: new mongoose.Types.ObjectId(brandId),
      creatorId: colReq.creator,
    };
  }

  // Check Contract
  const contract = await Contract.findById(collaborationId);
  if (contract) {
    return {
      collaborationRequestId: contract.collaborationRequest,
      contractId: contract._id,
      brandId: contract.brand,
      creatorId: contract.creator,
    };
  }

  throw AppError.notFound('Collaboration not found');
}

export const createSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!req.file) {
      throw AppError.badRequest('Deliverable file is required');
    }

    const { collaborationId, title, description } = req.body;

    if (!collaborationId) {
      if (req.file) await fs.promises.unlink(req.file.path).catch(() => {});
      throw AppError.badRequest('collaborationId is required');
    }

    // Verify magic bytes
    const buffer = await fs.promises.readFile(req.file.path);
    const signature = verifyFileSignature(buffer);

    if (!signature.valid) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      throw AppError.badRequest(
        'File signature verification failed. Only genuine PNG, JPEG, PDF, and MP4 files are allowed.'
      );
    }

    const { collaborationRequestId, contractId, brandId, creatorId } =
      await getCollaborationInfo(collaborationId);

    const isCreator =
      creatorId.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isCreator) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      throw AppError.forbidden('Only the creator can submit deliverables');
    }

    const submission = await Submission.create({
      collaborationRequest: collaborationRequestId,
      contract: contractId,
      creator: creatorId,
      brand: brandId,
      title: (title || 'Deliverable Submission').trim(),
      description: (description || '').trim(),
      version: 1,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: signature.detectedMime || req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      },
      status: 'pending',
    });

    const populated = await Submission.findById(submission._id)
      .populate('creator', 'name email')
      .populate('brand', 'name email orgName');

    await sendNotification({
      recipient: brandId,
      sender: req.user._id,
      type: 'content_submitted',
      title: 'Content Submitted for Review',
      message: `${req.user.name} submitted deliverable: "${title}"`,
      link: '/content-review',
    });

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Deliverable submitted for review',
    });
  } catch (error) {
    if (req.file) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

export const submitRevision = async (
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
      if (req.file) await fs.promises.unlink(req.file.path).catch(() => {});
      throw AppError.notFound('Submission not found');
    }

    if (!req.file) {
      throw AppError.badRequest('Revision file is required');
    }

    // Verify magic bytes
    const buffer = await fs.promises.readFile(req.file.path);
    const signature = verifyFileSignature(buffer);

    if (!signature.valid) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      throw AppError.badRequest(
        'File signature verification failed. Only genuine PNG, JPEG, PDF, and MP4 files are allowed.'
      );
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      throw AppError.notFound('Submission not found');
    }

    const isCreator =
      submission.creator.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isCreator) {
      await fs.promises.unlink(req.file.path).catch(() => {});
      throw AppError.forbidden('Only the creator can submit revisions');
    }

    // Archive current version into revisions
    submission.revisions.push({
      version: submission.version,
      file: submission.file,
      status: submission.status,
      feedback: submission.feedback,
      feedbackAt: submission.feedbackAt || undefined,
      submittedAt: submission.updatedAt,
    });

    submission.version += 1;
    submission.file = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: signature.detectedMime || req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    };
    submission.status = 'pending';
    submission.feedback = undefined;
    submission.feedbackAt = undefined;

    if (req.body.title) {
      submission.title = req.body.title.trim();
    }
    if (req.body.description !== undefined) {
      submission.description = req.body.description.trim();
    }

    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate('creator', 'name email')
      .populate('brand', 'name email orgName');

    await sendNotification({
      recipient: submission.brand,
      sender: req.user._id,
      type: 'content_submitted',
      title: 'Revision Submitted for Review',
      message: `${req.user.name} submitted revision (v${submission.version}) for deliverable: "${submission.title}"`,
      link: '/content-review',
    });

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Revision submitted for review',
    });
  } catch (error) {
    if (req.file) {
      await fs.promises.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};

export const reviewSubmission = async (
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
      throw AppError.notFound('Submission not found');
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      throw AppError.notFound('Submission not found');
    }

    const isBrand =
      submission.brand.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isBrand) {
      throw AppError.forbidden('Only the brand can review submissions');
    }

    const validated = reviewSubmissionSchema.parse(req.body);
    const { action, comment } = validated;

    if (action === 'approve') {
      submission.status = 'approved';
      submission.feedback = comment || '';
      submission.feedbackAt = new Date();
    } else {
      submission.status = 'changesRequested';
      submission.feedback = comment || 'Changes requested';
      submission.feedbackAt = new Date();
    }

    await submission.save();

    const populated = await Submission.findById(submission._id)
      .populate('creator', 'name email')
      .populate('brand', 'name email orgName');

    await sendNotification({
      recipient: submission.creator,
      sender: req.user._id,
      type: action === 'approve' ? 'content_approved' : 'changes_requested',
      title: action === 'approve' ? 'Content Approved' : 'Changes Requested',
      message:
        action === 'approve'
          ? `${req.user.name} approved your deliverable: "${submission.title}"`
          : `${req.user.name} requested changes on your deliverable: "${submission.title}"`,
      link: '/content-review',
    });

    res.status(200).json({
      success: true,
      data: populated,
      message:
        submission.status === 'approved'
          ? 'Deliverable approved successfully'
          : 'Changes requested on deliverable',
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validatedQuery = submissionQuerySchema.parse(req.query);
    const { collaborationId, status } = validatedQuery;

    const filter: Record<string, any> = {};

    if (collaborationId) {
      const { collaborationRequestId, brandId, creatorId } =
        await getCollaborationInfo(collaborationId);

      const isParticipant =
        brandId.toString() === req.user._id.toString() ||
        creatorId.toString() === req.user._id.toString() ||
        req.user.role === 'admin';

      if (!isParticipant) {
        throw AppError.forbidden('You are not a participant in this collaboration');
      }

      filter.collaborationRequest = collaborationRequestId;
    } else {
      if (req.user.role !== 'admin') {
        filter.$or = [{ brand: req.user._id }, { creator: req.user._id }];
      }
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const submissions = await Submission.find(filter)
      .populate('creator', 'name email')
      .populate('brand', 'name email orgName')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (
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
      throw AppError.notFound('Submission not found');
    }

    const submission = await Submission.findById(id)
      .populate('creator', 'name email')
      .populate('brand', 'name email orgName');

    if (!submission) {
      throw AppError.notFound('Submission not found');
    }

    const isParticipant =
      submission.brand._id.toString() === req.user._id.toString() ||
      submission.creator._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this collaboration');
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const downloadSubmissionFile = async (
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
      throw AppError.notFound('Submission not found');
    }

    const submission = await Submission.findById(id);

    if (!submission) {
      throw AppError.notFound('Submission not found');
    }

    const isParticipant =
      submission.brand.toString() === req.user._id.toString() ||
      submission.creator.toString() === req.user._id.toString() ||
      req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You are not authorized to access this file');
    }

    const versionParam = req.query.version;
    let targetFile = submission.file;

    if (versionParam) {
      const vNum = parseInt(String(versionParam), 10);
      if (vNum !== submission.version) {
        const rev = submission.revisions.find((r) => r.version === vNum);
        if (rev) {
          targetFile = rev.file;
        }
      }
    }

    if (!fs.existsSync(targetFile.path)) {
      throw AppError.notFound('File not found on server storage');
    }

    res.setHeader('Content-Type', targetFile.mimeType);
    res.download(targetFile.path, targetFile.originalName);
  } catch (error) {
    next(error);
  }
};
