import mongoose from 'mongoose';

const marketSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const marketPriceSchema = new mongoose.Schema(
  {
    market_code: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const componentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: null },
    quantity: { type: Number, required: true, min: 0 },
    unit_of_measure: { type: String, required: true, trim: true },
    pack_size: { type: String, default: null },
    unit_price: { type: Number, required: true, min: 0 },
    total_price: { type: Number, required: true, min: 0 },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    category: {
      id: { type: String, required: true, trim: true },
      name: { type: String, required: true, trim: true },
    },
    tags: { type: [String], default: [] },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: null },
    description: { type: String, required: true },
    short_description: { type: String, default: null },
    brand: { type: String, default: null },
    vendor: { type: String, default: null },
    images: { type: [String], default: [] },
    thumbnail: { type: String, default: null },
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    pricing: {
      currency_mode: { type: String, required: true, trim: true },
      base_amount: { type: Number, required: true, min: 0 },
      compare_at_amount: { type: Number, default: null },
      cost: {
        items_total: { type: Number, required: true, min: 0 },
        logistics_total: { type: Number, required: true, min: 0 },
        tax_total: { type: Number, default: null },
      },
      currency_by_market: { type: [marketPriceSchema], default: [] },
    },
    inventory: {
      track_inventory: { type: Boolean, default: false },
      quantity_available: { type: Number, default: null },
      allow_backorder: { type: Boolean, default: false },
      stock_status: { type: String, required: true, trim: true },
    },
    availability: {
      is_available: { type: Boolean, default: true },
      regions: { type: [String], default: [] },
      channels: { type: [String], default: [] },
      start_date: { type: Date, default: null },
      end_date: { type: Date, default: null },
    },
    shipping: {
      requires_shipping: { type: Boolean, default: false },
      is_physical: { type: Boolean, default: false },
      weight: { type: mongoose.Schema.Types.Mixed, default: null },
      dimensions: { type: mongoose.Schema.Types.Mixed, default: null },
      shipping_class: { type: String, default: null },
      logistics_item: {
        name: { type: String, default: null },
        amount: { type: Number, default: null },
      },
    },
    donation: {
      is_donation_product: { type: Boolean, default: false },
      donation_type: { type: String, default: null },
      sponsorship_model: { type: String, default: null },
      impact_unit: { type: String, default: null },
      impact_description: { type: String, default: null },
      dedication_supported: { type: Boolean, default: false },
      recurring_supported: { type: Boolean, default: false },
    },
    seo: {
      meta_title: { type: String, default: null },
      meta_description: { type: String, default: null },
      slug: { type: String, default: null },
    },
    metadata: {
      created_at: { type: Date, default: null },
      updated_at: { type: Date, default: null },
      published_at: { type: Date, default: null },
      external_reference: { type: String, default: null },
    },
    components: { type: [componentSchema], default: [] },
  },
  { _id: false }
);

const catalogSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
      trim: true,
    },
    version: { type: String, required: true, trim: true },
    default_locale: { type: String, required: true, trim: true },
    currency_mode: { type: String, required: true, trim: true },
    supported_markets: { type: [marketSchema], default: [] },
    products: { type: [productSchema], default: [] },
  },
  { timestamps: true }
);

catalogSchema.index({ 'products.slug': 1 });
catalogSchema.index({ 'products.id': 1 });
catalogSchema.index({ 'products.sku': 1 });
catalogSchema.index({ 'products.category.id': 1 });
catalogSchema.index({ 'products.status': 1 });

const Catalog = mongoose.models.Catalog || mongoose.model('Catalog', catalogSchema);

export default Catalog;