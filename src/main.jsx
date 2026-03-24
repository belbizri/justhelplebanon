import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import LiveUpdatesPage from './LiveUpdatesPage.jsx';
import DonationsPage from './DonationsPage.jsx';
import CatalogPage from './CatalogPage.jsx';
import NewsPage from './NewsPage.jsx';
import SocialPage from './SocialPage.jsx';
import VideosPage from './VideosPage.jsx';
import FromLebanonPage from './FromLebanonPage.jsx';
import EventsPage from './EventsPage.jsx';
import './styles.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error, info) {
    console.error('[app] unhandled render error', error, info);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Something went wrong</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1.5rem' }}>Please refresh the page to continue.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', background: '#E0313F', color: '#fff', border: 'none', borderRadius: '99px', cursor: 'pointer', fontWeight: 700 }}
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/donations" element={<DonationsPage />} />
        <Route path="/aid-kits" element={<CatalogPage />} />
        <Route path="/live" element={<LiveUpdatesPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/from-lebanon" element={<FromLebanonPage />} />
        <Route path="/social" element={<SocialPage />} />
        <Route path="/events" element={<EventsPage />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
