import { useState, useEffect, useRef, useCallback } from 'react';
import NavBar from './NavBar.jsx';

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
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const sentinelRef = useRef(null);
  const fileInputRef = useRef(null);

  /* Fetch the video manifest */
  useEffect(() => {
    fetch('/data/videos.json', { cache: 'no-store' })
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

  const handleUpload = useCallback(async (event) => {
    event.preventDefault();

    if (!uploadFile) {
      setUploadError('Choose a video file before uploading.');
      setUploadSuccess(null);
      return;
    }

    const formData = new FormData();
    formData.append('video', uploadFile);
    formData.append('title', uploadTitle.trim());

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || 'Upload failed.');
      }

      setVideos(current => [...current, payload.video]);
      setUploadSuccess('Video uploaded successfully.');
      setUploadTitle('');
      setUploadFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadFile, uploadTitle]);

  return (
    <div className="page-root videos-page">
      {modal && <VideoModal src={modal.src} title={modal.title} onClose={closeModal} />}
      <NavBar />

      <header className="videos-header">
        <div className="vid-header-bg" />
        <div className="vid-header-scanlines" />
        <div className="vid-header-particles">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="vid-particle" />
          ))}
        </div>
        <div className="vid-header-content">
          <div className="vid-header-filmstrip">
            <span /><span /><span /><span /><span /><span /><span /><span />
          </div>
          <p className="vid-header-eyebrow" aria-label="Welcome Habibi">
            <span className="vid-welcome-word">Welcome</span>
            <span className="vid-welcome-sep"> </span>
            <span className="vid-welcome-accent">Habibi</span>
          </p>
          <h1 className="page-title vid-title-glow">Videos</h1>
          <p className="page-subtitle vid-subtitle-neon">
            SCROLL DOWN TO WATCH
          </p>
          <div className="vid-header-glow-line" />
        </div>
      </header>

      <main className="videos-content">
        {error && <p className="vid-error">{error}</p>}

        <section className="vid-upload-panel" aria-labelledby="video-upload-title">
          <div className="vid-upload-copy">
            <p className="vid-upload-kicker">Admin upload</p>
            <h2 id="video-upload-title">Add a video without editing JSON</h2>
            <p>
              Upload an MP4, MOV, WEBM, or M4V file and it will be added to the live videos manifest automatically.
            </p>
          </div>

          <form className="vid-upload-form" onSubmit={handleUpload}>
            <label className="vid-upload-field">
              <span>Video title</span>
              <input
                type="text"
                value={uploadTitle}
                onChange={event => setUploadTitle(event.target.value)}
                placeholder="Optional title"
                maxLength={120}
              />
            </label>

            <label className="vid-upload-field">
              <span>Video file</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm,video/x-m4v,.mp4,.mov,.webm,.m4v"
                onChange={event => setUploadFile(event.target.files?.[0] || null)}
              />
            </label>

            <div className="vid-upload-actions">
              <button type="submit" className="vid-upload-button" disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload video'}
              </button>
              <p className="vid-upload-hint">
                {uploadFile ? `${uploadFile.name} selected` : 'Maximum size: 250 MB'}
              </p>
            </div>

            {uploadError && <p className="vid-upload-message vid-upload-message--error">{uploadError}</p>}
            {uploadSuccess && <p className="vid-upload-message vid-upload-message--success">{uploadSuccess}</p>}
          </form>
        </section>

        {videos.length === 0 && !error && (
          <p className="vid-empty">No videos added yet. Use the upload form above to add the first video.</p>
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
