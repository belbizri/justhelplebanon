import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import LiveUpdatesPage from './LiveUpdatesPage.jsx';
import DonationsPage from './DonationsPage.jsx';
import NewsPage from './NewsPage.jsx';
import SocialPage from './SocialPage.jsx';
import VideosPage from './VideosPage.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/donations" element={<DonationsPage />} />
        <Route path="/live" element={<LiveUpdatesPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/videos" element={<VideosPage />} />
        <Route path="/social" element={<SocialPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
