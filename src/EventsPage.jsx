import { useEffect, useState, useCallback } from 'react';
import NavBar from './NavBar.jsx';

/* ── Image Lightbox Modal ── */
function ImageModal({ src, alt, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="evt-lightbox-backdrop" onClick={onClose}>
      <div className="evt-lightbox" onClick={(e) => e.stopPropagation()}>
        <button className="evt-lightbox-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <img src={src} alt={alt} className="evt-lightbox-img" />
        {alt && <p className="evt-lightbox-caption">{alt}</p>}
      </div>
    </div>
  );
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateFr(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function isPast(iso) {
  return new Date(iso + 'T23:59:59') < new Date();
}

function EventCard({ event, onImageClick }) {
  const past = isPast(event.date);
  const [imgSrc, setImgSrc] = useState(`/images/events/${event.id}.jpg`);
  const [imgError, setImgError] = useState(false);
  const mapUrl = event.mapQuery
    ? `https://maps.google.com/?q=${encodeURIComponent(event.mapQuery)}`
    : null;

  const handleImgError = () => {
    if (imgSrc.endsWith('.jpg')) {
      setImgSrc(`/images/events/${event.id}.png`);
    } else {
      setImgError(true);
    }
  };

  return (
    <article className={`evt-card ${past ? 'evt-card--past' : ''}`}>
      {/* Image */}
      <div className="evt-card-img-wrap" onClick={() => !imgError && onImageClick(imgSrc, event.title)}>
        {!imgError ? (
          <img
            src={imgSrc}
            alt={event.title}
            className="evt-card-img evt-card-img--clickable"
            loading="lazy"
            onError={handleImgError}
          />
        ) : (
          <div className="evt-card-img-placeholder">
            <span className="evt-placeholder-icon">📅</span>
          </div>
        )}
        {past && <div className="evt-badge evt-badge--past">Past Event</div>}
        {!past && <div className="evt-badge evt-badge--upcoming">Upcoming</div>}
      </div>

      {/* Content */}
      <div className="evt-card-body">
        <h2 className="evt-card-title">{event.title}</h2>

        <div className="evt-meta">
          <div className="evt-meta-item">
            <span className="evt-meta-icon">📅</span>
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="evt-meta-item">
            <span className="evt-meta-icon">⏰</span>
            <span>{event.startTime} – {event.endTime}</span>
          </div>
          {event.location && (
            <div className="evt-meta-item">
              <span className="evt-meta-icon">📍</span>
              {mapUrl ? (
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="evt-map-link">
                  {event.location}
                </a>
              ) : (
                <span>{event.location}</span>
              )}
            </div>
          )}
        </div>

        <p className="evt-card-desc">{event.description}</p>

        {/* French version */}
        {event.titleFr && (
          <details className="evt-fr-toggle">
            <summary className="evt-fr-summary">🇫🇷 Version française</summary>
            <div className="evt-fr-content">
              <h3 className="evt-fr-title">{event.titleFr}</h3>
              <div className="evt-meta-item evt-meta-fr">
                <span className="evt-meta-icon">📅</span>
                <span>{formatDateFr(event.date)}</span>
              </div>
              <p className="evt-card-desc">{event.descriptionFr}</p>
            </div>
          </details>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="evt-tags">
            {event.tags.map((tag) => (
              <span key={tag} className="evt-tag">#{tag}</span>
            ))}
          </div>
        )}

        {/* Google Maps button */}
        {mapUrl && (
          <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="evt-map-btn">
            📍 Open in Google Maps
          </a>
        )}
      </div>
    </article>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [lightbox, setLightbox] = useState(null);

  const openLightbox = useCallback((src, alt) => setLightbox({ src, alt }), []);
  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    fetch('/data/events.json')
      .then((r) => r.json())
      .then((data) => {
        const sorted = [...data].sort((a, b) => new Date(b.date) - new Date(a.date));
        setEvents(sorted);
      })
      .catch(() => {});
  }, []);

  const upcoming = events.filter((e) => !isPast(e.date));
  const past = events.filter((e) => isPast(e.date));

  return (
    <div className="page-root events-page">
      {lightbox && <ImageModal src={lightbox.src} alt={lightbox.alt} onClose={closeLightbox} />}
      <NavBar />

      {/* Hero Header */}
      <header className="evt-header">
        <div className="evt-header-bg" />
        <div className="evt-header-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} className="evt-particle" />
          ))}
        </div>
        <div className="evt-header-content">
          <div className="evt-header-icon">🎪</div>
          <p className="evt-header-eyebrow">Community &amp; Solidarity</p>
          <h1 className="page-title evt-title-glow">Events</h1>
          <p className="page-subtitle evt-subtitle">
            Join us. Stand with Lebanon. Make a difference.
          </p>
          <div className="evt-header-divider" />
        </div>
      </header>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="evt-section">
          <h2 className="evt-section-title">
            <span className="evt-section-dot evt-dot--live" />
            Upcoming Events
          </h2>
          <div className="evt-grid">
            {upcoming.map((e) => <EventCard key={e.id} event={e} onImageClick={openLightbox} />)}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section className="evt-section">
          <h2 className="evt-section-title">
            <span className="evt-section-dot" />
            Past Events
          </h2>
          <div className="evt-grid">
            {past.map((e) => <EventCard key={e.id} event={e} onImageClick={openLightbox} />)}
          </div>
        </section>
      )}

      {events.length === 0 && (
        <div className="evt-empty">
          <p>No events yet — stay tuned! 🇱🇧</p>
        </div>
      )}

      <footer className="evt-footer">
        <p>Want to host or suggest an event? Reach out on our <a href="/social">Social</a> page.</p>
      </footer>
    </div>
  );
}
