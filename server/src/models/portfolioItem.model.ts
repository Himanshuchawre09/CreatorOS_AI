import mongoose, { Document, Schema, Types } from 'mongoose';

export type PortfolioItemType = 'video' | 'image' | 'link' | 'article';

export interface IPortfolioItem extends Document {
  owner: Types.ObjectId;
  title: string;
  description?: string;
  type: PortfolioItemType;
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioItemSchema = new Schema<IPortfolioItem>(
  {
    owner: {
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
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    type: {
      type: String,
      enum: ['video', 'image', 'link', 'article'],
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

portfolioItemSchema.index({ owner: 1, createdAt: -1 });

export const PortfolioItem = mongoose.model<IPortfolioItem>('PortfolioItem', portfolioItemSchema);

