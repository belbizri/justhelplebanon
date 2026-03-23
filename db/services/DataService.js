import userRepository from '../repositories/UserRepository.js';
import donationRepository from '../repositories/DonationRepository.js';
import organizationRepository from '../repositories/OrganizationRepository.js';
import catalogRepository from '../repositories/CatalogRepository.js';

/**
 * Data Service Layer
 * Orchestrates repositories and provides business logic
 */

export const userService = {
  /**
   * Create new user
   */
  async createUser(userData) {
    const existing = await userRepository.findByEmail(userData.email);
    if (existing) {
      throw new Error('User with this email already exists');
    }
    return userRepository.create(userData);
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  /**
   * Get all active users
   */
  async getActiveUsers(options) {
    return userRepository.getActiveUsers(options);
  },

  /**
   * Update user
   */
  async updateUser(id, userData) {
    return userRepository.updateById(id, userData);
  },

  /**
   * Delete user
   */
  async deleteUser(id) {
    return userRepository.deleteById(id);
  },
};

export const donationService = {
  /**
   * Record new donation
   */
  async recordDonation(donationData) {
    const donation = await donationRepository.create(donationData);

    // Update organization stats
    if (donationData.organization?.slug) {
      await organizationRepository.addDonation(
        donationData.organization.slug,
        donationData.amount
      );
    }

    return donation;
  },

  /**
   * Get donations for organization
   */
  async getDonationsByOrganization(slug, options) {
    return donationRepository.findByOrganization(slug, options);
  },

  /**
   * Get organization stats
   */
  async getOrganizationStats(slug) {
    return donationRepository.getTotalByOrganization(slug);
  },

  /**
   * Get all donations stats
   */
  async getOverallStats() {
    return donationRepository.getStatistics();
  },

  /**
   * Get top donors
   */
  async getTopDonors(limit = 10) {
    return donationRepository.getTopDonors(limit);
  },

  /**
   * Get donation timeline
   */
  async getDonationTimeline(days = 30) {
    return donationRepository.getDonationTimeline(days);
  },

  /**
   * Confirm donation
   */
  async confirmDonation(id) {
    const donation = await donationRepository.markCompleted(id);
    if (donation?.organization?.slug) {
      // Optionally update organization stats
      await organizationRepository.addDonation(
        donation.organization.slug,
        0 // stats already updated on creation
      );
    }
    return donation;
  },

  /**
   * Get pending donations
   */
  async getPendingDonations(options) {
    return donationRepository.getPending(options);
  },
};

export const organizationService = {
  /**
   * Get all organizations
   */
  async getAllOrganizations(options) {
    return organizationRepository.find({}, options);
  },

  /**
   * Get organization by slug
   */
  async getOrganizationBySlug(slug) {
    const org = await organizationRepository.findBySlug(slug);
    if (!org) {
      throw new Error('Organization not found');
    }
    return org;
  },

  /**
   * Get featured organizations
   */
  async getFeaturedOrganizations(options) {
    return organizationRepository.getFeatured(options);
  },

  /**
   * Get organizations by category
   */
  async getOrganizationsByCategory(category, options) {
    return organizationRepository.findByCategory(category, options);
  },

  /**
   * Search organizations
   */
  async searchOrganizations(query, options) {
    return organizationRepository.search(query, options);
  },

  /**
   * Get top organizations by donations
   */
  async getTopOrganizations(limit = 10) {
    return organizationRepository.getTopByDonations(limit);
  },

  /**
   * Create organization
   */
  async createOrganization(orgData) {
    const existing = await organizationRepository.findBySlug(orgData.slug);
    if (existing) {
      throw new Error('Organization with this slug already exists');
    }
    return organizationRepository.create(orgData);
  },

  /**
   * Update organization
   */
  async updateOrganization(id, orgData) {
    return organizationRepository.updateById(id, orgData);
  },

  /**
   * Get organization statistics
   */
  async getStatistics() {
    return organizationRepository.getStatistics();
  },

  /**
   * Get organizations grouped by category
   */
  async getGroupedByCategory() {
    return organizationRepository.getGroupedByCategory();
  },
};

export const catalogService = {
  async syncCatalog(catalogData) {
    return catalogRepository.upsertDefaultCatalog(catalogData);
  },

  async getCatalog() {
    const catalog = await catalogRepository.getDefaultCatalog();
    if (!catalog) {
      throw new Error('Catalog not found');
    }
    return catalog;
  },

  async getProducts(filters) {
    return catalogRepository.listProducts(filters);
  },

  async getProductBySlug(slug) {
    const product = await catalogRepository.getProductBySlug(slug);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },
};

export default {
  userService,
  donationService,
  organizationService,
  catalogService,
};
