import { BaseRepository } from './BaseRepository.js';
import Donation from '../models/Donation.js';

/**
 * Donation Repository
 * Data access layer for Donation operations and analytics
 */
class DonationRepository extends BaseRepository {
  constructor() {
    super(Donation);
  }

  /**
   * Find donations by organization slug
   */
  async findByOrganization(slug, options = {}) {
    return this.find({ 'organization.slug': slug }, options);
  }

  /**
   * Find donations by donor email
   */
  async findByDonor(email, options = {}) {
    return this.find({ 'donor.email': email.toLowerCase() }, options);
  }

  /**
   * Find completed donations
   */
  async findCompleted(options = {}) {
    return this.find({ status: 'completed' }, options);
  }

  /**
   * Get total donations for organization
   */
  async getTotalByOrganization(slug) {
    const result = await this.aggregate([
      { $match: { 'organization.slug': slug, status: 'completed' } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' },
        },
      },
    ]);
    return result[0] || { total: 0, count: 0, average: 0 };
  }

  /**
   * Get donations by organization (aggregated)
   */
  async getDonationsByOrganization() {
    return this.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$organization.slug',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          amount: { $avg: '$amount' },
          organization: { $first: '$organization.name' },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  /**
   * Get donations by category
   */
  async getDonationsByCategory() {
    return this.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$organization.category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
  }

  /**
   * Get donation timeline
   */
  async getDonationTimeline(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  /**
   * Get top donors
   */
  async getTopDonors(limit = 10) {
    return this.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$donor.email',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          name: { $first: { $concat: ['$donor.firstName', ' ', '$donor.lastName'] } },
        },
      },
      { $sort: { total: -1 } },
      { $limit: limit },
    ]);
  }

  /**
   * Mark donation as completed
   */
  async markCompleted(id) {
    return this.updateById(id, { status: 'completed' });
  }

  /**
   * Get pending donations
   */
  async getPending(options = {}) {
    return this.find({ status: 'pending' }, options);
  }

  /**
   * Get overall statistics
   */
  async getStatistics() {
    const result = await this.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalDonations: { $sum: 1 },
          averageDonation: { $avg: '$amount' },
          maxDonation: { $max: '$amount' },
          minDonation: { $min: '$amount' },
          uniqueDonors: { $addToSet: '$donor.email' },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          totalDonations: 1,
          averageDonation: { $round: ['$averageDonation', 2] },
          maxDonation: 1,
          minDonation: 1,
          uniqueDonorCount: { $size: '$uniqueDonors' },
        },
      },
    ]);
    return result[0] || {
      totalAmount: 0,
      totalDonations: 0,
      averageDonation: 0,
      maxDonation: 0,
      minDonation: 0,
      uniqueDonorCount: 0,
    };
  }
}

const donationRepository = new DonationRepository();
export default donationRepository;
