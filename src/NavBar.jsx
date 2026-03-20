import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* ── Minimal SVG icons (20×20, stroke-based, elegant) ── */
const I = ({ d, ...p }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    {typeof d === 'string' ? <path d={d}/> : d}
  </svg>
);

const Icons = {
  home: <I d={<><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></>}/>,
  heart: <I d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>,
  flag: <I d={<><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>}/>,
  news: <I d={<><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="14" y2="12"/><line x1="7" y1="16" x2="11" y2="16"/></>}/>,
  play: <I d={<><rect x="2" y="2" width="20" height="20" rx="2.18"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></>}/>,
  calendar: <I d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none"/></>}/>,
  megaphone: <I d={<><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></>}/>,
};

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Icons.home },
  { to: '/donations', label: 'Donations', icon: Icons.heart },
  { to: '/from-lebanon', label: 'From Lebanon', icon: Icons.flag },
  { to: '/news', label: 'News', icon: Icons.news },
  { to: '/videos', label: 'Videos', icon: Icons.play },
  { to: '/events', label: 'Events', icon: Icons.calendar },
  { to: '/social', label: 'Social', icon: Icons.megaphone },
];

export default function NavBar({ extra }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  // Close menu on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <nav className="page-nav">
      <Link to="/" className={`nav-logo ${open ? 'menu-open' : ''}`} onClick={close}>
        <span className="nav-logo-flag-wrap" aria-hidden="true">
          <img
            src="/images/svg/Cedar_only.svg"
            alt=""
            className="nav-logo-flag"
            loading="eager"
            decoding="async"
          />
        </span>
        <span className="nav-logo-text">Just Help Lebanon</span>
      </Link>

      {/* Hamburger button — visible only on mobile via CSS */}
      <button
        className={`nav-hamburger ${open ? 'open' : ''}`}
        onClick={toggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        type="button"
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* Overlay backdrop */}
      {open && <div className="nav-overlay" onClick={close} />}

      {/* Links */}
      <div className={`nav-links ${open ? 'nav-links--open' : ''}`}>
        <div className="nav-mobile-header">
          <div className="nav-mobile-logo-mark">
            <img
              src="/images/svg/Cedar_only.svg"
              alt=""
              className="nav-mobile-logo-flag"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="nav-mobile-brand-group">
            <span className="nav-mobile-brand">Just Help Lebanon</span>
            <span className="nav-mobile-tagline">Together we rebuild</span>
          </div>
        </div>

        <div className="nav-mobile-divider" />

        {NAV_ITEMS.map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            onClick={close}
          >
            <span className="nav-link-icon">{icon}</span>
            {label}
          </Link>
        ))}
        {extra}

        <div className="nav-mobile-footer">
          <div className="nav-mobile-footer-line" />
          <span className="nav-mobile-footer-text">Stand with Lebanon</span>
        </div>
      </div>
    </nav>
  );
}
