import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMongoOptions } from './db/database.js';
import catalogData from './db/seed-data/catalogData.js';

test('buildMongoOptions returns supported mongoose options', () => {
  const options = buildMongoOptions('justhelplebanon');

  assert.equal(options.dbName, 'justhelplebanon');
  assert.equal(options.maxPoolSize, 10);
  assert.equal(options.minPoolSize, 5);
  assert.equal(options.socketTimeoutMS, 45000);
  assert.equal(options.serverSelectionTimeoutMS, 5000);
  assert.equal(options.retryWrites, true);
  assert.equal(options.retryReads, true);
  assert.equal(options.w, 'majority');
  assert.ok(!('socketKeepAliveMS' in options));
});

test('catalog seed fallback contains active products', () => {
  const products = catalogData?.catalog?.products;

  assert.ok(Array.isArray(products));
  assert.ok(products.length > 0);
  assert.ok(products.every((product) => typeof product.slug === 'string' && product.slug.length > 0));
  assert.ok(products.some((product) => product.status === 'active'));
});

test('catalog seed products contain donation pricing metadata', () => {
  const firstProduct = catalogData.catalog.products[0];

  assert.ok(firstProduct);
  assert.equal(typeof firstProduct.pricing?.base_amount, 'number');
  assert.equal(typeof firstProduct.pricing?.cost?.logistics_total, 'number');
  assert.equal(firstProduct.donation?.is_donation_product, true);
});
