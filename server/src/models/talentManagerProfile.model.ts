import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITalentManagerProfile extends Document {
  user: Types.ObjectId;
  agencyName: string;
  about?: string;
  website?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const talentManagerProfileSchema = new Schema<ITalentManagerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    agencyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    about: {
      type: String,
      trim: true,
      maxlength: 800,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

talentManagerProfileSchema.index({ agencyName: 'text', about: 'text' });

export const TalentManagerProfile = mongoose.model<ITalentManagerProfile>(
  'TalentManagerProfile',
  talentManagerProfileSchema
);

