import mongoose, { Document, Schema, Types } from 'mongoose';

export type CampaignStatus = 'draft' | 'open' | 'inProgress' | 'completed' | 'cancelled';

export interface IDeliverable {
  type: string;
  count: number;
  details?: string;
}

export interface ICampaign extends Document {
  brand: Types.ObjectId;
  title: string;
  brief: string;
  goals: string[];
  audience: string;
  deliverables: IDeliverable[];
  budget: number;
  currency: string;
  deadline: Date;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}

const deliverableSchema = new Schema<IDeliverable>(
  {
    type: { type: String, required: true, trim: true, maxlength: 100 },
    count: { type: Number, required: true, min: 1, default: 1 },
    details: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const campaignSchema = new Schema<ICampaign>(
  {
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    brief: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    goals: {
      type: [String],
      default: [],
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    deliverables: {
      type: [deliverableSchema],
      default: [],
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'USD',
      trim: true,
      maxlength: 10,
    },
    deadline: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'open', 'inProgress', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index on title and brief
campaignSchema.index({ title: 'text', brief: 'text' });

export const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);
