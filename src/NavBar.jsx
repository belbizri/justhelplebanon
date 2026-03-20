import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/donations', label: 'Donations' },
  { to: '/from-lebanon', label: 'From Lebanon' },
  { to: '/news', label: 'News' },
  { to: '/videos', label: 'Videos' },
  { to: '/events', label: 'Events' },
  { to: '/social', label: 'Social' },
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
        {NAV_ITEMS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`nav-link ${location.pathname === to ? 'active' : ''}`}
            onClick={close}
          >
            {label}
          </Link>
        ))}
        {extra}
      </div>
    </nav>
  );
}
