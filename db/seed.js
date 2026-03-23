#!/usr/bin/env node

/**
 * MongoDB Seed Script
 * Populates initial data into the database
 * Usage: node db/seed.js
 */

import 'dotenv/config';
import dbConnection from './database.js';
import organizationRepository from './repositories/OrganizationRepository.js';
import catalogRepository from './repositories/CatalogRepository.js';
import catalogData from './seed-data/catalogData.js';

const sampleOrganizations = [
  {
    name: 'Lebanese Red Cross',
    slug: 'lebanese-red-cross',
    category: 'Food & Medical Aid',
    description: 'The primary emergency-response organisation in Lebanon',
    website: 'https://www.redcross.org.lb/',
    logo: 'https://www.ifrc.org/sites/default/files/media/logo/2021-08/lebanon_red_cross_logo.png',
    featured: true,
    verified: true,
    stats: {
      totalDonations: 0,
      donorCount: 0,
      totalAmount: 0,
    },
    socialLinks: {
      facebook: 'https://www.facebook.com/RedCrescentLB/',
      instagram: 'https://www.instagram.com/redcrescentlb/',
    },
  },
  {
    name: 'Baytna Baytak',
    slug: 'baytna-baytak',
    category: 'Shelter & Reconstruction',
    description: 'Opens its doors as a community shelter providing free housing',
    website: 'https://www.baytnabaytak.org/',
    featured: true,
    verified: true,
    stats: {
      totalDonations: 0,
      donorCount: 0,
      totalAmount: 0,
    },
  },
  {
    name: 'Human of Tomorrow',
    slug: 'human-of-tomorrow',
    category: 'Food & Medical Aid',
    description: 'Empowering underserved communities through development initiatives',
    website: 'https://www.instagram.com/humanoftomorrow/',
    featured: true,
    verified: true,
    stats: {
      totalDonations: 0,
      donorCount: 0,
      totalAmount: 0,
    },
  },
  {
    name: 'Lebanese Food Bank',
    slug: 'lebanese-food-bank',
    category: 'Food & Medical Aid',
    description: 'Fights hunger and food waste by collecting and distributing surplus food',
    website: 'https://www.lebanesefoodbank.org/',
    featured: false,
    verified: true,
    stats: {
      totalDonations: 0,
      donorCount: 0,
      totalAmount: 0,
    },
  },
];

const seed = async () => {
  try {
    console.log('🌱 Starting database seed...\n');

    // Connect to database
    await dbConnection.connect();

    // Seed organizations
    console.log('📝 Syncing organizations...');
    for (const org of sampleOrganizations) {
      const existing = await organizationRepository.findBySlug(org.slug);
      if (existing) {
        await organizationRepository.updateById(existing.id, org);
        console.log(`  ↺ Updated: ${org.name} (${org.slug})`);
      } else {
        const created = await organizationRepository.create(org);
        console.log(`  ✓ Created: ${created.name} (${created.slug})`);
      }
    }

    console.log('🧺 Syncing catalog...');
    const catalog = await catalogRepository.upsertDefaultCatalog(catalogData.catalog);
    console.log(`  ✓ Catalog synced with ${catalog.products.length} products`);

    console.log('\n✓ Database seed completed successfully!');
    console.log(`  Total organizations: ${sampleOrganizations.length}`);

    // Verify
    const stats = await organizationRepository.getStatistics();
    console.log('\n📊 Organization Statistics:');
    console.log(`  Total Organizations: ${stats.totalOrganizations}`);
    console.log(`  Verified: ${stats.verifiedOrganizations}`);
    console.log(`  Featured: ${stats.featuredOrganizations}`);

    await dbConnection.disconnect();
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seed();
