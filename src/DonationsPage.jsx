import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { trackEvent } from './analytics.js';
import NavBar from './NavBar.jsx';
import usePageSeo from './usePageSeo.js';

/* ═══════════════════════════════════════
   SVG Icons — one per category
   ═══════════════════════════════════════ */
const CATEGORY_ICONS = {
  'Food & Medical Aid': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  ),
  'Shelter & Reconstruction': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  'Education, Environment & Support': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  ),
  'Other Fundraisers': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  'More Places to Donate': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
};

/* Category accent colours */
const CATEGORY_ACCENT = {
  'Food & Medical Aid': '#d14b5a',
  'Shelter & Reconstruction': '#c78b3c',
  'Education, Environment & Support': '#4a8f6d',
  'Other Fundraisers': '#6a7fc1',
  'More Places to Donate': '#8a7ab8',
};

/* ═══════════════════════════════════════
   Organization Data
   ═══════════════════════════════════════ */
const ORGANIZATIONS = [
  // ── Food & Medical Aid ──
  { name: 'Lebanese Red Cross', slug: 'lebanese-red-cross', category: 'Food & Medical Aid', featured: true, online: true, whatsapp: false,
    desc: 'The primary emergency-response organisation in Lebanon — providing ambulance services, disaster relief, and blood transfusion across the country.',
    url: 'https://www.redcross.org.lb/', logo: 'https://www.ifrc.org/sites/default/files/media/logo/2021-08/lebanon_red_cross_logo.png' },
  { name: 'Blue Mission Organization', slug: 'blue-mission-organization', category: 'Food & Medical Aid', featured: true, online: true, whatsapp: false,
    desc: 'Humanitarian organisation delivering relief, medical aid, and community support across Lebanon.',
    url: 'https://linktr.ee/bluemission', logo: 'https://ugc.production.linktr.ee/pljsNRNnTmmvEnicbNNA_Gh5FLrijZ4DHXYz8?io=true&size=avatar-v3_0' },
  { name: 'Human of Tomorrow', slug: 'human-of-tomorrow', category: 'Food & Medical Aid', featured: true, online: true, whatsapp: true,
    desc: 'A Lebanese NGO empowering underserved communities through development and skill-building initiatives. 🇱🇧🤝🌱',
    url: 'https://www.instagram.com/humanoftomorrow/', logo: 'https://i.imgur.com/NnLmICn.png' },
  { name: 'Mobile Clinique', slug: 'mobile-clinique', category: 'Food & Medical Aid', featured: true, online: true, whatsapp: false,
    desc: 'Providing mobile healthcare services to underserved communities across Lebanon.',
    url: 'http://bluemission.org/index.php/donation-page/', logo: '/images/mobile_clinique.png' },
  { name: 'Beit Al Baraka', slug: 'beit-al-baraka', category: 'Food & Medical Aid', featured: true, online: false, whatsapp: false,
    desc: 'Social supermarket providing dignified access to free groceries for families in need across Beirut and beyond.',
    url: 'https://www.beitelbaraka.org/', logo: 'https://www.google.com/s2/favicons?domain=beitalbaraka.org&sz=128' },
  { name: 'El-Bizri Foundation', slug: 'el-bizri-foundation', category: 'Food & Medical Aid', featured: true, whatsapp: false,
    desc: 'Supporting communities in Lebanon through humanitarian and development projects.',
    url: 'https://nazihbizrifoundation.org/project-1-2-3-2-2-2-2-2-8/', logo: 'https://nazihbizrifoundation.org/wp-content/uploads/2023/10/Facebook-cover-1-1-1.png' },
  { name: 'Dr. Nazih Bizri Health Center', slug: 'dr-nazih-bizri-health-center', category: 'Food & Medical Aid', featured: true, whatsapp: false,
    desc: 'Providing essential healthcare services and medical support to communities in need across Lebanon.',
    url: 'https://almoasat.org/departments/details/17', logo: 'https://www.almoasat.org/front/images/logo.png' },
  { name: 'Morjan Group', slug: 'morjan-group', category: 'Food & Medical Aid', featured: true, whatsapp: false,
    desc: 'Community-driven organisation supporting humanitarian relief efforts across Lebanon.',
    url: '', logo: '/images/morjan_group.png' },
  { name: 'Empower Lebanon', slug: 'empower-lebanon', category: 'Food & Medical Aid', featured: false, whatsapp: false,
    desc: 'Grassroots initiative delivering food parcels and hygiene kits to vulnerable families in underserved communities.',
    url: 'https://www.empowerlebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=empowerlebanon.org&sz=128' },
  { name: 'Lebanese Food Bank', slug: 'lebanese-food-bank', category: 'Food & Medical Aid', featured: false, whatsapp: false,
    desc: 'Fights hunger and food waste by collecting surplus food from restaurants and distributing it to those in need.',
    url: 'https://www.lebanesefoodbank.org/', logo: 'https://www.google.com/s2/favicons?domain=lebanesefoodbank.org&sz=128' },
  { name: 'Al-Kafaat Emergency Fund', slug: 'al-kafaat-emergency-fund', category: 'Food & Medical Aid', featured: false, whatsapp: false,
    desc: 'Provides emergency medical care, rehabilitation, and assistive devices for people with disabilities affected by the crisis.',
    url: 'https://www.al-kafaat.org/', logo: 'https://www.google.com/s2/favicons?domain=al-kafaat.org&sz=128' },
  { name: 'Help Critically Ill Patients', slug: 'help-critically-ill-patients', category: 'Food & Medical Aid', featured: false, whatsapp: false,
    desc: 'Funds life-saving treatments for critically ill patients who cannot afford hospital bills in Lebanon.',
    url: 'https://www.yallagivelebanon.com/', logo: 'https://www.google.com/s2/favicons?domain=yallagivelebanon.com&sz=128' },

  // ── Shelter & Reconstruction ──
  { name: 'Baytna Baytak', slug: 'baytna-baytak', category: 'Shelter & Reconstruction', featured: true, whatsapp: false,
    desc: 'Opens its doors as a community shelter providing free housing, meals, and psychological support to displaced families.',
    url: 'https://www.baytnabaytak.org/', logo: 'https://www.google.com/s2/favicons?domain=baytnabaytak.org&sz=128' },
  { name: 'Rebuild Beirut', slug: 'rebuild-beirut', category: 'Shelter & Reconstruction', featured: false, whatsapp: false,
    desc: 'Grassroots movement restoring homes damaged by the Beirut explosion—window by window, wall by wall.',
    url: 'https://www.rebuildbeirut.com/', logo: 'https://www.google.com/s2/favicons?domain=rebuildbeirut.com&sz=128' },
  { name: 'Beib w Shebbek', slug: 'beib-w-shebbek', category: 'Shelter & Reconstruction', featured: false, whatsapp: false,
    desc: 'Replaces doors and windows for homes destroyed in the Beirut blast, restoring safety and dignity for families.',
    url: 'https://www.instagram.com/beibwshebbek/', logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128' },
  { name: 'Windows for Beirut', slug: 'windows-for-beirut', category: 'Shelter & Reconstruction', featured: false, whatsapp: false,
    desc: 'Crowd-funded initiative repairing broken windows in hundreds of blast-damaged apartments across Beirut.',
    url: 'https://www.windowsforbeirut.com/', logo: 'https://www.google.com/s2/favicons?domain=windowsforbeirut.com&sz=128' },

  // ── Education, Environment & Support ──
  { name: 'Teach for Lebanon', slug: 'teach-for-lebanon', category: 'Education, Environment & Support', featured: true, whatsapp: false,
    desc: 'Places qualified teachers in under-resourced schools to ensure every child in Lebanon has access to quality education.',
    url: 'https://www.teachforlebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=teachforlebanon.org&sz=128' },
  { name: 'KAFA', slug: 'kafa', category: 'Education, Environment & Support', featured: false, whatsapp: false,
    desc: 'Advocates for an end to gender-based violence and supports survivors with legal aid, counselling, and shelter.',
    url: 'https://www.kafa.org.lb/', logo: 'https://www.google.com/s2/favicons?domain=kafa.org.lb&sz=128' },
  { name: 'Solar Panel Campaign', slug: 'solar-panel-campaign', category: 'Education, Environment & Support', featured: false, whatsapp: false,
    desc: 'Installs solar panels in hospitals, schools, and homes to combat crippling power outages across Lebanon.',
    url: 'https://www.instagram.com/solarpanelcampaign/', logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128' },
  { name: 'Kafala Victims', slug: 'kafala-victims', category: 'Education, Environment & Support', featured: false, whatsapp: false,
    desc: 'Supports migrant domestic workers trapped in the kafala system with legal assistance, shelter, and repatriation.',
    url: 'https://www.antislavery.org/', logo: 'https://www.google.com/s2/favicons?domain=antislavery.org&sz=128' },
  { name: 'Animals Lebanon', slug: 'animals-lebanon', category: 'Education, Environment & Support', featured: false, whatsapp: false,
    desc: 'Rescues and rehabilitates animals in crisis, advocates for animal welfare legislation, and runs the only shelter of its kind.',
    url: 'https://www.animalslebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=animalslebanon.org&sz=128' },
  { name: 'Recycle Lebanon', slug: 'recycle-lebanon', category: 'Education, Environment & Support', featured: false, whatsapp: false,
    desc: 'Promotes sustainable waste management through community recycling programs and environmental education initiatives.',
    url: 'https://www.recyclelebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=recyclelebanon.org&sz=128' },

  // ── Other Fundraisers ──
  { name: 'LIFE Lebanon', slug: 'life-lebanon', category: 'Other Fundraisers', featured: false, whatsapp: false,
    desc: 'International humanitarian campaign supporting multisector relief projects in Lebanon — from food to mental health.',
    url: 'https://www.lifelebanon.com/', logo: 'https://www.google.com/s2/favicons?domain=lifelebanon.com&sz=128' },
  { name: 'Impact Lebanon', slug: 'impact-lebanon', category: 'Other Fundraisers', featured: true, whatsapp: false,
    desc: 'Diaspora-led platform funding high-impact community projects voted on by the Lebanese public.',
    url: 'https://www.impactlebanon.com/', logo: 'https://www.google.com/s2/favicons?domain=impactlebanon.com&sz=128' },

  // ── More Places to Donate ──
  { name: 'Oxfam', slug: 'oxfam', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Global humanitarian organisation providing clean water, food assistance, and livelihoods support in Lebanon.',
    url: 'https://www.oxfam.org/en/what-we-do/countries/lebanon', logo: 'https://www.google.com/s2/favicons?domain=oxfam.org&sz=128' },
  { name: 'Ajialouna', slug: 'ajialouna', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Provides free education, healthcare, and community development for disadvantaged children and youth in Lebanon.',
    url: 'https://www.ajialouna.org/', logo: 'https://www.google.com/s2/favicons?domain=ajialouna.org&sz=128' },
  { name: 'Bassma', slug: 'bassma', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Empowers marginalised families with education sponsorships, healthcare, and micro-enterprise funding.',
    url: 'https://www.bassma.org/', logo: 'https://www.google.com/s2/favicons?domain=bassma.org&sz=128' },
  { name: 'Caritas Lebanon', slug: 'caritas-lebanon', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Catholic relief agency delivering food, shelter, healthcare, and psychosocial support to communities in crisis.',
    url: 'https://www.caritas.org.lb/', logo: 'https://www.google.com/s2/favicons?domain=caritas.org.lb&sz=128' },
  { name: 'Food Blessed', slug: 'food-blessed', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Rescues surplus food from hotels and restaurants and redistributes it to families and shelters in need.',
    url: 'https://www.foodblessed.com/', logo: 'https://www.google.com/s2/favicons?domain=foodblessed.com&sz=128' },
  { name: 'Lebanon Needs', slug: 'lebanon-needs', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Matches donors with verified urgent needs — from medication to school fees — through a transparent request platform.',
    url: 'https://www.lebanonneeds.com/', logo: 'https://www.google.com/s2/favicons?domain=lebanonneeds.com&sz=128' },
  { name: 'Saint George Hospital', slug: 'saint-george-hospital', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Historic Beirut hospital severely damaged in the blast — donations fund reconstruction and patient care.',
    url: 'https://www.stgeorgehospital.org/', logo: 'https://www.google.com/s2/favicons?domain=stgeorgehospital.org&sz=128' },
  { name: 'Arcenciel', slug: 'arcenciel', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Social enterprise providing health, environment, and inclusion services — from waste management to disability care.',
    url: 'https://www.arcenciel.org/', logo: 'https://www.google.com/s2/favicons?domain=arcenciel.org&sz=128' },
  { name: "Children's Cancer Center", slug: 'childrens-cancer-center', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'The only specialised paediatric cancer treatment facility in Lebanon — treating children regardless of ability to pay.',
    url: 'https://www.cccl.org.lb/', logo: 'https://www.google.com/s2/favicons?domain=cccl.org.lb&sz=128' },
  { name: 'Nusaned', slug: 'nusaned', category: 'More Places to Donate', featured: false, whatsapp: false,
    desc: 'Digital platform connecting Lebanese citizens to offer and receive help — from housing to job opportunities.',
    url: 'https://nusaned.org/', logo: 'https://www.google.com/s2/favicons?domain=nusaned.org&sz=128' },
];

const CATEGORIES = [
  'Food & Medical Aid',
  'Shelter & Reconstruction',
  'Education, Environment & Support',
  'Other Fundraisers',
  'More Places to Donate',
];

const sortByOnlineFirst = (list) => (
  [...list].sort((a, b) => {
    const onlineDiff = Number(Boolean(b.online)) - Number(Boolean(a.online));
    if (onlineDiff !== 0) return onlineDiff;
    return a.name.localeCompare(b.name);
  })
);

const getOrgWhatsappUrl = (org) => {
  if (org.whatsapp) return org.whatsapp;
  const text = `I want to support ${org.name}${org.url ? ` ${org.url}` : ''}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
};

const FEATURED_VIDEO_CONCEPT = [
  {
    id: 'mobile-clinic',
    title: 'Mobile Clinic Day',
    subtitle: 'Healthcare support in underserved areas',
    org: 'Mobile Clinique',
    src: '/videos/featured/mobile-clinic.mp4',
  },
  {
    id: 'food-relief',
    title: 'Emergency Food Relief',
    subtitle: 'Packing and delivery for families in need',
    org: 'Human of Tomorrow',
    src: '/videos/featured/food-relief.mp4',
  },
  {
    id: 'community-rebuild',
    title: 'Community Rebuild',
    subtitle: 'Restoring homes and local spaces',
    org: 'Ahlona Foundation',
    src: '/videos/featured/community-rebuild.mp4',
  },
];

/* ═══════════════════════════════════════
   Reusable Components
   ═══════════════════════════════════════ */

/* Arrow icons */
const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const WhatsappIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
    <path d="M20.52 3.48A11.83 11.83 0 0012.07 0C5.56 0 .27 5.3.27 11.8c0 2.08.54 4.11 1.56 5.9L0 24l6.5-1.71a11.78 11.78 0 005.56 1.42h.01c6.5 0 11.8-5.29 11.8-11.8 0-3.15-1.23-6.1-3.35-8.42zM12.07 21.7h-.01a9.8 9.8 0 01-4.98-1.37l-.36-.21-3.86 1.02 1.03-3.76-.24-.38a9.8 9.8 0 01-1.5-5.19c0-5.4 4.4-9.8 9.81-9.8 2.62 0 5.08 1.02 6.93 2.86a9.73 9.73 0 012.87 6.94c0 5.4-4.4 9.8-9.8 9.8zm5.37-7.36c-.3-.15-1.76-.87-2.03-.98-.27-.1-.47-.15-.67.16-.2.3-.77.98-.95 1.18-.17.2-.35.23-.64.08-.3-.15-1.24-.46-2.37-1.46-.88-.78-1.47-1.73-1.64-2.02-.17-.3-.02-.45.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.08-.15-.67-1.62-.92-2.23-.24-.57-.48-.5-.67-.51h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1.02-1.04 2.5 0 1.47 1.07 2.9 1.22 3.1.15.2 2.1 3.2 5.07 4.48.7.3 1.25.49 1.67.62.7.22 1.34.19 1.84.11.56-.08 1.76-.72 2.01-1.43.25-.7.25-1.31.17-1.43-.07-.12-.27-.2-.57-.35z"/>
  </svg>
);

/* ── Media Lightbox (video / image expand) ── */
function MediaLightbox({ media, onClose }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (media.type === 'video' && videoRef.current) videoRef.current.play().catch(() => {});
  }, [media]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play(); else v.pause();
  };

  return (
    <div className="orgp-lightbox-backdrop" onClick={onClose}>
      <div className="orgp-lightbox" onClick={e => e.stopPropagation()}>
        <button className="orgp-lightbox-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="22" height="22">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        {media.type === 'video' ? (
          <div className="orgp-lightbox-video-wrap" onClick={toggle}>
            <video
              ref={videoRef}
              className="orgp-lightbox-video"
              src={media.src}
              playsInline
              loop
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
            />
            {!playing && (
              <div className="orgp-lightbox-play">
                <svg viewBox="0 0 24 24" fill="currentColor" width="64" height="64"><path d="M8 5v14l11-7z" /></svg>
              </div>
            )}
          </div>
        ) : (
          <img className="orgp-lightbox-img" src={media.src} alt="" />
        )}
      </div>
    </div>
  );
}

/* ── Org Profile Modal ── */
function OrgProfileModal({ org, onClose }) {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('updates');
  const [expandedMedia, setExpandedMedia] = useState(null);
  const accent = CATEGORY_ACCENT[org.category] || '#888';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    fetch('/data/org-profiles.json', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => setProfile(data[org.slug] || { videos: [], images: [], updates: [] }))
      .catch(() => setProfile({ videos: [], images: [], updates: [] }));
    return () => { document.body.style.overflow = ''; };
  }, [org.slug]);

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const hasContent = profile && (profile.videos.length > 0 || profile.images.length > 0 || profile.updates.length > 0);

  return (
    <div className="orgp-backdrop" onClick={onClose}>
      <div className="orgp-modal" onClick={e => e.stopPropagation()} style={{ '--orgp-accent': accent }}>
        <button className="orgp-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="orgp-header">
          <div className="orgp-logo">
            <img src={org.logo} alt={org.name} onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div className="orgp-info">
            <span className="orgp-cat" style={{ color: accent }}>{org.category}</span>
            <h2 className="orgp-name">{org.name}</h2>
            <p className="orgp-desc">{org.desc}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="orgp-tabs">
          <button className={`orgp-tab ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => setActiveTab('updates')}>
            Updates
          </button>
          <button className={`orgp-tab ${activeTab === 'media' ? 'active' : ''}`} onClick={() => setActiveTab('media')}>
            Photos &amp; Videos
          </button>
        </div>

        <div className="orgp-body">
          {!profile && <p className="orgp-loading">Loading...</p>}

          {profile && activeTab === 'updates' && (
            <div className="orgp-updates">
              {profile.updates.length === 0 ? (
                <p className="orgp-empty">No updates yet — check back soon.</p>
              ) : (
                profile.updates.map((u, i) => (
                  <div key={i} className="orgp-update">
                    <span className="orgp-update-date">{u.date}</span>
                    <p className="orgp-update-text">{u.text}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {profile && activeTab === 'media' && (
            <div className="orgp-media">
              {profile.videos.length === 0 && profile.images.length === 0 ? (
                <p className="orgp-empty">No media yet — check back soon.</p>
              ) : (
                <>
                  {profile.videos.length > 0 && (
                    <div className="orgp-media-section">
                      <h4 className="orgp-media-label">Videos</h4>
                      <div className="orgp-media-grid">
                        {profile.videos.map((src, i) => (
                          <div key={i} className="orgp-thumb" onClick={() => setExpandedMedia({ type: 'video', src })}>
                            <video className="orgp-video" src={src} playsInline muted preload="metadata" />
                            <div className="orgp-thumb-play">
                              <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40"><path d="M8 5v14l11-7z" /></svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile.images.length > 0 && (
                    <div className="orgp-media-section">
                      <h4 className="orgp-media-label">Photos</h4>
                      <div className="orgp-media-grid">
                        {profile.images.map((src, i) => (
                          <div key={i} className="orgp-thumb" onClick={() => setExpandedMedia({ type: 'image', src })}>
                            <img src={src} alt="" className="orgp-image" loading="lazy" />
                            <div className="orgp-thumb-zoom">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="22" height="22">
                                <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {expandedMedia && <MediaLightbox media={expandedMedia} onClose={() => setExpandedMedia(null)} />}

        <div className="orgp-footer">
          {org.url ? (
            <a
              href={org.url}
              target="_blank"
              rel="noopener noreferrer"
              className="orgp-donate-btn"
              onClick={() => {
                trackEvent('organization_click', {
                  location: 'organization_modal',
                  organization_name: org.name,
                  category: org.category,
                  destination_url: org.url,
                  page: 'donations',
                });
              }}
            >
              Donate to {org.name} <ExternalIcon />
            </a>
          ) : (
            <span className="orgp-donate-btn orgp-donate-btn--disabled">Coming Soon</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* Organisation Card */
function OrgCard({ org, onSelect }) {
  const accent = CATEGORY_ACCENT[org.category] || '#888';
  const initials = org.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const whatsappUrl = getOrgWhatsappUrl(org);

  return (
    <article className="org-card" style={{ '--card-accent': accent }}>
      <div className="org-card-logo" onClick={() => onSelect(org)}>
        <img src={org.logo} alt={`${org.name} logo`} loading="lazy" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <span className="org-card-initials" style={{ display: 'none' }}>{initials}</span>
        <div className="org-card-logo-meta">
          <span className={`org-online-pill ${org.online ? 'is-online' : 'is-offline'}`}>
            <span className="org-online-dot" />
            {org.online ? 'Online' : 'Offline'}
          </span>
          {org.whatsapp && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="org-whatsapp-icon"
              aria-label={`Contact ${org.name} on WhatsApp`}
              onClick={(e) => {
                e.stopPropagation();
                trackEvent('organization_whatsapp_click', {
                  location: 'organization_card',
                  organization_name: org.name,
                  category: org.category,
                  page: 'donations',
                });
              }}
            >
              <WhatsappIcon />
            </a>
          )}
        </div>
      </div>
      <div className="org-card-body" onClick={() => onSelect(org)}>
        <span className="org-card-cat" style={{ color: accent }}>{org.category}</span>
        <h3 className="org-card-name">{org.name}</h3>
        <p className="org-card-desc">{org.desc}</p>
      </div>
      <div className="org-card-actions">
        <button className="org-card-profile-btn" onClick={() => onSelect(org)} aria-label={`View ${org.name} profile`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Profile
        </button>
        {org.url ? (
          <a
            href={org.url}
            target="_blank"
            rel="noopener noreferrer"
            className="org-card-cta"
            aria-label={`Donate to ${org.name}`}
            onClick={() => {
              trackEvent('organization_click', {
                location: 'organization_card',
                organization_name: org.name,
                category: org.category,
                destination_url: org.url,
                page: 'donations',
              });
            }}
          >
            View / Donate <ExternalIcon />
          </a>
        ) : (
          <span className="org-card-cta" style={{ opacity: 0.4, cursor: 'default' }}>Coming Soon</span>
        )}
      </div>
    </article>
  );
}

/* Horizontal carousel wrapper with scroll arrows (mobile) */
function CategoryCarousel({ children }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => { checkScroll(); }, [children]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <div className="carousel-wrap">
      {canLeft && (
        <button className="carousel-arrow carousel-arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left"><ArrowLeft /></button>
      )}
      <div className="carousel-track" ref={scrollRef} onScroll={checkScroll}>
        {children}
      </div>
      {canRight && (
        <button className="carousel-arrow carousel-arrow-right" onClick={() => scroll(1)} aria-label="Scroll right"><ArrowRight /></button>
      )}
    </div>
  );
}

function VideoShowcase({ videos, onOpen }) {
  return (
    <div className="don-video-concept" aria-label="Featured impact videos">
      <div className="don-video-track">
        {videos.map((video) => (
          <article key={video.id} className="don-video-card">
            <div
              className="don-video-media"
              onClick={() => onOpen({ type: 'video', src: video.src })}
              role="button"
              tabIndex={0}
              aria-label={`Play ${video.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onOpen({ type: 'video', src: video.src });
                }
              }}
            >
              <div className="don-video-screen">
                <video
                  className="don-video-el"
                  src={video.src}
                  muted
                  loop
                  autoPlay
                  playsInline
                  preload="metadata"
                />
                <div className="don-video-shade" />
                <div className="don-video-play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="30" height="30">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="don-video-body">
              <h3 className="don-video-title">{video.title}</h3>
              <p className="don-video-sub">{video.subtitle}</p>
              <p className="don-video-org">{video.org}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Main Page
   ═══════════════════════════════════════ */
export default function DonationsPage() {
  usePageSeo({
    title: 'Verified Organizations Supporting Lebanon | Just Help Lebanon',
    description:
      'Browse verified organizations and fundraisers supporting Lebanon across food aid, healthcare, shelter, education, and recovery.',
    path: '/donations',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Verified Organizations Supporting Lebanon',
      url: 'https://justhelplebanon.com/donations',
      description:
        'Discover verified organizations and fundraisers supporting humanitarian relief, healthcare, and recovery in Lebanon.',
    },
  });

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedFeaturedVideo, setSelectedFeaturedVideo] = useState(null);

  /* Featured orgs */
  const featured = useMemo(() => sortByOnlineFirst(ORGANIZATIONS.filter(o => o.featured)), []);

  /* Filtered results */
  const filtered = useMemo(() => {
    let list = ORGANIZATIONS;
    if (activeCategory !== 'All') list = list.filter(o => o.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => o.name.toLowerCase().includes(q) || o.desc.toLowerCase().includes(q));
    }
    return sortByOnlineFirst(list);
  }, [search, activeCategory]);

  /* Group by category */
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(o => {
      if (!map[o.category]) map[o.category] = [];
      map[o.category].push(o);
    });
    return map;
  }, [filtered]);

  const isSearchActive = search.trim().length > 0;
  const showFeatured = !isSearchActive && activeCategory === 'All';

  return (
    <div className="page-root donations-page">
      {/* Org Profile Modal */}
      {selectedOrg && <OrgProfileModal org={selectedOrg} onClose={() => setSelectedOrg(null)} />}
      {selectedFeaturedVideo && (
        <MediaLightbox
          media={selectedFeaturedVideo}
          onClose={() => setSelectedFeaturedVideo(null)}
        />
      )}

      {/* Nav */}
      <NavBar />

      {/* Hero Header — Cinematic with waving flag */}
      <header className="page-header donations-header">
        <div className="don-header-bg" />
        <div className="don-header-particles">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} className="don-particle" />
          ))}
        </div>
        <div className="don-header-flag" />
        <div className="donations-header-overlay">
          <p className="don-header-eyebrow">Trusted &bull; Verified &bull; Lebanon</p>
          <h1 className="page-title don-title-shimmer">Ways to Help Lebanon</h1>
          <p className="page-subtitle">
            Trusted organisations and verified donation destinations — grouped by cause.
            Every contribution reaches families, hospitals, and communities in need.
          </p>
          <div className="don-header-glow-line" />
        </div>
      </header>

      <main className="donations-content">

        {/* ── Featured ── */}
        {showFeatured && (
          <section className="don-featured" aria-label="Featured organisations">
            <h2 className="don-section-heading">
              <span className="don-heading-line" />
              Featured Organisations
              <span className="don-heading-line" />
            </h2>
            <VideoShowcase videos={FEATURED_VIDEO_CONCEPT} onOpen={setSelectedFeaturedVideo} />

            <CategoryCarousel>
              {featured.map(o => <OrgCard key={o.name} org={o} onSelect={setSelectedOrg} />)}
            </CategoryCarousel>
          </section>
        )}

        {/* ── Search & Filter Bar ── */}
        <div className="don-toolbar">
          <div className="orin-search-interface">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search organisations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search organisations"
            />
          </div>
          <div className="don-filters" role="tablist" aria-label="Filter by category">
            <button
              role="tab"
              aria-selected={activeCategory === 'All'}
              className={`don-filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >All <span className="don-filter-badge">{filtered.length}</span></button>
            {CATEGORIES.map(c => {
              const count = filtered.filter(o => o.category === c).length;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={activeCategory === c}
                  className={`don-filter-btn ${activeCategory === c ? 'active' : ''}`}
                  onClick={() => setActiveCategory(c)}
                  style={{ '--tab-accent': CATEGORY_ACCENT[c] }}
                >
                  <span className="don-filter-icon">{CATEGORY_ICONS[c]}</span>
                  {c}
                  <span className="don-filter-badge">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Category Sections ── */}
        {filtered.length === 0 && (
          <div className="don-empty">
            <p>No organisations match your search.</p>
          </div>
        )}

        {CATEGORIES.filter(c => grouped[c]?.length).map(category => (
          <section key={category} className="don-category-section">
            <h2 className="don-category-title" style={{ '--cat-accent': CATEGORY_ACCENT[category] }}>
              <span className="don-cat-icon">{CATEGORY_ICONS[category]}</span>
              {category}
              <span className="don-cat-count">{grouped[category].length}</span>
            </h2>

            {/* Desktop grid, mobile carousel */}
            <div className="don-grid-desktop">
              {grouped[category].map(o => <OrgCard key={o.name} org={o} onSelect={setSelectedOrg} />)}
            </div>
            <div className="don-carousel-mobile">
              <CategoryCarousel>
                {grouped[category].map(o => <OrgCard key={o.name} org={o} onSelect={setSelectedOrg} />)}
              </CategoryCarousel>
            </div>
          </section>
        ))}

        {/* ── CTA ── */}
        <section className="donations-cta">
          <div className="donations-cta-inner">
            <h2>Every Dollar Counts</h2>
            <p>Choose any organisation above to make a difference — every contribution helps save lives in Lebanon.</p>
            <a
              href="https://supportlrc.app/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="donations-btn"
              onClick={() => {
                trackEvent('donate_click', {
                  location: 'donations_page_cta',
                  destination: 'supportlrc',
                  page: 'donations',
                });
              }}
            >
              Donate Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="donations-btn-arrow">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <p className="donations-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              Secure — SSL encrypted
            </p>
          </div>
        </section>
      </main>

      <footer className="page-footer">
        <p>&copy; {new Date().getFullYear()} Just Help Lebanon. For dignity, for families, for Lebanon.</p>
      </footer>
    </div>
  );
}
