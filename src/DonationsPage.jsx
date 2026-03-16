import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

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
  { name: 'Lebanese Red Cross', category: 'Food & Medical Aid', featured: true,
    desc: 'The primary emergency-response organisation in Lebanon — providing ambulance services, disaster relief, and blood transfusion across the country.',
    url: 'https://www.redcross.org.lb/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Lebanese_Red_Cross_Logo.svg/200px-Lebanese_Red_Cross_Logo.svg.png' },
  { name: 'Empower Lebanon', category: 'Food & Medical Aid', featured: false,
    desc: 'Grassroots initiative delivering food parcels and hygiene kits to vulnerable families in underserved communities.',
    url: 'https://www.empowerlebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=empowerlebanon.org&sz=128' },
  { name: 'Beit Al Baraka', category: 'Food & Medical Aid', featured: true,
    desc: 'Social supermarket providing dignified access to free groceries for families in need across Beirut and beyond.',
    url: 'https://www.beitelbaraka.org/', logo: 'https://www.google.com/s2/favicons?domain=beitalbaraka.org&sz=128' },
  { name: 'Lebanese Food Bank', category: 'Food & Medical Aid', featured: false,
    desc: 'Fights hunger and food waste by collecting surplus food from restaurants and distributing it to those in need.',
    url: 'https://www.lebanesefoodbank.org/', logo: 'https://www.google.com/s2/favicons?domain=lebanesefoodbank.org&sz=128' },
  { name: 'Al-Kafaat Emergency Fund', category: 'Food & Medical Aid', featured: false,
    desc: 'Provides emergency medical care, rehabilitation, and assistive devices for people with disabilities affected by the crisis.',
    url: 'https://www.al-kafaat.org/', logo: 'https://www.google.com/s2/favicons?domain=al-kafaat.org&sz=128' },
  { name: 'Help Critically Ill Patients', category: 'Food & Medical Aid', featured: false,
    desc: 'Funds life-saving treatments for critically ill patients who cannot afford hospital bills in Lebanon.',
    url: 'https://www.yallagivelebanon.com/', logo: 'https://www.google.com/s2/favicons?domain=yallagivelebanon.com&sz=128' },

  // ── Shelter & Reconstruction ──
  { name: 'Baytna Baytak', category: 'Shelter & Reconstruction', featured: true,
    desc: 'Opens its doors as a community shelter providing free housing, meals, and psychological support to displaced families.',
    url: 'https://www.baytnabaytak.org/', logo: 'https://www.google.com/s2/favicons?domain=baytnabaytak.org&sz=128' },
  { name: 'Rebuild Beirut', category: 'Shelter & Reconstruction', featured: false,
    desc: 'Grassroots movement restoring homes damaged by the Beirut explosion—window by window, wall by wall.',
    url: 'https://www.rebuildbeirut.com/', logo: 'https://www.google.com/s2/favicons?domain=rebuildbeirut.com&sz=128' },
  { name: 'Beib w Shebbek', category: 'Shelter & Reconstruction', featured: false,
    desc: 'Replaces doors and windows for homes destroyed in the Beirut blast, restoring safety and dignity for families.',
    url: 'https://www.instagram.com/beibwshebbek/', logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128' },
  { name: 'Windows for Beirut', category: 'Shelter & Reconstruction', featured: false,
    desc: 'Crowd-funded initiative repairing broken windows in hundreds of blast-damaged apartments across Beirut.',
    url: 'https://www.windowsforbeirut.com/', logo: 'https://www.google.com/s2/favicons?domain=windowsforbeirut.com&sz=128' },

  // ── Education, Environment & Support ──
  { name: 'Teach for Lebanon', category: 'Education, Environment & Support', featured: true,
    desc: 'Places qualified teachers in under-resourced schools to ensure every child in Lebanon has access to quality education.',
    url: 'https://www.teachforlebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=teachforlebanon.org&sz=128' },
  { name: 'KAFA', category: 'Education, Environment & Support', featured: false,
    desc: 'Advocates for an end to gender-based violence and supports survivors with legal aid, counselling, and shelter.',
    url: 'https://www.kafa.org.lb/', logo: 'https://www.google.com/s2/favicons?domain=kafa.org.lb&sz=128' },
  { name: 'Solar Panel Campaign', category: 'Education, Environment & Support', featured: false,
    desc: 'Installs solar panels in hospitals, schools, and homes to combat crippling power outages across Lebanon.',
    url: 'https://www.instagram.com/solarpanelcampaign/', logo: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=128' },
  { name: 'Kafala Victims', category: 'Education, Environment & Support', featured: false,
    desc: 'Supports migrant domestic workers trapped in the kafala system with legal assistance, shelter, and repatriation.',
    url: 'https://www.antislavery.org/', logo: 'https://www.google.com/s2/favicons?domain=antislavery.org&sz=128' },
  { name: 'Animals Lebanon', category: 'Education, Environment & Support', featured: false,
    desc: 'Rescues and rehabilitates animals in crisis, advocates for animal welfare legislation, and runs the only shelter of its kind.',
    url: 'https://www.animalslebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=animalslebanon.org&sz=128' },
  { name: 'Recycle Lebanon', category: 'Education, Environment & Support', featured: false,
    desc: 'Promotes sustainable waste management through community recycling programs and environmental education initiatives.',
    url: 'https://www.recyclelebanon.org/', logo: 'https://www.google.com/s2/favicons?domain=recyclelebanon.org&sz=128' },

  // ── Other Fundraisers ──
  { name: 'LIFE Lebanon', category: 'Other Fundraisers', featured: false,
    desc: 'International humanitarian campaign supporting multisector relief projects in Lebanon — from food to mental health.',
    url: 'https://www.lifelebanon.com/', logo: 'https://www.google.com/s2/favicons?domain=lifelebanon.com&sz=128' },
  { name: 'Impact Lebanon', category: 'Other Fundraisers', featured: true,
    desc: 'Diaspora-led platform funding high-impact community projects voted on by the Lebanese public.',
    url: 'https://www.impactlebanon.com/', logo: 'https://www.google.com/s2/favicons?domain=impactlebanon.com&sz=128' },

  // ── More Places to Donate ──
  { name: 'Canadian Red Cross', category: 'More Places to Donate', featured: true,
    desc: 'Official Canadian Red Cross portal — accepts tax-deductible donations designated specifically for Lebanon relief.',
    url: 'https://give.redcross.ca/page/LHNA', logo: 'https://www.google.com/s2/favicons?domain=redcross.ca&sz=128' },
  { name: 'UNICEF for Lebanon', category: 'More Places to Donate', featured: true,
    desc: 'Funds child protection programmes, clean water, vaccinations, and education for the most vulnerable children in Lebanon.',
    url: 'https://www.unicef.org/lebanon/', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Logo_of_UNICEF.svg/200px-Logo_of_UNICEF.svg.png' },
  { name: 'Oxfam', category: 'More Places to Donate', featured: false,
    desc: 'Global humanitarian organisation providing clean water, food assistance, and livelihoods support in Lebanon.',
    url: 'https://www.oxfam.org/en/what-we-do/countries/lebanon', logo: 'https://www.google.com/s2/favicons?domain=oxfam.org&sz=128' },
  { name: 'Ajialouna', category: 'More Places to Donate', featured: false,
    desc: 'Provides free education, healthcare, and community development for disadvantaged children and youth in Lebanon.',
    url: 'https://www.ajialouna.org/', logo: 'https://www.google.com/s2/favicons?domain=ajialouna.org&sz=128' },
  { name: 'Bassma', category: 'More Places to Donate', featured: false,
    desc: 'Empowers marginalised families with education sponsorships, healthcare, and micro-enterprise funding.',
    url: 'https://www.bassma.org/', logo: 'https://www.google.com/s2/favicons?domain=bassma.org&sz=128' },
  { name: 'Caritas Lebanon', category: 'More Places to Donate', featured: false,
    desc: 'Catholic relief agency delivering food, shelter, healthcare, and psychosocial support to communities in crisis.',
    url: 'https://www.caritas.org.lb/', logo: 'https://www.google.com/s2/favicons?domain=caritas.org.lb&sz=128' },
  { name: 'Food Blessed', category: 'More Places to Donate', featured: false,
    desc: 'Rescues surplus food from hotels and restaurants and redistributes it to families and shelters in need.',
    url: 'https://www.foodblessed.com/', logo: 'https://www.google.com/s2/favicons?domain=foodblessed.com&sz=128' },
  { name: 'Lebanon Needs', category: 'More Places to Donate', featured: false,
    desc: 'Matches donors with verified urgent needs — from medication to school fees — through a transparent request platform.',
    url: 'https://www.lebanonneeds.com/', logo: 'https://www.google.com/s2/favicons?domain=lebanonneeds.com&sz=128' },
  { name: 'Saint George Hospital', category: 'More Places to Donate', featured: false,
    desc: 'Historic Beirut hospital severely damaged in the blast — donations fund reconstruction and patient care.',
    url: 'https://www.stgeorgehospital.org/', logo: 'https://www.google.com/s2/favicons?domain=stgeorgehospital.org&sz=128' },
  { name: 'Arcenciel', category: 'More Places to Donate', featured: false,
    desc: 'Social enterprise providing health, environment, and inclusion services — from waste management to disability care.',
    url: 'https://www.arcenciel.org/', logo: 'https://www.google.com/s2/favicons?domain=arcenciel.org&sz=128' },
  { name: "Children's Cancer Center", category: 'More Places to Donate', featured: false,
    desc: 'The only specialised paediatric cancer treatment facility in Lebanon — treating children regardless of ability to pay.',
    url: 'https://www.cccl.org.lb/', logo: 'https://www.google.com/s2/favicons?domain=cccl.org.lb&sz=128' },
  { name: 'Nusaned', category: 'More Places to Donate', featured: false,
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

/* Organisation Card */
function OrgCard({ org }) {
  const accent = CATEGORY_ACCENT[org.category] || '#888';
  const initials = org.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <article className="org-card" style={{ '--card-accent': accent }}>
      <div className="org-card-logo">
        <img src={org.logo} alt={`${org.name} logo`} loading="lazy" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        <span className="org-card-initials" style={{ display: 'none' }}>{initials}</span>
      </div>
      <div className="org-card-body">
        <span className="org-card-cat" style={{ color: accent }}>{org.category}</span>
        <h3 className="org-card-name">{org.name}</h3>
        <p className="org-card-desc">{org.desc}</p>
      </div>
      <a href={org.url} target="_blank" rel="noopener noreferrer" className="org-card-cta" aria-label={`Donate to ${org.name}`}>
        View / Donate <ExternalIcon />
      </a>
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

/* ═══════════════════════════════════════
   Main Page
   ═══════════════════════════════════════ */
export default function DonationsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  /* Featured orgs */
  const featured = useMemo(() => ORGANIZATIONS.filter(o => o.featured), []);

  /* Filtered results */
  const filtered = useMemo(() => {
    let list = ORGANIZATIONS;
    if (activeCategory !== 'All') list = list.filter(o => o.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => o.name.toLowerCase().includes(q) || o.desc.toLowerCase().includes(q));
    }
    return list;
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
      {/* Nav */}
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/donations" className="nav-link active">Donations</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="page-header donations-header">
        <h1 className="page-title">Ways to Help Lebanon</h1>
        <p className="page-subtitle">
          Trusted organisations and verified donation destinations — grouped by cause.
          Every contribution reaches families, hospitals, and communities in need.
        </p>
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
            <CategoryCarousel>
              {featured.map(o => <OrgCard key={o.name} org={o} />)}
            </CategoryCarousel>
          </section>
        )}

        {/* ── Search & Filter Bar ── */}
        <div className="don-toolbar">
          <div className="don-search">
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
              {grouped[category].map(o => <OrgCard key={o.name} org={o} />)}
            </div>
            <div className="don-carousel-mobile">
              <CategoryCarousel>
                {grouped[category].map(o => <OrgCard key={o.name} org={o} />)}
              </CategoryCarousel>
            </div>
          </section>
        ))}

        {/* ── CTA ── */}
        <section className="donations-cta">
          <div className="donations-cta-inner">
            <h2>Every Dollar Counts</h2>
            <p>Choose any organisation above, or donate directly through the Canadian Red Cross — a trusted humanitarian partner.</p>
            <a
              href="https://give.redcross.ca/page/LHNA"
              target="_blank"
              rel="noopener noreferrer"
              className="donations-btn"
            >
              Donate via Red Cross
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
