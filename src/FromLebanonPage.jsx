import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';

/* ═══════════════════════════════════════
   Category Icons
   ═══════════════════════════════════════ */
const CAT_ICONS = {
  Fashion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L8 6H3v4l4 2v10h10V12l4-2V6h-5l-4-4z"/>
    </svg>
  ),
  'Food & Drink': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  ),
  Restaurants: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><line x1="7" y1="2" x2="7" y2="22"/><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/>
    </svg>
  ),
  'Beauty & Wellness': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2m-9-11h2m18 0h2m-4.2-6.8l-1.4 1.4M6.6 17.4l-1.4 1.4m0-12.8l1.4 1.4m10.8 10.8l1.4 1.4"/>
    </svg>
  ),
  'Art & Design': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>
    </svg>
  ),
  'Jewellery & Accessories': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const CAT_COLORS = {
  Fashion: '#e84393',
  'Food & Drink': '#fdcb6e',
  Restaurants: '#e17055',
  'Beauty & Wellness': '#a29bfe',
  'Art & Design': '#00cec9',
  'Jewellery & Accessories': '#f8a5c2',
};

/* ═══════════════════════════════════════
   Product / Brand Data
   ═══════════════════════════════════════ */
const BRANDS = [
  // ── Fashion ──
  { name: 'Elie Saab', category: 'Fashion', instagram: 'eliesaabworld',
    desc: 'World-renowned couture house — Lebanese luxury at its finest.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Elie_Saab_logo.svg/200px-Elie_Saab_logo.svg.png' },
  { name: 'Zuhair Murad', category: 'Fashion', instagram: 'zabormurad',
    desc: 'Haute couture and ready-to-wear — red-carpet glamour born in Beirut.',
    image: 'https://www.google.com/s2/favicons?domain=zuhairmurad.com&sz=128' },
  { name: 'Rami Kadi', category: 'Fashion', instagram: 'ramikadi',
    desc: 'Avant-garde bridal and evening wear with a bold artistic vision.',
    image: 'https://www.google.com/s2/favicons?domain=ramikadi.com&sz=128' },
  { name: 'Sarah\'s Bag', category: 'Fashion', instagram: 'sarahsbag',
    desc: 'Handcrafted bags empowering marginalised Lebanese women artisans.',
    image: 'https://www.google.com/s2/favicons?domain=sarahsbag.com&sz=128' },
  { name: 'Nour Hammour', category: 'Fashion', instagram: 'nourhammour',
    desc: 'Luxury leather jackets — Parisian edge meets Lebanese soul.',
    image: 'https://www.google.com/s2/favicons?domain=nourhammour.com&sz=128' },

  // ── Food & Drink ──
  { name: 'Arak El Massaya', category: 'Food & Drink', instagram: 'massaya_',
    desc: 'Premium Lebanese arak — the spirit of the Bekaa Valley.',
    image: 'https://www.google.com/s2/favicons?domain=massaya.com&sz=128' },
  { name: 'Château Ksara', category: 'Food & Drink', instagram: 'chateauksara',
    desc: 'Lebanon\'s oldest winery — world-class wines since 1857.',
    image: 'https://www.google.com/s2/favicons?domain=ksara.com.lb&sz=128' },
  { name: 'Château Musar', category: 'Food & Drink', instagram: 'chateaumusar',
    desc: 'Iconic Bekaa Valley wines celebrated across the globe.',
    image: 'https://www.google.com/s2/favicons?domain=chateaumusar.com&sz=128' },
  { name: 'Cortas', category: 'Food & Drink', instagram: 'cortasfood',
    desc: 'Authentic Lebanese food products — pomegranate molasses, rose water & more.',
    image: 'https://www.google.com/s2/favicons?domain=cortas.com&sz=128' },
  { name: 'Gardenia', category: 'Food & Drink', instagram: 'gardeniagrain',
    desc: 'Lebanese grain mill and baked goods — manouche staple since 1977.',
    image: 'https://www.google.com/s2/favicons?domain=gardenia.com.lb&sz=128' },

  // ── Restaurants ──
  { name: 'Em Sherif', category: 'Restaurants', instagram: 'emsherifrestaurant',
    desc: 'Fine Lebanese dining — opulent décor and legendary mezza.',
    image: 'https://www.google.com/s2/favicons?domain=emsherif.com&sz=128' },
  { name: 'Abd El Wahab', category: 'Restaurants', instagram: 'abdelwahab.restaurant',
    desc: 'Classic Lebanese cuisine in the heart of Beirut\'s Achrafieh.',
    image: 'https://www.google.com/s2/favicons?domain=abdelwahab.com.lb&sz=128' },
  { name: 'Tawlet', category: 'Restaurants', instagram: 'tawletbeirut',
    desc: 'Farm-to-table concept showcasing regional Lebanese home cooking.',
    image: 'https://www.google.com/s2/favicons?domain=tawlet.com&sz=128' },
  { name: 'Kahwet Leila', category: 'Restaurants', instagram: 'kahwetleila',
    desc: 'Vintage Beirut café — Arabic coffee, old-world charm, live music.',
    image: 'https://www.google.com/s2/favicons?domain=kahwetleila.com&sz=128' },

  // ── Beauty & Wellness ──
  { name: 'Shiffa', category: 'Beauty & Wellness', instagram: 'shaboriffabeauty',
    desc: 'Luxury clean beauty rooted in Middle Eastern botanical traditions.',
    image: 'https://www.google.com/s2/favicons?domain=shiffa.com&sz=128' },
  { name: 'Bkind', category: 'Beauty & Wellness', instagram: 'baborekind',
    desc: 'Vegan skincare and body care handmade in small batches.',
    image: 'https://www.google.com/s2/favicons?domain=bkind.com&sz=128' },

  // ── Art & Design ──
  { name: 'Nada Debs', category: 'Art & Design', instagram: 'nadadebs',
    desc: 'East-meets-West furniture design — Lebanese craftsmanship, Japanese minimalism.',
    image: 'https://www.google.com/s2/favicons?domain=nadadebs.com&sz=128' },
  { name: 'Bokja Design', category: 'Art & Design', instagram: 'bokjadesign',
    desc: 'Iconic upcycled furniture wrapped in vintage Middle Eastern textiles.',
    image: 'https://www.google.com/s2/favicons?domain=bokjadesign.com&sz=128' },
  { name: 'House of Today', category: 'Art & Design', instagram: 'houseoftoday',
    desc: 'Non-profit promoting Lebanese design talent to the world stage.',
    image: 'https://www.google.com/s2/favicons?domain=houseoftoday.com&sz=128' },

  // ── Jewellery & Accessories ──
  { name: 'Selim Mouzannar', category: 'Jewellery & Accessories', instagram: 'selimmouzannar',
    desc: 'Fifth-generation Beirut jeweller — exquisite fine jewellery since 1890.',
    image: 'https://www.google.com/s2/favicons?domain=selimmouzannar.com&sz=128' },
  { name: 'Noor Fares', category: 'Jewellery & Accessories', instagram: 'noorfares',
    desc: 'Sacred geometry-inspired fine jewellery with a cosmic Lebanese edge.',
    image: 'https://www.google.com/s2/favicons?domain=noorfares.com&sz=128' },
  { name: 'Mukhi Sisters', category: 'Jewellery & Accessories', instagram: 'mukhisisters',
    desc: 'Playful luxury jewellery blending Lebanese heritage with modern whimsy.',
    image: 'https://www.google.com/s2/favicons?domain=mukhisisters.com&sz=128' },
];

