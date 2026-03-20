import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

const BATCH_SIZE = 4;

/* ── Single video card (thumbnail in iPhone frame) ── */
function VideoCard({ src, title, onOpen }) {
  const videoRef = useRef(null);

  return (
    <div className="iphone-frame">
      <div className="iphone-notch">
        <div className="iphone-speaker" />
        <div className="iphone-camera" />
      </div>
      <div className="iphone-screen" onClick={() => onOpen(src, title)}>
        <video
          ref={videoRef}
          className="vid-native"
          src={src}
          playsInline
          loop
          muted
          preload="metadata"
        />
        <div className="vid-play-overlay">
          <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="iphone-home-bar" />
      {title && <p className="vid-title">{title}</p>}
    </div>
  );
}

/* ── Fullscreen modal overlay ── */
function VideoModal({ src, title, onClose }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  /* Auto-play on open */
  useEffect(() => {
    const v = videoRef.current;
    if (v) v.play().catch(() => {});
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  return (
    <div className="vid-modal-backdrop" onClick={onClose}>
      <div className="vid-modal" onClick={e => e.stopPropagation()}>
        <button className="vid-modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <div className="vid-modal-video-wrap" onClick={toggle}>
          <video
            ref={videoRef}
            className="vid-modal-video"
            src={src}
            playsInline
            loop
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />
          {!playing && (
            <div className="vid-play-overlay vid-play-overlay--modal">
              <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
        {title && <p className="vid-modal-title">{title}</p>}
      </div>
    </div>
  );
}

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [visible, setVisible] = useState(BATCH_SIZE);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);          // { src, title }
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

  const reversed = [...videos].reverse();
  const displayed = reversed.slice(0, visible);
  const hasMore = visible < reversed.length;

  const openModal = useCallback((src, title) => {
    setModal({ src, title });
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setModal(null);
    document.body.style.overflow = '';
  }, []);

  return (
    <div className="page-root videos-page">
      {modal && <VideoModal src={modal.src} title={modal.title} onClose={closeModal} />}
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/donations" className="nav-link">Donations</Link>
          <Link to="/from-lebanon" className="nav-link">From Lebanon</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/videos" className="nav-link active">Videos</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>

      <header className="videos-header">
        <h1 className="page-title">Videos</h1>
        <p className="page-subtitle">
         SCROLL DOWN TO WATCH
        </p>
      </header>

      <main className="videos-content">
        {error && <p className="vid-error">{error}</p>}

        {videos.length === 0 && !error && (
          <p className="vid-empty">No videos added yet. Drop <code>.mp4</code> files into <code>public/videos/</code> and list them in <code>public/data/videos.json</code>.</p>
        )}

        <div className="vid-grid">
          {displayed.map((v, i) => (
            <VideoCard key={v.src + i} src={v.src} title={v.title} onOpen={openModal} />
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
