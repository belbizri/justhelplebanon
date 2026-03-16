import React from 'react';
import { Link } from 'react-router-dom';

const DONATION_URL = 'https://give.redcross.ca/page/LHNA';

export default function DonationsPage() {
  return (
    <div className="page-root donations-page">
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/donations" className="nav-link active">Donations</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>

      <header className="page-header donations-header">
        <h1 className="page-title">Donate to Help Lebanon</h1>
        <p className="page-subtitle">
          Every dollar saves lives. All donations go directly to the Lebanese Red Cross through the official Canadian Red Cross portal.
        </p>
      </header>

      <main className="donations-content">
        {/* How your donation helps */}
        <section className="donations-impact">
          <h2 className="donations-section-title">How Your Donation Helps</h2>
          <div className="donations-cards">
            <div className="donation-card">
              <div className="donation-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>Emergency Medical Kits</h3>
              <p>Provides life-saving medical supplies to hospitals and field clinics across Lebanon.</p>
            </div>
            <div className="donation-card">
              <div className="donation-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
              </div>
              <h3>Shelter &amp; Housing</h3>
              <p>Supports displaced families with temporary shelter, blankets, and essential supplies.</p>
            </div>
            <div className="donation-card">
              <div className="donation-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 010 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
              </div>
              <h3>Food &amp; Water</h3>
              <p>Delivers food packages and clean water to families in crisis-affected areas.</p>
            </div>
            <div className="donation-card">
              <div className="donation-card-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              </div>
              <h3>Healthcare Access</h3>
              <p>Funds ambulance services and rebuilds damaged health facilities across governorates.</p>
            </div>
          </div>
        </section>

        {/* Donate CTA */}
        <section className="donations-cta">
          <div className="donations-cta-inner">
            <h2>Ready to Make a Difference?</h2>
            <p>Your donation goes through the official Canadian Red Cross — a trusted and verified humanitarian partner. 100% reaches families in need.</p>
            <a
              href={DONATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="donations-btn"
            >
              Donate Now via Red Cross
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="donations-btn-arrow">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <p className="donations-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Secure donation — SSL encrypted
            </p>
          </div>
        </section>

        {/* Trust signals */}
        <section className="donations-trust">
          <h2 className="donations-section-title">Why Donate Through Us?</h2>
          <div className="donations-trust-grid">
            <div className="trust-item">
              <span className="trust-number">100%</span>
              <span className="trust-label">Goes to Lebanese Red Cross</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">Official</span>
              <span className="trust-label">Canadian Red Cross Portal</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">Verified</span>
              <span className="trust-label">Humanitarian Organisation</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">Transparent</span>
              <span className="trust-label">Live Data on This Site</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="page-footer">
        <p>&copy; {new Date().getFullYear()} Just Help Lebanon. For dignity, for families, for Lebanon.</p>
      </footer>
    </div>
  );
}
