import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmission extends Document {
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  institute: string;
  course: string;
  startDate: Date;
  endDate: Date;
  eligibility: string;
  totalSeats: number;
  applicationFee: {
    general: number;
    reserved: number;
  };
  applicationUrl: string;
  category: string;
  status: 'upcoming' | 'active' | 'closed';
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

const admissionSchema = new Schema(
  {
    title: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    description: {
      en: { type: String, required: true },
      hi: { type: String, required: true },
    },
    institute: { type: String, required: true },
    course: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    eligibility: { type: String, required: true },
    totalSeats: { type: Number, required: true },
    applicationFee: {
      general: { type: Number, required: true },
      reserved: { type: Number, required: true },
    },
    applicationUrl: { type: String, required: true },
    category: { type: String, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'closed'],
      default: 'upcoming',
    },
    documents: [{ type: String }],
  },
  { timestamps: true }
);

// Add indexes for better query performance
admissionSchema.index({ category: 1, status: 1 });
admissionSchema.index({ startDate: -1, endDate: -1 });
admissionSchema.index({ institute: 1, course: 1 });

// Virtual for checking if admission is active
admissionSchema.virtual('isActive').get(function(this: IAdmission) {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now;
});

// Virtual for days remaining until deadline
admissionSchema.virtual('daysRemaining').get(function(this: IAdmission) {
  const now = new Date();
  const diffTime = this.endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to update status based on dates
admissionSchema.pre('save', function(next) {
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

export default mongoose.model<IAdmission>('Admission', admissionSchema);