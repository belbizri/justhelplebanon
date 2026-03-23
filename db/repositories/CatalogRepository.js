import { BaseRepository } from './BaseRepository.js';
import Catalog from '../models/Catalog.js';

class CatalogRepository extends BaseRepository {
  constructor() {
    super(Catalog);
  }

  async getDefaultCatalog() {
    return this.findOne({ key: 'default' });
  }

  async upsertDefaultCatalog(catalog) {
    return this.upsertOne(
      { key: 'default' },
      {
        key: 'default',
        ...catalog,
      }
    );
  }

  async listProducts(filters = {}) {
    const { status, categoryId, marketCode, limit, skip } = filters;
    const catalog = await this.getDefaultCatalog();

    if (!catalog) {
      return [];
    }

    let products = catalog.products;

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
  }

  async getProductBySlug(slug) {
    const catalog = await this.getDefaultCatalog();
    return catalog?.products.find((product) => product.slug === slug) || null;
  }

  async getProductById(productId) {
    const catalog = await this.getDefaultCatalog();
    return catalog?.products.find((product) => product.id === productId) || null;
  }
}

const catalogRepository = new CatalogRepository();

export default catalogRepository;