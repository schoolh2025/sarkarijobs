import mongoose, { Document, Schema } from 'mongoose';

export interface IResult extends Document {
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  organization: string;
  examDate: Date;
  resultDate: Date;
  category: string;
  resultUrl: string;
  type: 'result' | 'admitCard' | 'answerKey';
  status: 'pending' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

const resultSchema = new Schema(
  {
    title: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    description: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    organization: { type: String, required: true },
    examDate: { type: Date, required: true },
    resultDate: { type: Date, required: true },
    category: { type: String, required: true },
    resultUrl: { type: String, required: true },
    type: {
      type: String,
      enum: ['result', 'admitCard', 'answerKey'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'published', 'archived'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
resultSchema.index({ category: 1, type: 1, status: 1 });
resultSchema.index({ resultDate: -1 });
resultSchema.index({ organization: 1 });

// Virtual for checking if result is recent (within last 7 days)
resultSchema.virtual('isRecent').get(function(this: IResult) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return this.resultDate >= sevenDaysAgo;
});

// Pre-save middleware to update status based on dates
resultSchema.pre('save', function(next) {
  const now = new Date();
  if (this.resultDate > now) {
    this.status = 'pending';
  } else {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    this.status = this.resultDate < thirtyDaysAgo ? 'archived' : 'published';
  }
  next();
});

export default mongoose.model<IResult>('Result', resultSchema);