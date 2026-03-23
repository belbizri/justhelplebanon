import { BaseRepository } from './BaseRepository.js';
import Organization from '../models/Organization.js';

/**
 * Organization Repository
 * Data access layer for Organization operations
 */
class OrganizationRepository extends BaseRepository {
  constructor() {
    super(Organization);
  }

  /**
   * Find organization by slug
   */
  async findBySlug(slug) {
    return this.findOne({ slug: slug.toLowerCase() });
  }

  /**
   * Get organizations by category
   */
  async findByCategory(category, options = {}) {
    return this.find({ category }, options);
  }

  /**
   * Get featured organizations
   */
  async getFeatured(options = {}) {
    return this.find({ featured: true, verified: true }, options);
  }

  /**
   * Get verified organizations
   */
  async getVerified(options = {}) {
    return this.find({ verified: true }, options);
  }

  /**
   * Search organizations
   */
  async search(searchTerm, options = {}) {
    const regex = new RegExp(searchTerm, 'i');
    return this.find(
      {
        $or: [
          { name: regex },
          { slug: regex },
          { description: regex },
        ],
      },
      options
    );
  }

  /**
   * Get organizations sorted by total donations
   */
  async getTopByDonations(limit = 10) {
    return this.find({}, { limit, sort: { 'stats.totalAmount': -1 } });
  }

  /**
   * Update organization statistics
   */
  async updateStats(slug, totalAmount, donorCount) {
    return this.model.findOneAndUpdate(
      { slug },
      {
        $inc: {
          'stats.totalDonations': 1,
          'stats.totalAmount': totalAmount,
        },
        $set: {
          'stats.donorCount': donorCount,
        },
      },
      { new: true }
    );
  }

  /**
   * Increment total amount for organization
   */
  async addDonation(slug, amount) {
    return this.model.findOneAndUpdate(
      { slug },
      {
        $inc: {
          'stats.totalDonations': 1,
          'stats.totalAmount': amount,
        },
      },
      { new: true }
    );
  }

  /**
   * Mark organization as verified
   */
  async verify(id) {
    return this.updateById(id, { verified: true });
  }

  /**
   * Get all organizations grouped by category
   */
  async getGroupedByCategory() {
    return this.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          organizations: { $push: '$$ROOT' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get organization statistics
   */
  async getStatistics() {
    const result = await this.aggregate([
      {
        $group: {
          _id: null,
          totalOrganizations: { $sum: 1 },
          verifiedOrganizations: {
            $sum: { $cond: ['$verified', 1, 0] },
          },
          featuredOrganizations: {
            $sum: { $cond: ['$featured', 1, 0] },
          },
          totalDonations: { $sum: '$stats.totalAmount' },
          averageDonationsPerOrg: {
            $avg: '$stats.totalAmount',
          },
        },
      },
    ]);
    return result[0] || {
      totalOrganizations: 0,
      verifiedOrganizations: 0,
      featuredOrganizations: 0,
      totalDonations: 0,
      averageDonationsPerOrg: 0,
    };
  }
}

const organizationRepository = new OrganizationRepository();
export default organizationRepository;