const CATEGORIES = ['Fashion', 'Food & Drink', 'Restaurants', 'Beauty & Wellness', 'Art & Design', 'Jewellery & Accessories'];

/* ═══════════════════════════════════════
   Instagram Icon
   ═══════════════════════════════════════ */
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

/* ═══════════════════════════════════════
   Brand Card
   ═══════════════════════════════════════ */
function BrandCard({ brand }) {
  const accent = CAT_COLORS[brand.category] || '#ccc';
  const initials = brand.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <article className="fl-card" style={{ '--fl-accent': accent }}>
      <div className="fl-card-glow" />
      <div className="fl-card-inner">
        <div className="fl-card-logo">
          <img
            src={brand.image}
            alt={`${brand.name} logo`}
            loading="lazy"
            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
          <span className="fl-card-initials" style={{ display: 'none' }}>{initials}</span>
        </div>
        <div className="fl-card-body">
          <span className="fl-card-cat" style={{ color: accent }}>{brand.category}</span>
          <h3 className="fl-card-name">{brand.name}</h3>
          <p className="fl-card-desc">{brand.desc}</p>
        </div>
        <a
          href={`https://www.instagram.com/${brand.instagram}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="fl-card-ig"
          aria-label={`${brand.name} on Instagram`}
        >
          <InstagramIcon />
          <span>@{brand.instagram}</span>
        </a>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════
   Main Page
   ═══════════════════════════════════════ */
export default function FromLebanonPage() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');

  const filtered = useMemo(() => {
    let list = BRANDS;
    if (activeCat !== 'All') list = list.filter(b => b.category === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q) ||
        b.instagram.toLowerCase().includes(q)
      );
    }
    return list;
  }, [search, activeCat]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(b => {
      if (!map[b.category]) map[b.category] = [];
      map[b.category].push(b);
    });
    return map;
  }, [filtered]);

  return (
    <div className="page-root fl-page">
      {/* Nav */}
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/donations" className="nav-link">Donations</Link>
          <Link to="/from-lebanon" className="nav-link active">From Lebanon</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/videos" className="nav-link">Videos</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="fl-header">
        <div className="fl-header-particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="fl-particle" />
          ))}
        </div>
        <div className="fl-header-cedar">
          <svg viewBox="0 0 100 120" fill="none" className="fl-cedar-svg">
            <path d="M50 5 L58 30 L70 25 L60 45 L75 40 L62 60 L80 55 L60 80 L65 80 L50 115 L35 80 L40 80 L20 55 L38 60 L25 40 L40 45 L30 25 L42 30 Z"
              fill="currentColor" />
          </svg>
        </div>
        <div className="fl-header-content">
          <p className="fl-header-eyebrow">Discover &bull; Support &bull; Celebrate</p>
          <h1 className="fl-header-title">From Lebanon</h1>
          <p className="fl-header-subtitle">
            The finest Lebanese brands, flavours & artistry — shop local, support Lebanon.
          </p>
        </div>
        <div className="fl-header-glow" />
      </header>

      <main className="fl-content">
        {/* Search & Filter */}
        <div className="fl-toolbar">
          <div className="fl-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search brands…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search brands"
            />
          </div>
          <div className="fl-filters" role="tablist" aria-label="Filter by category">
            <button
              role="tab"
              aria-selected={activeCat === 'All'}
              className={`fl-filter-btn ${activeCat === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCat('All')}
            >
              All
              <span className="fl-filter-count">{filtered.length}</span>
            </button>
            {CATEGORIES.map(c => {
              const count = filtered.filter(b => b.category === c).length;
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={activeCat === c}
                  className={`fl-filter-btn ${activeCat === c ? 'active' : ''}`}
                  onClick={() => setActiveCat(c)}
                  style={{ '--fl-tab': CAT_COLORS[c] }}
                >
                  <span className="fl-filter-icon">{CAT_ICONS[c]}</span>
                  {c}
                  <span className="fl-filter-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="fl-empty">
            <p>No brands match your search.</p>
          </div>
        )}

        {/* Category sections */}
        {CATEGORIES.filter(c => grouped[c]?.length).map(cat => (
          <section key={cat} className="fl-category-section">
            <h2 className="fl-cat-title" style={{ '--fl-cat': CAT_COLORS[cat] }}>
              <span className="fl-cat-icon">{CAT_ICONS[cat]}</span>
              {cat}
              <span className="fl-cat-count">{grouped[cat].length}</span>
            </h2>
            <div className="fl-grid">
              {grouped[cat].map(b => <BrandCard key={b.name} brand={b} />)}
            </div>
          </section>
        ))}

        {/* Bottom CTA */}
        <section className="fl-cta">
          <div className="fl-cta-inner">
            <h2>Know a Lebanese Brand?</h2>
            <p>
              We're always adding new brands. Tag us on Instagram or reach out to get featured.
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
