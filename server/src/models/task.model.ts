import mongoose, { Document, Schema } from 'mongoose';

export type TaskStatus = 'todo' | 'doing' | 'review' | 'done';

export interface ITask extends Document {
  collaborationRequest: mongoose.Types.ObjectId;
  contract?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assignee: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  dueDate?: Date;
  status: TaskStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
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
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['todo', 'doing', 'review', 'done'],
      default: 'todo',
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ collaborationRequest: 1, status: 1 });

export const Task = mongoose.model<ITask>('Task', taskSchema);
