import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'suggestion' | 'bug' | 'content' | 'other';
  status: 'pending' | 'reviewed' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['suggestion', 'bug', 'content', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
feedbackSchema.index({ status: 1, priority: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ createdAt: -1 });

// Virtual for checking if feedback is recent (within last 24 hours)
feedbackSchema.virtual('isRecent').get(function(this: IFeedback) {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  return this.createdAt >= twentyFourHoursAgo;
});

// Pre-save middleware to set priority based on type
feedbackSchema.pre('save', function(next) {
  if (this.isNew) {
    if (this.type === 'bug') {
      this.priority = 'high';
    } else if (this.type === 'content') {
      this.priority = 'medium';
    }
  }
  next();
});

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);