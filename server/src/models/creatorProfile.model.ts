import mongoose, { Document, Schema, Types } from 'mongoose';

export type PlatformType = 'youtube' | 'instagram' | 'tiktok' | 'twitch' | 'blog' | 'other';

export interface IPlatform {
  platform: PlatformType;
  handle: string;
  url: string;
  followers: number;
  engagementRate?: number;
}

export interface ICreatorProfile extends Document {
  user: Types.ObjectId;
  displayName: string;
  bio?: string;
  niche: string;
  platforms: IPlatform[];
  location?: string;
  languages: string[];
  contentTypes: string[];
  rateNotes?: string;
  avatarUrl?: string;
  isPublic: boolean;
  totalFollowers: number;
  createdAt: Date;
  updatedAt: Date;
}

const platformSchema = new Schema<IPlatform>(
  {
    platform: {
      type: String,
      enum: ['youtube', 'instagram', 'tiktok', 'twitch', 'blog', 'other'],
      required: true,
    },
    handle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    followers: {
      type: Number,
      default: 0,
      min: 0,
    },
    engagementRate: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const creatorProfileSchema = new Schema<ICreatorProfile>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    niche: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    platforms: {
      type: [platformSchema],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    languages: {
      type: [String],
      default: [],
    },
    contentTypes: {
      type: [String],
      default: [],
    },
    rateNotes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true,
    },
    totalFollowers: {
      type: Number,
      default: 0,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to calculate total followers across platforms
creatorProfileSchema.pre('save', function (next) {
  if (this.platforms && Array.isArray(this.platforms)) {
    this.totalFollowers = this.platforms.reduce((sum, p) => sum + (Number(p.followers) || 0), 0);
  }
  next();
});

// Text index for search
creatorProfileSchema.index({ displayName: 'text', bio: 'text', niche: 'text' });
creatorProfileSchema.index({ 'platforms.platform': 1 });
creatorProfileSchema.index({ 'platforms.followers': 1 });

export const CreatorProfile = mongoose.model<ICreatorProfile>('CreatorProfile', creatorProfileSchema);
