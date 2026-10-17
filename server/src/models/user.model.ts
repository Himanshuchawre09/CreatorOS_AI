import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'creator' | 'brand' | 'freelancer' | 'agency';

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['creator', 'brand', 'freelancer', 'agency'],
      default: 'creator',
      required: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
