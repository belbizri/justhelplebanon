import mongoose from 'mongoose';

/**
 * Donation Schema
 * Records all donations made through the platform
 */
const donationSchema = new mongoose.Schema(
  {
    donor: {
      email: String,
      firstName: String,
      lastName: String,
      country: String,
    },
    organization: {
      name: String,
      slug: String,
      category: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'other'],
      default: 'credit_card',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    notes: String,
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

donationSchema.index({ 'organization.slug': 1 });
donationSchema.index({ 'donor.email': 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);

export default Donation;
