import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBrandProfile extends Document {
  user: Types.ObjectId;
  companyName: string;
  industry: string;
  website?: string;
  about?: string;
  targetAudience?: string;
  logoUrl?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandProfileSchema = new Schema<IBrandProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    industry: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    website: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    about: {
      type: String,
      trim: true,
      maxlength: 800,
      default: '',
    },
    targetAudience: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    logoUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
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

brandProfileSchema.index({ companyName: 'text', about: 'text', industry: 'text' });

export const BrandProfile = mongoose.model<IBrandProfile>('BrandProfile', brandProfileSchema);

