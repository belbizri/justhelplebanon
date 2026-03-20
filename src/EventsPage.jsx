import { useEffect, useState } from 'react';
import NavBar from './NavBar.jsx';

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

function EventCard({ event }) {
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
      <div className="evt-card-img-wrap">
        {!imgError ? (
          <img
            src={imgSrc}
            alt={event.title}
            className="evt-card-img"
            loading="lazy"
            onError={() => setImgError(true)}
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
            {upcoming.map((e) => <EventCard key={e.id} event={e} />)}
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
            {past.map((e) => <EventCard key={e.id} event={e} />)}
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
