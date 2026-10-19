import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITalentLink extends Document {
  talentManager: Types.ObjectId;
  creator: Types.ObjectId;
  status: 'pending' | 'accepted' | 'declined';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const talentLinkSchema = new Schema<ITalentLink>(
  {
    talentManager: {
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
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending',
      required: true,
      index: true,
    },
    notes: {
      type: String,
      maxlength: 300,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate link requests between the same manager and creator
talentLinkSchema.index({ talentManager: 1, creator: 1 }, { unique: true });

export const TalentLink = mongoose.model<ITalentLink>('TalentLink', talentLinkSchema);
export default TalentLink;
