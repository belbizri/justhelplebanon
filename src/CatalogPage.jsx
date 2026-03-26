import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import { trackEvent } from './analytics.js';
import { fetchCatalogProducts } from './services/catalogApi.js';
import catalogSeedData from '../db/seed-data/catalogData.js';
import usePageSeo from './usePageSeo.js';

// social proof TEST concept purely cosmetic for now untill Sunday funday 2:04 AM. 
const DONOR_NAMES = [
  'Nour', 'Yara', 'Karim', 'Layla', 'Omar', 'Rania', 'Hassan', 'Dina',
  'Sami', 'Lina', 'Ahmad', 'Maya', 'Tarek', 'Farah', 'Ziad', 'Hana',
  'Rami', 'Sara', 'Fadi', 'Nadine', 'Jad', 'Amal', 'Walid', 'Reem',
  'Marwan', 'Zeina', 'Bilal', 'Lara', 'Khaled', 'Nadia', 'Ali', 'Tala',
  'Elias', 'Mira', 'Samir', 'Joulie', 'Wael', 'Dana', 'Mazen', 'Rita',
];

const DONOR_LOCATIONS = [
  'Beirut', 'Montreal', 'Ottawa', 'Dubai', 'Paris', 'Sydney',
  'London', 'Toronto', 'Detroit', 'São Paulo', 'Berlin', 'Tripoli',
];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount() {
  return Math.floor(Math.random() * 17) * 5 + 20; // 20, 25, 30 … 100
}

function SocialProofToast() {
  const [toast, setToast] = useState(null);
  const [visible, setVisible] = useState(false);

  const showNext = useCallback(() => {
    const name = pickRandom(DONOR_NAMES);
    const city = pickRandom(DONOR_LOCATIONS);
    const amount = randomAmount();
    const timeAgo = Math.floor(Math.random() * 55) + 2; // "2 min ago" → "57 min ago"

    setToast({ name, city, amount, timeAgo });
    setVisible(true);

    // hide after 4s
    setTimeout(() => setVisible(false), 4000);
  }, []);

  useEffect(() => {
    // first toast after 6–12s
    const initial = setTimeout(showNext, 6000 + Math.random() * 6000);
    // then every 12–22s
    const interval = setInterval(showNext, 12000 + Math.random() * 10000);
    return () => { clearTimeout(initial); clearInterval(interval); };
  }, [showNext]);

  if (!toast) return null;

  return (
    <div className={`social-proof-toast ${visible ? 'is-visible' : ''}`} aria-live="polite">
      <span className="social-proof-icon" aria-hidden="true">❤️</span>
      <div className="social-proof-body">
        <strong>{toast.name}</strong> from {toast.city} donated <strong>${toast.amount}</strong>
        <span className="social-proof-time">{toast.timeAgo} min ago</span>
      </div>
    </div>
  );
}

const FALLBACK_PRODUCTS = (catalogSeedData?.catalog?.products || []).filter(
  (p) => p.status === 'active'
);

// PayPal + Bitcoin temporarily removed — revisiting soon

const formatUsd = (value) => new Intl.NumberFormat('en-US', { // || 0 below: because NaN in a donation total is not a vibe
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
}).format(value || 0);

function CatalogProductCard({ product }) {
  const targets = product.attributes?.target_group || [];
  const previewComponents = product.components?.slice(0, 3) || [];

  return (
    <article className="org-card catalog-org-card">
      {product.thumbnail && (
        <div className="catalog-card-img-wrap">
          <img
            className="catalog-card-img"
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
          />
        </div>
      )}
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
      </div>
    </article>
  );
}

