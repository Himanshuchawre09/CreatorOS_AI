import mongoose, { Document, Schema } from 'mongoose';

export type SubmissionStatus = 'pending' | 'approved' | 'changesRequested';

export interface ISubmissionFile {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
}

export interface ISubmissionRevision {
  version: number;
  file: ISubmissionFile;
  status: SubmissionStatus;
  feedback?: string;
  feedbackAt?: Date;
  submittedAt: Date;
}

export interface ISubmission extends Document {
  collaborationRequest: mongoose.Types.ObjectId;
  contract?: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  brand: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  version: number;
  file: ISubmissionFile;
  status: SubmissionStatus;
  feedback?: string;
  feedbackAt?: Date;
  revisions: ISubmissionRevision[];
  createdAt: Date;
  updatedAt: Date;
}

const fileSchema = new Schema<ISubmissionFile>(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
  },
  { _id: false }
);

const revisionSchema = new Schema<ISubmissionRevision>(
  {
    version: { type: Number, required: true },
    file: { type: fileSchema, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'changesRequested'],
      required: true,
    },
    feedback: { type: String, trim: true, maxlength: 2000 },
    feedbackAt: { type: Date },
    submittedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const submissionSchema = new Schema<ISubmission>(
  {
    collaborationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'CollaborationRequest',
      required: true,
      index: true,
    },
    contract: {
      type: Schema.Types.ObjectId,
      ref: 'Contract',
      required: false,
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
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    version: {
      type: Number,
      required: true,
      default: 1,
    },
    file: {
      type: fileSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'changesRequested'],
      default: 'pending',
      index: true,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    feedbackAt: {
      type: Date,
      default: null,
    },
    revisions: {
      type: [revisionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

submissionSchema.index({ collaborationRequest: 1, createdAt: -1 });

export const Submission = mongoose.model<ISubmission>('Submission', submissionSchema);
