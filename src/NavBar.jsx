import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/donations', label: 'Donations', icon: '❤️' },
  { to: '/from-lebanon', label: 'From Lebanon', icon: '🇱🇧' },
  { to: '/news', label: 'News', icon: '📰' },
  { to: '/videos', label: 'Videos', icon: '🎬' },
  { to: '/events', label: 'Events', icon: '🎪' },
  { to: '/social', label: 'Social', icon: '📣' },
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
      <Link to="/" className="nav-logo" onClick={close}>Just Help Lebanon</Link>

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
          <span className="nav-mobile-cedar">🌲</span>
          <span className="nav-mobile-brand">Just Help Lebanon</span>
        </div>
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
          <span>🇱🇧</span> Stand with Lebanon
        </div>
      </div>
    </nav>
  );
}