export default function CatalogPage() {
  usePageSeo({
    title: 'Just Help Lebanon | Aid Kits, Donations & Humanitarian Support',
    description:
      'Sponsor aid kits for Lebanon with visible pricing and clear impact. Fund food assistance, hygiene supplies, and baby care kits through verified humanitarian partners.',
    path: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Just Help Lebanon',
      url: 'https://justhelplebanon.com',
      description:
        'Sponsor food, hygiene, and baby care kits for families in Lebanon with transparent, market-priced options.',
    },
  });

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
          setProducts(FALLBACK_PRODUCTS);
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

  const isDesktop = typeof window !== 'undefined' && window.innerWidth > 768;

  const handleDonateClick = () => {
    if (!isDesktop) return;
    try {
      (window.requestIdleCallback || setTimeout)(() => {
        trackEvent('aid_kit_click', {
          location: 'catalog_hero',
          destination: 'omprakash',
          page: 'aid-kits',
        });
      });
    } catch (e) {
      console.error('trackEvent failed', e);
    }
  };

  return (
    <div className="page-root donations-page catalog-page-root">
      <NavBar />

      <header className="catalog-hero">
        <div className="catalog-hero-aurora" aria-hidden="true" />
        <div className="catalog-hero-dots" aria-hidden="true" />
        <img className="catalog-hero-cedar" src="/images/svg/Cedar.svg" aria-hidden="true" alt="" />
        <div className="catalog-hero-watermark" aria-hidden="true">لبنان</div>
        <div className="catalog-hero-slash" aria-hidden="true" />

        <div className="catalog-hero-inner">
          <div className="catalog-hero-copy">
            <div className="catalog-live-badge">
              <span className="catalog-live-dot" />
              <span>Live Aid Catalog</span>
              <span className="catalog-live-sep">·</span>
              <span>Market-Priced · Lebanon</span>
            </div>

            <h1 className="catalog-title">
              <span className="catalog-title-line1">Sponsor what</span>
              <span className="catalog-title-line2">Lebanon&nbsp;needs.</span>
            </h1>

            <p className="catalog-subtitle">
              Built for real emergencies
            </p>

            <div className="catalog-hero-actions">
              <a
                href="https://www.omprakash.org/global/blue-mission-organization/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="catalog-primary-btn"
                aria-label="Donate via Omprakash — tax-deductible"
                onClick={handleDonateClick}
              >
                <span className="catalog-btn-content">
                  <span className="catalog-omprakash-logo-wrap" aria-hidden="true">
                    <img
                      className="catalog-omprakash-logo"
                      src="/images/svg/omprakash_logo.svg"
                      alt=""
                    />
                  </span>
                  <span>Donate via Omprakash</span>
                </span>
              </a>
              <Link to="/donations" className="catalog-secondary-btn">See Organisations</Link>
            </div>

            <div className="catalog-tax-info" role="region" aria-label="Tax deduction information">
              <div className="catalog-tax-badge">✓ Tax-Deductible</div>
              <p className="catalog-tax-headline">
                Your donation through Omprakash is <strong>tax-deductible</strong>.
              </p>
              <p className="catalog-tax-explain">
                Tax-deductible means you can deduct the amount you donate from your taxable income when you file your taxes.
                This lowers the total income you owe taxes on, so you pay less in taxes while helping families in Lebanon.
              </p>
              <p className="catalog-tax-example">
                <strong>Example:</strong> If you earn $60,000 and donate $100, you only pay taxes on $59,900.
                Omprakash is a registered 501(c)(3) nonprofit, your donation qualifies automatically.
              </p>
            </div>

            <div className="catalog-hero-micro-stats">
              <div className="catalog-micro-stat">
                <strong>{summary.totalProducts}</strong>
                <span>kits</span>
              </div>
              <div className="catalog-micro-stat-sep" />
              <div className="catalog-micro-stat">
                <strong>$21</strong>
                <span>from</span>
              </div>
              <div className="catalog-micro-stat-sep" />
              <div className="catalog-micro-stat">
                <strong>100%</strong>
                <span>transparent</span>
              </div>
              <div className="catalog-micro-stat-sep" />
              <div className="catalog-micro-stat">
                <strong>Lebanon</strong>
                <span>delivery</span>
              </div>
            </div>
          </div>

          <aside className="catalog-highlight-card">
            <div className="catalog-highlight-header">
              <span className="catalog-highlight-kicker">Why this works</span>
              <span className="catalog-highlight-verified">✓ Verified</span>
            </div>
            <h2 className="catalog-highlight-title">High-trust giving. Visible impact.</h2>
            <p className="catalog-highlight-subtitle">
              Every contribution maps to a clear aid pathway with transparent kit economics.
            </p>
            <ul className="catalog-highlight-list">
              <li>
                <strong>{summary.totalProducts}</strong>
                <span>active kits ready to fund today</span>
              </li>
              <li>
                <strong>{formatUsd(summary.totalValue)}</strong>
                <span>combined visible value across kits</span>
              </li>
              <li>
                <strong>{summary.recurringCount}</strong>
                <span>kits support recurring giving options</span>
              </li>
            </ul>
            <p className="catalog-highlight-footnote">Built for urgency. Built for trust.</p>
          </aside>
        </div>
      </header>

      <SocialProofToast />

      <section className="lrc-thankyou-section" aria-label="Lebanese Red Cross objective completed">
        <div className="lrc-thankyou-inner">
          <div className="lrc-thankyou-badge">✓ Objective Completed</div>
          <h2 className="lrc-thankyou-heading">Thank you to everyone who donated to the Lebanese Red Cross</h2>
          <p className="lrc-thankyou-text">
            Thanks to your generosity, our Lebanese Red Cross fundraising objective has been completed.
            Your contributions helped provide emergency medical kits, shelter supplies, and food for families across Lebanon.
          </p>
          <div className="lrc-thankyou-stats">
            <div className="lrc-thankyou-stat">
              <strong>$87.3M</strong>
              <span>Total humanitarian funding (Lebanon 2026)</span>
            </div>
            <div className="lrc-thankyou-stat">
              <strong>$37.7M</strong>
              <span>Canada's announced aid (March 2026)</span>
            </div>
          </div>
          <p className="lrc-thankyou-note">
            The LRC campaign page is still accessible at <Link to="/lrc" className="lrc-thankyou-link">/lrc</Link> for reference.
          </p>
        </div>
      </section>

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