import mongoose, { Document, Schema, Types } from 'mongoose';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface IInvoice extends Document {
  invoiceNumber: string;
  collaborationRequest: Types.ObjectId;
  contract?: Types.ObjectId;
  issuer: Types.ObjectId;
  client: Types.ObjectId;
  amount: number;
  currency: string;
  description: string;
  dueDate: Date;
  status: InvoiceStatus;
  paidAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    collaborationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'CollaborationRequest',
      required: true,
      index: true,
    },
    contract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
    },
    issuer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1'],
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      uppercase: true,
      trim: true,
      maxlength: 3,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
      required: true,
      index: true,
    },
    paidAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ issuer: 1, status: 1 });
invoiceSchema.index({ client: 1, status: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);
export default Invoice;
