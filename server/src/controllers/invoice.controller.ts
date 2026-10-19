import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Invoice } from '../models/invoice.model';
import { CollaborationRequest } from '../models/collaborationRequest.model';
import { Contract } from '../models/contract.model';
import { AppError } from '../utils/AppError';
import { sendNotification } from '../utils/notification';
import {
  createInvoiceSchema,
  updateInvoiceStatusSchema,
  invoiceQuerySchema,
} from '../validations/invoice.validation';

// Helper to resolve collaboration and check participant permission
async function resolveCollaboration(collaborationId: string): Promise<{
  collab: any;
  contract?: any;
  brandId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
}> {
  if (!mongoose.Types.ObjectId.isValid(collaborationId)) {
    throw AppError.notFound('Collaboration not found');
  }

  let collab = await CollaborationRequest.findById(collaborationId);
  let contract: any = null;

  if (!collab) {
    contract = await Contract.findById(collaborationId);
    if (contract) {
      collab = await CollaborationRequest.findById(contract.collaborationRequest);
    }
  } else {
    contract = await Contract.findOne({ collaborationRequest: collab._id });
  }

  if (!collab) {
    throw AppError.notFound('Collaboration not found');
  }

  const brandId = collab.brand || collab.sender;
  const creatorId = collab.creator || collab.recipient;

  return { collab, contract, brandId, creatorId };
}

export const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const validated = createInvoiceSchema.parse(req.body);
    const { collab, contract, brandId, creatorId } = await resolveCollaboration(
      validated.collaborationId
    );

    const userId = req.user._id.toString();
    const isBrand = brandId.toString() === userId;
    const isCreator = creatorId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBrand && !isCreator && !isAdmin) {
      throw AppError.forbidden('You are not a participant in this collaboration');
    }

    // Issuer is the user creating the invoice; client is the counterparty
    const issuerId = req.user._id;
    const clientId = isCreator ? brandId : creatorId;

    // Generate unique invoice number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${randomSuffix}-${Date.now().toString().slice(-4)}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      collaborationRequest: collab._id,
      contract: contract?._id,
      issuer: issuerId,
      client: clientId,
      amount: validated.amount,
      currency: validated.currency,
      description: validated.description,
      dueDate: validated.dueDate,
      status: 'draft',
      notes: validated.notes,
    });

    const populated = await Invoice.findById(invoice._id)
      .populate('issuer', 'name email role orgName')
      .populate('client', 'name email role orgName');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Invoice created successfully as draft',
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    const { status, collaborationId, page, limit } = invoiceQuerySchema.parse(
      req.query
    );
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Role-based scoping
    if (req.user.role !== 'admin') {
      filter.$or = [{ issuer: req.user._id }, { client: req.user._id }];
    }

    if (collaborationId) {
      filter.collaborationRequest = collaborationId;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .populate('issuer', 'name email role orgName')
        .populate('client', 'name email role orgName')
        .populate('collaborationRequest', 'campaign')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    // Check overdue status on-the-fly for sent invoices past due date
    const now = new Date();
    const mappedInvoices = invoices.map((inv: any) => {
      if (inv.status === 'sent' && new Date(inv.dueDate) < now) {
        return { ...inv, status: 'overdue' };
      }
      return inv;
    });

    res.status(200).json({
      success: true,
      data: mappedInvoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (
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
      throw AppError.notFound('Invoice not found');
    }

    const invoice = await Invoice.findById(id)
      .populate('issuer', 'name email role orgName')
      .populate('client', 'name email role orgName')
      .populate('collaborationRequest');

    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    const userId = req.user._id.toString();
    const isParticipant =
      invoice.issuer._id.toString() === userId ||
      invoice.client._id.toString() === userId ||
      req.user.role === 'admin';

    if (!isParticipant) {
      throw AppError.forbidden('You do not have access to this invoice');
    }

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (
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
      throw AppError.notFound('Invoice not found');
    }

    const invoice = await Invoice.findById(id);
    if (!invoice) {
      throw AppError.notFound('Invoice not found');
    }

    const userId = req.user._id.toString();
    const isIssuer = invoice.issuer.toString() === userId || req.user.role === 'admin';

    if (!isIssuer) {
      throw AppError.forbidden('Only the invoice issuer can update its status');
    }

    const { status } = updateInvoiceStatusSchema.parse(req.body);

    if (invoice.status === 'paid' && status !== 'paid') {
      throw AppError.badRequest('Paid invoices cannot change status');
    }

    if (invoice.status === 'cancelled') {
      throw AppError.badRequest('Cancelled invoices cannot change status');
    }

    // Apply legal status transition
    if (status === 'sent') {
      invoice.status = 'sent';
      await sendNotification({
        recipient: invoice.client,
        sender: req.user._id,
        type: 'invoice_status',
        title: 'New Invoice Received',
        message: `${req.user.name} sent invoice ${invoice.invoiceNumber} for ${invoice.currency} ${invoice.amount}. Tracking only; no payments are processed here.`,
        link: '/invoices',
      });
    } else if (status === 'paid') {
      invoice.status = 'paid';
      invoice.paidAt = new Date();
      await sendNotification({
        recipient: invoice.client,
        sender: req.user._id,
        type: 'invoice_status',
        title: 'Invoice Marked Paid',
        message: `Invoice ${invoice.invoiceNumber} has been marked as paid by ${req.user.name}. Tracking only; no payments are processed here.`,
        link: '/invoices',
      });
    } else if (status === 'cancelled') {
      invoice.status = 'cancelled';
    }

    await invoice.save();

    const populated = await Invoice.findById(invoice._id)
      .populate('issuer', 'name email role orgName')
      .populate('client', 'name email role orgName');

    res.status(200).json({
      success: true,
      data: populated,
      message: `Invoice status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
};
