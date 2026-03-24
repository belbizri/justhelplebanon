import express from 'express';
import {
  organizationService,
  donationService,
  userService,
  catalogService,
} from '../services/DataService.js';
import dbConnection from '../database.js';
import catalogSeedData from '../seed-data/catalogData.js';

const router = express.Router();

const getSeedCatalog = () => catalogSeedData?.catalog || { products: [] };

const getSeedProducts = (filters = {}) => {
  const { status, categoryId, marketCode, limit, skip } = filters;
  let products = Array.isArray(getSeedCatalog().products)
    ? [...getSeedCatalog().products]
    : [];

  if (status) {
    products = products.filter((product) => product.status === status);
  }

  if (categoryId) {
    products = products.filter((product) => product.category?.id === categoryId);
  }

  if (marketCode) {
    products = products.filter((product) =>
      product.availability?.regions?.includes(marketCode)
    );
  }

  const offset = Number.isFinite(skip) ? skip : 0;
  const cappedLimit = Number.isFinite(limit) ? limit : products.length;
  return products.slice(offset, offset + cappedLimit);
};

/* ═══════════════════════════════════════
   Organization Routes
   ═══════════════════════════════════════ */

/**
 * GET /api/organizations
 * Get all organizations with pagination
 */
router.get('/organizations', async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const organizations = await organizationService.getAllOrganizations({
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
    const stats = await organizationService.getStatistics();

    res.json({
      success: true,
      data: organizations,
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/organizations/featured
 * Get featured organizations
 */
router.get('/organizations/featured', async (req, res) => {
  try {
    const organizations = await organizationService.getFeaturedOrganizations({
      limit: 20,
    });
    res.json({ success: true, data: organizations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/organizations/top
 * Get top organizations by donations
 */
router.get('/organizations/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const organizations = await organizationService.getTopOrganizations(
      parseInt(limit)
    );
    res.json({ success: true, data: organizations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/organizations/search
 * Search organizations
 */
router.get('/organizations/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query required',
      });
    }
    const organizations = await organizationService.searchOrganizations(q);
    res.json({ success: true, data: organizations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/organizations/:slug
 * Get organization by slug
 */
router.get('/organizations/:slug', async (req, res) => {
  try {
    const organization = await organizationService.getOrganizationBySlug(
      req.params.slug
    );
    res.json({ success: true, data: organization });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

/* ═══════════════════════════════════════
   Donation Routes
   ═══════════════════════════════════════ */

/**
 * POST /api/donations
 * Record a new donation
 */
router.post('/donations', async (req, res) => {
  try {
    const { donor, organization, amount, currency, paymentMethod } = req.body;

    if (!donor || !organization || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: donor, organization, amount',
      });
    }

    const donation = await donationService.recordDonation({
      donor,
      organization,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      paymentMethod: paymentMethod || 'credit_card',
      status: 'completed',
    });

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: donation,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/donations/organization/:slug
 * Get donations for specific organization
 */
router.get('/donations/organization/:slug', async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const donations = await donationService.getDonationsByOrganization(
      req.params.slug,
      { limit: parseInt(limit), skip: parseInt(skip) }
    );
    const stats = await donationService.getOrganizationStats(req.params.slug);

    res.json({
      success: true,
      data: donations,
      stats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/donations/stats/overall
 * Get overall donation statistics
 */
router.get('/donations/stats/overall', async (req, res) => {
  try {
    const stats = await donationService.getOverallStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/donations/stats/timeline
 * Get donation timeline
 */
router.get('/donations/stats/timeline', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const timeline = await donationService.getDonationTimeline(parseInt(days));
    res.json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/donations/top-donors
 * Get top donors
 */
router.get('/donations/top-donors', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topDonors = await donationService.getTopDonors(parseInt(limit));
    res.json({ success: true, data: topDonors });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ═══════════════════════════════════════
   Catalog Routes
   ═══════════════════════════════════════ */

router.get('/catalog', async (req, res) => {
  try {
    const catalog = await catalogService.getCatalog();
    res.json({ success: true, data: catalog });
  } catch (error) {
    const fallbackCatalog = getSeedCatalog();
    res.json({
      success: true,
      data: fallbackCatalog,
      source: 'seed_fallback',
      warning: error.message,
    });
  }
});

router.get('/catalog/products', async (req, res) => {
  const { status, categoryId, marketCode, limit, skip } = req.query;

  try {
    const products = await catalogService.getProducts({
      status,
      categoryId,
      marketCode,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
      skip: skip ? Number.parseInt(skip, 10) : undefined,
    });
    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    const fallbackProducts = getSeedProducts({
      status,
      categoryId,
      marketCode,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
      skip: skip ? Number.parseInt(skip, 10) : undefined,
    });

    res.json({
      success: true,
      data: fallbackProducts,
      count: fallbackProducts.length,
      source: 'seed_fallback',
      warning: error.message,
    });
  }
});

router.get('/catalog/products/:slug', async (req, res) => {
  try {
    const product = await catalogService.getProductBySlug(req.params.slug);
    res.json({ success: true, data: product });
  } catch (error) {
    const fallbackProduct = getSeedProducts().find(
      (product) => product.slug === req.params.slug
    );

    if (!fallbackProduct) {
      res.status(404).json({ success: false, error: error.message });
      return;
    }

    res.json({
      success: true,
      data: fallbackProduct,
      source: 'seed_fallback',
      warning: error.message,
    });
  }
});

/* ═══════════════════════════════════════
   Health Check
   ═══════════════════════════════════════ */

/**
 * GET /api/health
 * Check API and database health
 */
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await dbConnection.healthCheck();
    const status = dbHealth.healthy ? 200 : 503;

    res.status(status).json({
      success: dbHealth.healthy,
      message: 'API is ' + (dbHealth.healthy ? 'healthy' : 'unhealthy'),
      database: dbHealth,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'API is unhealthy',
      error: error.message,
    });
  }
});

export default router;
