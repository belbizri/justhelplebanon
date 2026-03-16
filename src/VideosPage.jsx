import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const BATCH_SIZE = 4;

/* ── Extract Instagram shortcode from URL ── */
function extractShortcode(url) {
  const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

/* ── Single video embed card ── */
function VideoCard({ url }) {
  const [loaded, setLoaded] = useState(false);
  const code = extractShortcode(url);
  if (!code) return null;

  const embedUrl = `https://www.instagram.com/p/${code}/embed/`;

  return (
    <div className="iphone-frame">
      {/* Notch */}
      <div className="iphone-notch">
        <div className="iphone-speaker" />
        <div className="iphone-camera" />
      </div>
      {/* Screen */}
      <div className="iphone-screen">
        {!loaded && (
          <div className="vid-skeleton">
            <div className="vid-skeleton-shimmer" />
          </div>
        )}
        <iframe
          src={embedUrl}
          className={`vid-iframe ${loaded ? 'vid-iframe--visible' : ''}`}
          allowTransparency="true"
          allow="encrypted-media"
          loading="lazy"
          title={`Instagram video ${code}`}
          onLoad={() => setLoaded(true)}
        />
      </div>
      {/* Home indicator */}
      <div className="iphone-home-bar" />
    </div>
  );
}

export default function VideosPage() {
  const [allUrls, setAllUrls] = useState([]);
  const [visible, setVisible] = useState(BATCH_SIZE);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  /* Fetch the video list */
  useEffect(() => {
    fetch('/data/videos.json')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        const urls = Array.isArray(data) ? data.filter(u => typeof u === 'string' && u.trim()) : [];
        setAllUrls(urls);
      })
      .catch(() => setError('Could not load videos.'));
  }, []);

  /* Infinite scroll via IntersectionObserver */
  const loadMore = useCallback(() => {
    setVisible(v => Math.min(v + BATCH_SIZE, allUrls.length));
  }, [allUrls.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '400px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  const displayedUrls = allUrls.slice(0, visible);
  const hasMore = visible < allUrls.length;

  return (
    <div className="page-root videos-page">
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/donations" className="nav-link">Donations</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/videos" className="nav-link active">Videos</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>

      <header className="videos-header">
        <h1 className="page-title">Videos</h1>
        <p className="page-subtitle">
          Curated Instagram videos from the ground — scroll to load more
        </p>
      </header>

      <main className="videos-content">
        {error && <p className="vid-error">{error}</p>}

        {allUrls.length === 0 && !error && (
          <p className="vid-empty">No videos added yet. Add Instagram URLs to <code>public/data/videos.json</code>.</p>
        )}

        <div className="vid-grid">
          {displayedUrls.map((url, i) => (
            <VideoCard key={url + i} url={url} />
          ))}
        </div>

        {/* Sentinel for infinite scroll */}
        {hasMore && <div ref={sentinelRef} className="vid-sentinel" />}
        {hasMore && (
          <div className="vid-loading">
            <span className="vid-loading-dot" />
            <span className="vid-loading-dot" />
            <span className="vid-loading-dot" />
          </div>
        )}
      </main>

      <footer className="page-footer">
        &copy; {new Date().getFullYear()} Just Help Lebanon
      </footer>
    </div>
  );
}
