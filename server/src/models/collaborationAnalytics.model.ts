import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICollaborationAnalytics extends Document {
  collaborationRequest: Types.ObjectId;
  creator: Types.ObjectId;
  brand: Types.ObjectId;
  views: number;
  reach: number;
  clicks: number;
  engagement: number;
  notes?: string;
  lastReportedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const collaborationAnalyticsSchema = new Schema<ICollaborationAnalytics>(
  {
    collaborationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'CollaborationRequest',
      required: true,
      unique: true,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative'],
    },
    reach: {
      type: Number,
      default: 0,
      min: [0, 'Reach cannot be negative'],
    },
    clicks: {
      type: Number,
      default: 0,
      min: [0, 'Clicks cannot be negative'],
    },
    engagement: {
      type: Number,
      default: 0,
      min: [0, 'Engagement cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    lastReportedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const CollaborationAnalytics = mongoose.model<ICollaborationAnalytics>(
  'CollaborationAnalytics',
  collaborationAnalyticsSchema
);
export default CollaborationAnalytics;
