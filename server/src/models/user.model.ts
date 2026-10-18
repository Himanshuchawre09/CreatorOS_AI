import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'creator' | 'brand' | 'freelancer' | 'talentManager' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  orgName?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['creator', 'brand', 'freelancer', 'talentManager', 'admin'],
      default: 'creator',
      required: true,
    },
    orgName: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.passwordHash;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User = mongoose.model<IUser>('User', userSchema);
