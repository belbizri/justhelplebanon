import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import { fetchCatalogProducts } from './services/catalogApi.js';

const AID_KITS_DONATION_URL = 'https://www.omprakash.org/global/blue-mission-organization/crowdfund/karama-project---blue-mission-organization';

const formatUsd = (value) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
}).format(value || 0);

function CatalogProductCard({ product }) {
  const targets = product.attributes?.target_group || [];
  const previewComponents = product.components?.slice(0, 3) || [];

  return (
    <article className="org-card catalog-org-card">
      <div className="org-card-body catalog-card-body">
        <div className="catalog-card-topline">
        <span className="catalog-card-category">{product.category?.name || 'Aid Kit'}</span>
        <span className={`catalog-card-status ${product.status === 'active' ? 'is-active' : ''}`}>
          {product.status}
        </span>
        </div>

        <div className="catalog-card-hero">
          <div>
            <h2 className="org-card-name catalog-card-title">{product.title}</h2>
            <p className="org-card-desc catalog-card-subtitle">{product.subtitle}</p>
          </div>
          <div className="catalog-price-block">
            <span className="catalog-price-label">Per kit</span>
            <strong className="catalog-price-value">{formatUsd(product.pricing?.base_amount)}</strong>
          </div>
        </div>

        <p className="org-card-desc catalog-card-description">{product.description}</p>

        <div className="catalog-impact-row">
          <div className="catalog-impact-pill">
            <span className="catalog-impact-pill-label">Impact</span>
            <strong>{product.donation?.impact_description}</strong>
          </div>
          <div className="catalog-impact-pill">
            <span className="catalog-impact-pill-label">Logistics</span>
            <strong>{formatUsd(product.pricing?.cost?.logistics_total)}</strong>
          </div>
        </div>

        <div className="catalog-component-panel">
          <div className="catalog-component-head">
            <h3>Inside the kit</h3>
            <span>{product.components?.length || 0} items</span>
          </div>
          <ul className="catalog-component-list">
            {previewComponents.map((component) => (
              <li key={component.id} className="catalog-component-item">
                <span>{component.name}</span>
                <strong>{component.quantity}x</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="org-card-actions catalog-card-actions">
        <div className="catalog-tag-row">
          {targets.map((target) => (
            <span key={target} className="catalog-chip">{target}</span>
          ))}
          {product.donation?.recurring_supported && <span className="catalog-chip">Recurring</span>}
        </div>
        <a
          className="org-card-cta catalog-card-cta"
          href={AID_KITS_DONATION_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Donate via Omprakash
        </a>
      </div>
    </article>
  );
}

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError('');

    fetchCatalogProducts({ status: 'active' }, controller.signal)
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((fetchError) => {
        if (fetchError.name !== 'AbortError') {
          setError('Could not load aid kits right now.');
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const categories = useMemo(() => {
    const unique = new Set(products.map((product) => product.category?.name).filter(Boolean));
    return ['All', ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter((product) => product.category?.name === activeCategory);
  }, [products, activeCategory]);

  const summary = useMemo(() => {
    const totalValue = filteredProducts.reduce((sum, product) => sum + (product.pricing?.base_amount || 0), 0);
    const recurringCount = filteredProducts.filter((product) => product.donation?.recurring_supported).length;
    return {
      totalValue,
      recurringCount,
      totalProducts: filteredProducts.length,
    };
  }, [filteredProducts]);

  return (
    <div className="page-root donations-page catalog-page-root">
      <NavBar />

      <header className="catalog-hero">
        <div className="catalog-hero-backdrop" />
        <div className="catalog-hero-grid" />
        <div className="catalog-hero-inner">
          <div className="catalog-hero-copy">
            <p className="catalog-eyebrow">Market-priced aid bundles for Lebanon</p>
            <h1 className="catalog-title">Sponsor essential kits with direct, visible impact.</h1>
            <p className="catalog-subtitle">
              Choose practical bundles built for real needs on the ground: food, hygiene, and baby care.
              Every kit is structured, priced, and ready to fund.
            </p>
            <div className="catalog-hero-actions">
              <a
                className="catalog-primary-btn"
                href={AID_KITS_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Donate Now
              </a>
              <Link to="/donations" className="catalog-secondary-btn">See Organisations</Link>
            </div>
          </div>

          <aside className="catalog-highlight-card">
            <span className="catalog-highlight-kicker">Why this format works</span>
            <ul className="catalog-highlight-list">
              <li>
                <strong>{summary.totalProducts}</strong>
                <span>active kits ready to fund</span>
              </li>
              <li>
                <strong>{formatUsd(summary.totalValue)}</strong>
                <span>combined visible value in this view</span>
              </li>
              <li>
                <strong>{summary.recurringCount}</strong>
                <span>kits support recurring sponsorship</span>
              </li>
            </ul>
          </aside>
        </div>
      </header>

      <main className="catalog-shell">
        <section className="catalog-toolbar">
          <div className="catalog-toolbar-copy">
            <h2>Browse aid kits by need</h2>
            <p>Pick a category, inspect what is inside the kit, and sponsor it with clarity.</p>
          </div>
          <div className="catalog-filter-row" role="tablist" aria-label="Aid kit categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={activeCategory === category}
                className={`catalog-filter-btn ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading && <div className="catalog-state-card">Loading aid kits...</div>}
        {!loading && error && <div className="catalog-state-card is-error">{error}</div>}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="catalog-state-card">No products are available in this category yet.</div>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <section className="catalog-grid" aria-label="Aid kits">
            {filteredProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </section>
        )}

        <section className="catalog-disclaimer" aria-label="Catalog disclaimer">
          <h2 className="catalog-disclaimer-title">Disclaimer</h2>
          <div className="catalog-disclaimer-body">
            <p>
              This page is not a commercial platform, and does not use any e-commerce system whatsoever,
              it exists solely as a basic catalog intended to provide transparency and guide potential donors
              as to where their contributions may go.
            </p>
            <p>
              No profit is generated from this page at any time. 
            </p>
           
            <p>
              All content is provided for informational purposes only, donations are made independently,
              and are not processed through this page, at any time.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}