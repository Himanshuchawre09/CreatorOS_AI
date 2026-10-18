import mongoose, { Document, Schema, Types } from 'mongoose';

export type AvailabilityType = 'available' | 'busy';

export interface IFreelancerProfile extends Document {
  user: Types.ObjectId;
  headline: string;
  skills: string[];
  bio?: string;
  portfolioLinks: string[];
  availability: AvailabilityType;
  hourlyRate?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const freelancerProfileSchema = new Schema<IFreelancerProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 800,
      default: '',
    },
    portfolioLinks: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available',
    },
    hourlyRate: {
      type: Number,
      min: 0,
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

freelancerProfileSchema.index({ headline: 'text', bio: 'text', skills: 'text' });

export const FreelancerProfile = mongoose.model<IFreelancerProfile>(
  'FreelancerProfile',
  freelancerProfileSchema
);
