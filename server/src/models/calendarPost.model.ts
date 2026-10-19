import mongoose, { Document, Schema, Types } from 'mongoose';

export type PostPlatform =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'twitch'
  | 'blog'
  | 'other';

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface ICalendarPost extends Document {
  owner: Types.ObjectId;
  collaborationRequest?: Types.ObjectId;
  title: string;
  description?: string;
  platform: PostPlatform;
  scheduledDate: Date;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
}

const calendarPostSchema = new Schema<ICalendarPost>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    collaborationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'CollaborationRequest',
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    platform: {
      type: String,
      enum: ['youtube', 'instagram', 'tiktok', 'twitch', 'blog', 'other'],
      default: 'instagram',
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'archived'],
      default: 'scheduled',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

calendarPostSchema.index({ owner: 1, scheduledDate: 1 });

export const CalendarPost = mongoose.model<ICalendarPost>(
  'CalendarPost',
  calendarPostSchema
);
export default CalendarPost;
