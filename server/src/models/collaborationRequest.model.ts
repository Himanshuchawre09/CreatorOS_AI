import mongoose, { Document, Schema, Types } from 'mongoose';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface ICollaborationRequest extends Document {
  campaign: Types.ObjectId;
  brand: Types.ObjectId;
  creator: Types.ObjectId;
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  pitch?: string;
  proposedRate?: number;
  currency: string;
  status: RequestStatus;
  respondedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const collaborationRequestSchema = new Schema<ICollaborationRequest>(
  {
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
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pitch: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    proposedRate: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
      maxlength: 10,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Unique index: No duplicate request per campaign + creator
collaborationRequestSchema.index({ campaign: 1, creator: 1 }, { unique: true });

export const CollaborationRequest = mongoose.model<ICollaborationRequest>(
  'CollaborationRequest',
  collaborationRequestSchema
);
