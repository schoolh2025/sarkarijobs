import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  department: string;
  startDate: Date;
  endDate: Date;
  category: string;
  eligibility: string;
  salary: string;
  location: string;
  vacancies: number;
  applicationUrl: string;
  status: 'active' | 'closed' | 'upcoming';
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema(
  {
    title: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    description: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    department: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    category: { type: String, required: true },
    eligibility: { type: String, required: true },
    salary: { type: String, required: true },
    location: { type: String, required: true },
    vacancies: { type: Number, required: true },
    applicationUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['active', 'closed', 'upcoming'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Add index for better search performance
jobSchema.index({ category: 1, department: 1, status: 1 });
jobSchema.index({ startDate: -1, endDate: -1 });

// Virtual for checking if job is active
jobSchema.virtual('isActive').get(function(this: IJob) {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Pre-save middleware to update status based on dates
jobSchema.pre('save', function(next) {
  const now = new Date();
  if (this.startDate > now) {
    this.status = 'upcoming';
  } else if (this.endDate < now) {
    this.status = 'closed';
  } else {
    this.status = 'active';
  }
  next();
});

export default mongoose.model<IJob>('Job', jobSchema);