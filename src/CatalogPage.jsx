import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import { trackEvent } from './analytics.js';
import { fetchCatalogProducts } from './services/catalogApi.js';
import catalogSeedData from '../db/seed-data/catalogData.js';
import usePageSeo from './usePageSeo.js';

const FALLBACK_PRODUCTS = (catalogSeedData?.catalog?.products || []).filter(
  (p) => p.status === 'active'
);

const PAYPAL_DONATION_URL = 'https://www.paypal.com/paypalme/belbizri';
const BITCOIN_ADDRESS = 'bc1qq4r20ts0wf99f4mt5m09ycv952hh385tzu9js4'; // a Bitcoin address, hardcoded in a .jsx file. art.
const BITCOIN_URI = `bitcoin:${BITCOIN_ADDRESS}`;
const BITCOIN_QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(BITCOIN_URI)}`;

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
    title: 'Aid Kits for Lebanon | Sponsor Food, Hygiene, and Baby Care Kits',
    description:
      'Sponsor aid kits for Lebanon with visible pricing and clear impact. Fund food assistance, hygiene supplies, and baby care kits through a verified humanitarian partner.',
    path: '/aid-kits',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Aid Kits for Lebanon',
      url: 'https://justhelplebanon.com/aid-kits',
      description:
        'Sponsor food, hygiene, and baby care kits for families in Lebanon with transparent, market-priced options.',
    },
  });

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [btcCopied, setBtcCopied] = useState(false);

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

  const handleBitcoinCopy = async () => {
    try {
      await navigator.clipboard.writeText(BITCOIN_ADDRESS);
      setBtcCopied(true);

      trackEvent('aid_kit_click', {
        location: 'catalog_hero',
        destination: 'bitcoin_copy',
        page: 'aid-kits',
      });

      setTimeout(() => setBtcCopied(false), 1600);
    } catch {
      setBtcCopied(false);
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
                href={PAYPAL_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="catalog-paypal-btn"
                aria-label="Donate via PayPal to sponsor an aid kit for Lebanon"
                onClick={() => {
                  trackEvent('aid_kit_click', {
                    location: 'catalog_hero',
                    destination: 'paypal',
                    page: 'aid-kits',
                  });
                }}
              >
                <span className="catalog-btn-content">
                  <span className="catalog-paypal-logo-badge" aria-hidden="true">
                    <svg className="catalog-paypal-logo-svg" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 170 48">
                      <path fill="#003087" d="M62.56 28.672a10.111 10.111 0 009.983-8.56c.78-4.967-3.101-9.303-8.6-9.303H55.08a.689.689 0 00-.69.585l-3.95 25.072a.643.643 0 00.634.742h4.69a.689.689 0 00.688-.585l1.162-7.365a.689.689 0 01.689-.586h4.257zm3.925-8.786c-.29 1.836-1.709 3.189-4.425 3.189h-3.474l1.053-6.68h3.411c2.81.006 3.723 1.663 3.435 3.496v-.005zm26.378-1.18H88.41a.69.69 0 00-.69.585l-.144.924s-3.457-3.775-9.575-1.225c-3.51 1.461-5.194 4.48-5.91 6.69 0 0-2.277 6.718 2.87 10.417 0 0 4.771 3.556 10.145-.22l-.093.589a.642.642 0 00.634.742h4.451a.689.689 0 00.69-.585l2.708-17.175a.643.643 0 00-.634-.742zm-6.547 9.492a4.996 4.996 0 01-4.996 4.276 4.513 4.513 0 01-1.397-.205c-1.92-.616-3.015-2.462-2.7-4.462a4.996 4.996 0 015.014-4.277c.474-.005.946.065 1.398.206 1.913.614 3.001 2.46 2.686 4.462h-.005z" />
                      <path fill="#0070E0" d="M126.672 28.672a10.115 10.115 0 009.992-8.56c.779-4.967-3.101-9.303-8.602-9.303h-8.86a.69.69 0 00-.689.585l-3.962 25.079a.637.637 0 00.365.683.64.64 0 00.269.06h4.691a.69.69 0 00.689-.586l1.163-7.365a.688.688 0 01.689-.586l4.255-.007zm3.925-8.786c-.29 1.836-1.709 3.189-4.426 3.189h-3.473l1.054-6.68h3.411c2.808.006 3.723 1.663 3.434 3.496v-.005zm26.377-1.18h-4.448a.69.69 0 00-.689.585l-.146.924s-3.456-3.775-9.574-1.225c-3.509 1.461-5.194 4.48-5.911 6.69 0 0-2.276 6.718 2.87 10.417 0 0 4.772 3.556 10.146-.22l-.093.589a.637.637 0 00.365.683c.084.04.176.06.269.06h4.451a.686.686 0 00.689-.586l2.709-17.175a.657.657 0 00-.148-.518.632.632 0 00-.49-.224zm-6.546 9.492a4.986 4.986 0 01-4.996 4.276 4.513 4.513 0 01-1.399-.205c-1.921-.616-3.017-2.462-2.702-4.462a4.996 4.996 0 014.996-4.277c.475-.005.947.064 1.399.206 1.933.614 3.024 2.46 2.707 4.462h-.005z" />
                      <path fill="#003087" d="M109.205 19.131l-5.367 9.059-2.723-8.992a.69.69 0 00-.664-.492h-4.842a.516.516 0 00-.496.689l4.88 15.146-4.413 7.138a.517.517 0 00.442.794h5.217a.858.858 0 00.741-.418l13.632-22.552a.516.516 0 00-.446-.789h-5.215a.858.858 0 00-.746.417z" />
                      <path fill="#0070E0" d="M161.982 11.387l-3.962 25.079a.637.637 0 00.365.683c.084.04.176.06.269.06h4.689a.688.688 0 00.689-.586l3.963-25.079a.637.637 0 00-.146-.517.645.645 0 00-.488-.225h-4.69a.69.69 0 00-.689.585z" />
                      <path fill="#001C64" d="M37.146 22.26c-1.006 5.735-5.685 10.07-11.825 10.07h-3.898c-.795 0-1.596.736-1.723 1.55l-1.707 10.835c-.099.617-.388.822-1.013.822h-6.27c-.634 0-.784-.212-.689-.837l.72-7.493-7.526-.389c-.633 0-.862-.345-.772-.977l5.135-32.56c.099-.617.483-.882 1.106-.882h13.023c6.269 0 10.235 4.22 10.72 9.692 3.73 2.52 5.474 5.873 4.72 10.168z" />
                      <path fill="#0070E0" d="M12.649 25.075l-1.907 12.133-1.206 7.612a1.034 1.034 0 001.016 1.19h6.622a1.27 1.27 0 001.253-1.072l1.743-11.06a1.27 1.27 0 011.253-1.071h3.898A12.46 12.46 0 0037.617 22.26c.675-4.307-1.492-8.228-5.201-10.165a9.96 9.96 0 01-.12 1.37 12.461 12.461 0 01-12.295 10.54h-6.1a1.268 1.268 0 00-1.252 1.07z" />
                      <path fill="#003087" d="M10.741 37.208H3.03a1.035 1.035 0 01-1.018-1.192L7.208 3.072A1.268 1.268 0 018.46 2H21.7c6.269 0 10.827 4.562 10.72 10.089a11.567 11.567 0 00-5.399-1.287H15.983a1.27 1.27 0 00-1.254 1.071l-2.08 13.202-1.908 12.133z" />
                    </svg>
                  </span>
                  <span>Donate via PayPal</span>
                </span>
              </a>
              <a
                href="https://www.omprakash.org/global/blue-mission-organization/crowdfund/karama-project---blue-mission-organization"
                target="_blank"
                rel="noopener noreferrer"
                className="catalog-primary-btn"
                aria-label="Donate via Omprakash to sponsor an aid kit for Lebanon"
                onClick={() => {
                  trackEvent('aid_kit_click', {
                    location: 'catalog_hero',
                    destination: 'omprakash',
                    page: 'aid-kits',
                  });
                }}
              >
                <span className="catalog-btn-content">
                  <span className="catalog-omprakash-logo-wrap" aria-hidden="true">
                    <img
                      className="catalog-omprakash-logo"
                      src="/images/Omprakash__footer__logo.webp"
                      alt=""
                      loading="lazy"
                    />
                  </span>
                  <span>Donate via Omprakash</span>
                </span>
              </a>
              <Link to="/donations" className="catalog-secondary-btn">See Organisations</Link>
            </div>

            <div className="catalog-btc-panel" role="region" aria-label="Donate with Bitcoin">
              <div className="catalog-btc-copy">
                <span className="catalog-btc-label">Bitcoin Wallet</span>
                <code className="catalog-btc-address">{BITCOIN_ADDRESS}</code>

                <div className="catalog-btc-actions">
                  <a
                    href={BITCOIN_URI}
                    className="catalog-btc-wallet-btn"
                    onClick={() => {
                      trackEvent('aid_kit_click', {
                        location: 'catalog_hero',
                        destination: 'bitcoin_wallet',
                        page: 'aid-kits',
                      });
                    }}
                  >
                    <span className="catalog-btn-content">
                      <span className="catalog-btc-logo-wrap" aria-hidden="true">
                        <img
                          className="catalog-btc-logo"
                          src="/images/svg/bitcoin-btc-logo.svg"
                          alt=""
                          loading="lazy"
                        />
                      </span>
                      <span>Donate with Bitcoin</span>
                    </span>
                  </a>
                  <button type="button" className="catalog-btc-copy-btn" onClick={handleBitcoinCopy}>
                    {btcCopied ? 'Copied' : 'Copy Address'}
                  </button>
                </div>
              </div>

              <div className="catalog-btc-qr-wrap">
                <img
                  className="catalog-btc-qr"
                  src={BITCOIN_QR_URL}
                  alt="QR code for Bitcoin donation wallet"
                  loading="lazy"
                />
              </div>
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