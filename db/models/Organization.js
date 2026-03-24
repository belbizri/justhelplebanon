import mongoose from 'mongoose';

/**
 * Organization Schema
 * Stores information about NGOs/organizations that receive donations
 */
const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: String,
    website: String,
    logo: String,
    featured: {
      type: Boolean,
      default: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    stats: {
      totalDonations: {
        type: Number,
        default: 0,
      },
      donorCount: {
        type: Number,
        default: 0,
      },
      totalAmount: {
        type: Number,
        default: 0,
      },
    },
    socialLinks: {
      instagram: String,
      facebook: String,
      twitter: String,
      whatsapp: String,
    },
    contact: {
      email: String,
      phone: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

organizationSchema.index({ category: 1 });
organizationSchema.index({ featured: 1 });
organizationSchema.index({ 'stats.totalAmount': -1 });

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

export default Organization;
