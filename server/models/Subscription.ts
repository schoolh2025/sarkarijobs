import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  email: string;
  preferences: {
    jobs: boolean;
    results: boolean;
    admissions: boolean;
    notifications: boolean;
  };
  categories: string[];
  isVerified: boolean;
  verificationToken: string;
  verificationExpires: Date;
  unsubscribeToken: string;
  lastNotified: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    preferences: {
      jobs: { type: Boolean, default: true },
      results: { type: Boolean, default: true },
      admissions: { type: Boolean, default: true },
      notifications: { type: Boolean, default: true },
    },
    categories: [{
      type: String,
      trim: true,
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    verificationExpires: {
      type: Date,
      required: true,
      default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours from now
    },
    unsubscribeToken: {
      type: String,
      required: true,
    },
    lastNotified: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ isVerified: 1 });
subscriptionSchema.index({ verificationToken: 1 });
subscriptionSchema.index({ unsubscribeToken: 1 });

// Virtual for checking if verification is expired
subscriptionSchema.virtual('isVerificationExpired').get(function(this: ISubscription) {
  return new Date() > this.verificationExpires;
});

// Method to generate verification token
subscriptionSchema.methods.generateVerificationToken = function() {
  this.verificationToken = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  this.verificationExpires = new Date(+new Date() + 24 * 60 * 60 * 1000); // 24 hours from now
};

// Method to generate unsubscribe token
subscriptionSchema.methods.generateUnsubscribeToken = function() {
  this.unsubscribeToken = Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

// Pre-save middleware to generate tokens if not present
subscriptionSchema.pre('save', function(next) {
  if (!this.verificationToken) {
    this.generateVerificationToken();
  }
  if (!this.unsubscribeToken) {
    this.generateUnsubscribeToken();
  }
  next();
});

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);