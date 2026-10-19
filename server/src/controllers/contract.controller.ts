import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Contract } from '../models';
import { AppError } from '../utils/AppError';
import {
  updateContractSchema,
  declineContractSchema,
  contractQuerySchema,
} from '../validations/contract.validation';
import { sendNotification } from '../utils/notification';

export const getContracts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validatedQuery = contractQuerySchema.parse(req.query);
    const { status, page, limit } = validatedQuery;

    const pageNum = page ?? 1;
    const limitNum = limit ?? 12;
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, any> = {};

    if (req.user.role === 'admin') {
      // Admin can query any
    } else {
      filter.$or = [{ brand: req.user._id }, { creator: req.user._id }];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const [contracts, total] = await Promise.all([
      Contract.find(filter)
        .populate('campaign', 'title brief budget currency deadline status')
        .populate('brand', 'name email orgName')
        .populate('creator', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Contract.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: contracts,
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

export const getContractById = async (
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
      throw AppError.notFound('Contract not found');
    }

    const contract = await Contract.findById(id)
      .populate('campaign', 'title brief budget currency deadline status deliverables')
      .populate('brand', 'name email orgName')
      .populate('creator', 'name email')
      .populate('collaborationRequest', 'message proposedRate sender recipient status');

    if (!contract) {
      throw AppError.notFound('Contract not found');
    }

    const isBrand = contract.brand._id
      ? contract.brand._id.toString() === req.user._id.toString()
      : contract.brand.toString() === req.user._id.toString();

    const isCreator = contract.creator._id
      ? contract.creator._id.toString() === req.user._id.toString()
      : contract.creator.toString() === req.user._id.toString();

    const isAdmin = req.user.role === 'admin';

    if (!isBrand && !isCreator && !isAdmin) {
      throw AppError.forbidden('You are not a participant in this contract');
    }

    res.status(200).json({
      success: true,
      data: contract,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContract = async (
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
      throw AppError.notFound('Contract not found');
    }

    const contract = await Contract.findById(id);

    if (!contract) {
      throw AppError.notFound('Contract not found');
    }

    const isBrand = contract.brand.toString() === req.user._id.toString();
    const isCreator = contract.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBrand && !isCreator && !isAdmin) {
      throw AppError.forbidden('You are not a participant in this contract');
    }

    if (contract.status !== 'draft') {
      throw AppError.badRequest(
        `Cannot edit a contract that is already ${contract.status}`
      );
    }

    const validated = updateContractSchema.parse(req.body);

    if (validated.deliverables !== undefined) {
      contract.deliverables = validated.deliverables;
    }
    if (validated.budget !== undefined) {
      contract.budget = validated.budget;
    }
    if (validated.currency !== undefined) {
      contract.currency = validated.currency;
    }
    if (validated.deadline !== undefined) {
      contract.deadline = new Date(validated.deadline);
    }
    if (validated.notes !== undefined) {
      contract.notes = validated.notes;
    }

    await contract.save();

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const sendContract = async (
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
      throw AppError.notFound('Contract not found');
    }

    const contract = await Contract.findById(id);

    if (!contract) {
      throw AppError.notFound('Contract not found');
    }

    const isBrand = contract.brand.toString() === req.user._id.toString();
    const isCreator = contract.creator.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isBrand && !isCreator && !isAdmin) {
      throw AppError.forbidden('You are not a participant in this contract');
    }

    if (contract.status !== 'draft') {
      throw AppError.badRequest(
        `Cannot send a contract that is already ${contract.status}`
      );
    }

    contract.status = 'sent';
    await contract.save();

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract sent for review and signatures',
    });
  } catch (error) {
    next(error);
  }
};

export const signContract = async (
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
      throw AppError.notFound('Contract not found');
    }

    const contract = await Contract.findById(id);

    if (!contract) {
      throw AppError.notFound('Contract not found');
    }

    if (contract.status === 'declined') {
      throw AppError.badRequest('Cannot sign a declined contract');
    }

    const isBrand = contract.brand.toString() === req.user._id.toString();
    const isCreator = contract.creator.toString() === req.user._id.toString();

    if (!isBrand && !isCreator) {
      throw AppError.forbidden('You are not a participant in this contract');
    }

    const now = new Date();

    if (isBrand) {
      if (contract.brandSignedAt) {
        throw AppError.badRequest('You have already signed this contract');
      }
      contract.brandSignedAt = now;
    }

    if (isCreator) {
      if (contract.creatorSignedAt) {
        throw AppError.badRequest('You have already signed this contract');
      }
      contract.creatorSignedAt = now;
    }

    // If both have signed, status becomes 'signed' (active)
    if (contract.brandSignedAt && contract.creatorSignedAt) {
      contract.status = 'signed';
    } else {
      // Sent while waiting for the other party
      contract.status = 'sent';
    }

    await contract.save();

    const otherPartyId = isBrand ? contract.creator : contract.brand;
    await sendNotification({
      recipient: otherPartyId,
      sender: req.user._id,
      type: 'contract_signed',
      title: contract.status === 'signed' ? 'Contract Fully Executed' : 'Contract Signed by Counterparty',
      message: `${req.user.name} signed the collaboration contract`,
      link: `/contracts/${contract._id}`,
    });

    res.status(200).json({
      success: true,
      data: contract,
      message:
        contract.status === 'signed'
          ? 'Contract fully signed and active'
          : 'Contract signed by you, awaiting counter-signature',
    });
  } catch (error) {
    next(error);
  }
};

export const declineContract = async (
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
      throw AppError.notFound('Contract not found');
    }

    const contract = await Contract.findById(id);

    if (!contract) {
      throw AppError.notFound('Contract not found');
    }

    if (contract.status === 'signed') {
      throw AppError.badRequest('Cannot decline an already signed contract');
    }

    const isBrand = contract.brand.toString() === req.user._id.toString();
    const isCreator = contract.creator.toString() === req.user._id.toString();

    if (!isBrand && !isCreator) {
      throw AppError.forbidden('You are not a participant in this contract');
    }

    const validated = declineContractSchema.parse(req.body);

    contract.status = 'declined';
    contract.declinedAt = new Date();
    contract.declinedBy = req.user._id;
    contract.declineReason = validated.reason || '';

    await contract.save();

    res.status(200).json({
      success: true,
      data: contract,
      message: 'Contract declined',
    });
  } catch (error) {
    next(error);
  }
};
