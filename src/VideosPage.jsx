import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const BATCH_SIZE = 4;

/* ── Single video card with native <video> ── */
function VideoCard({ src, title }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  return (
    <div className="iphone-frame">
      <div className="iphone-notch">
        <div className="iphone-speaker" />
        <div className="iphone-camera" />
      </div>
      <div className="iphone-screen" onClick={toggle}>
        <video
          ref={videoRef}
          className="vid-native"
          src={src}
          playsInline
          loop
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        {!playing && (
          <div className="vid-play-overlay">
            <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>
      <div className="iphone-home-bar" />
      {title && <p className="vid-title">{title}</p>}
    </div>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [visible, setVisible] = useState(BATCH_SIZE);
  const [error, setError] = useState(null);
  const sentinelRef = useRef(null);

  /* Fetch the video manifest */
  useEffect(() => {
    fetch('/data/videos.json')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(data => {
        const list = Array.isArray(data)
          ? data.map(v => typeof v === 'string' ? { src: v } : v).filter(v => v.src)
          : [];
        setVideos(list);
      })
      .catch(() => setError('Could not load videos.'));
  }, []);

  /* Infinite scroll */
  const loadMore = useCallback(() => {
    setVisible(v => Math.min(v + BATCH_SIZE, videos.length));
  }, [videos.length]);

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

  const displayed = videos.slice(0, visible);
  const hasMore = visible < videos.length;

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
          Curated videos from the ground — scroll to load more
        </p>
      </header>

      <main className="videos-content">
        {error && <p className="vid-error">{error}</p>}

        {videos.length === 0 && !error && (
          <p className="vid-empty">No videos added yet. Drop <code>.mp4</code> files into <code>public/videos/</code> and list them in <code>public/data/videos.json</code>.</p>
        )}

        <div className="vid-grid">
          {displayed.map((v, i) => (
            <VideoCard key={v.src + i} src={v.src} title={v.title} />
          ))}
        </div>

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
