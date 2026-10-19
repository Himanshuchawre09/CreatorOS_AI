import mongoose, { Document, Schema } from 'mongoose';

export type ContractStatus = 'draft' | 'sent' | 'signed' | 'declined';

export interface IDeliverableItem {
  type: string;
  count: number;
  details?: string;
}

export interface IContract extends Document {
  collaborationRequest: mongoose.Types.ObjectId;
  campaign: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  deliverables: IDeliverableItem[];
  budget: number;
  currency: string;
  deadline: Date;
  notes?: string;
  status: ContractStatus;
  brandSignedAt?: Date | null;
  creatorSignedAt?: Date | null;
  declinedAt?: Date | null;
  declinedBy?: mongoose.Types.ObjectId | null;
  declineReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const deliverableItemSchema = new Schema(
  {
    type: { type: String, required: true, trim: true, maxlength: 100 },
    count: { type: Number, required: true, min: 1, default: 1 },
    details: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const contractSchema = new Schema<IContract>(
  {
    collaborationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'CollaborationRequest',
      required: true,
      unique: true,
    },
    campaign: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deliverables: {
      type: [deliverableItemSchema],
      default: [],
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      default: 'USD',
    },
    deadline: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'signed', 'declined'],
      default: 'draft',
      index: true,
    },
    brandSignedAt: {
      type: Date,
      default: null,
    },
    creatorSignedAt: {
      type: Date,
      default: null,
    },
    declinedAt: {
      type: Date,
      default: null,
    },
    declinedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    declineReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

contractSchema.index({ brand: 1, createdAt: -1 });
contractSchema.index({ creator: 1, createdAt: -1 });

export const Contract = mongoose.model<IContract>('Contract', contractSchema);
