import { useEffect, useRef, useState, useCallback } from 'react';
import NavBar from './NavBar.jsx';
import usePageSeo from './usePageSeo.js';

/* ── Scroll-triggered fade-in ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

/* ═══════════════════════════════════════
   Martyrs Data — placeholder, to be replaced
   ═══════════════════════════════════════ */
const MARTYRS = [
  {
    id: 1,
    name: 'Ahmad Khalil',
    nameAr: 'أحمد خليل',
    date: '2006-07-25',
    photo: null,
    description: 'An ambulance paramedic who gave his life evacuating families from south Lebanon during the 2006 conflict. He drove into danger without hesitation, saving dozens before his final mission.',
  },
  {
    id: 2,
    name: 'Rima Nassar',
    nameAr: 'ريما نصّار',
    date: '2020-08-04',
    photo: null,
    description: 'A first responder who rushed to the Beirut port explosion on August 4th 2020. She pulled survivors from the rubble for hours before succumbing to her injuries. Her courage saved lives that night.',
  },
  {
    id: 3,
    name: 'Samir Haddad',
    nameAr: 'سمير حدّاد',
    date: '2013-11-19',
    photo: null,
    description: 'A volunteer nurse stationed in Tripoli who lost his life while providing emergency medical care during civil unrest. His dedication to the wounded, regardless of affiliation, embodied the Red Cross spirit.',
  },
  {
    id: 4,
    name: 'Nour El-Dine',
    nameAr: 'نور الدين',
    date: '2023-10-14',
    photo: null,
    description: 'A young paramedic in the Bekaa Valley who died during a rescue mission in extreme conditions. He was known for his unwavering calm and compassion under pressure.',
  },
  {
    id: 5,
    name: 'Lara Gemayel',
    nameAr: 'لارا جميّل',
    date: '2019-03-07',
    photo: null,
    description: 'A disaster response volunteer who perished while coordinating relief supplies during severe flooding in northern Lebanon. She worked tirelessly to ensure no family was left behind.',
  },
  {
    id: 6,
    name: 'Hassan Mourad',
    nameAr: 'حسن مراد',
    date: '2024-11-02',
    photo: null,
    description: 'An emergency technician who sacrificed his life during the 2024 crisis in southern Lebanon, evacuating injured civilians from active conflict zones. His bravery saved an entire family.',
  },
  {
    id: 7,
    name: 'Maya Assaf',
    nameAr: 'مايا عسّاف',
    date: '2020-08-04',
    photo: null,
    description: 'A volunteer coordinator at the Beirut port explosion who organized triage stations amid the chaos. She worked until her last breath to bring order and hope to the devastation.',
  },
  {
    id: 8,
    name: 'Khaled Bazzi',
    nameAr: 'خالد بزّي',
    date: '2006-08-07',
    photo: null,
    description: 'A seasoned ambulance driver from the south who refused to leave his post during the heaviest bombardment of the 2006 war. His routes through danger zones saved countless lives.',
  },
];

function formatMartyrDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ── Red Cross SVG ── */
function RedCrossIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect x="16" y="4" width="8" height="32" rx="1.5" fill="currentColor" />
      <rect x="4" y="16" width="32" height="8" rx="1.5" fill="currentColor" />
    </svg>
  );
}

/* ── Candle SVG ── */
function CandleIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 40" width="20" height="34" className={className} aria-hidden="true">
      <ellipse cx="12" cy="8" rx="4" ry="6" fill="url(#flame)" />
      <rect x="10" y="14" width="4" height="22" rx="2" fill="#E8D5B7" opacity="0.85" />
      <defs>
        <radialGradient id="flame" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#FFE08A" />
          <stop offset="55%" stopColor="#F6AD55" />
          <stop offset="100%" stopColor="#E53E3E" stopOpacity="0.7" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── Individual Martyr Card ── */
function MartyrCard({ martyr, index }) {
  const [ref, visible] = useReveal();

  return (
    <article
      ref={ref}
      className={`martyr-card ${visible ? 'martyr-card--visible' : ''}`}
      style={{ animationDelay: `${index * 0.12}s` }}
    >
      <div className="martyr-card-inner">
        {/* Photo */}
        <div className="martyr-photo-wrap">
          {martyr.photo ? (
            <img src={martyr.photo} alt={martyr.name} className="martyr-photo" loading="lazy" />
          ) : (
            <div className="martyr-photo-placeholder">
              <RedCrossIcon size={28} className="martyr-placeholder-cross" />
            </div>
          )}
          <div className="martyr-photo-frame" />
        </div>

        {/* Info */}
        <div className="martyr-info">
          <h3 className="martyr-name">{martyr.name}</h3>
          <span className="martyr-name-ar">{martyr.nameAr}</span>
          <time className="martyr-date" dateTime={martyr.date}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatMartyrDate(martyr.date)}
          </time>
          <p className="martyr-desc">{martyr.description}</p>
        </div>

        {/* Decorative candle */}
        <div className="martyr-candle">
          <CandleIcon />
        </div>
      </div>
    </article>
  );
}

/* ── Main Page ── */
export default function MartyrsPage() {
  usePageSeo({
    title: 'Martyrs of the Lebanese Red Cross — Just Help Lebanon',
    description: 'Honoring the brave volunteers and paramedics of the Lebanese Red Cross who gave their lives in service to their country and its people.',
  });

  const [heroRef, heroVisible] = useReveal();
  const [quoteRef, quoteVisible] = useReveal();
  const [gridRef, gridVisible] = useReveal();
  const [footerRef, footerVisible] = useReveal();

  return (
    <div className="app-root martyrs-page">
      <NavBar />

      {/* ── Hero ── */}
      <section ref={heroRef} className={`martyrs-hero ${heroVisible ? 'martyrs-hero--visible' : ''}`}>
        <div className="martyrs-hero-bg" />
        <div className="martyrs-hero-overlay" />
        <div className="martyrs-hero-grain" />

        {/* Animated cross glow */}
        <div className="martyrs-cross-glow" aria-hidden="true">
          <RedCrossIcon size={120} className="martyrs-hero-cross" />
        </div>

        <div className="martyrs-hero-content">
          <span className="martyrs-eyebrow">
            <RedCrossIcon size={14} className="martyrs-eyebrow-cross" />
            In Memoriam
          </span>

          <h1 className="martyrs-title">
            شهداء الصليب الأحمر اللبناني
          </h1>
          <h2 className="martyrs-subtitle">
            Martyrs of the Lebanese Red Cross
          </h2>
          <p className="martyrs-lead">
            They answered the call when no one else would. They ran toward danger
            so others could run to safety. They gave everything — and asked for nothing.
          </p>
          <p className="martyrs-lead martyrs-lead-ar" dir="rtl">
            لبّوا النداء حين لم يجرؤ أحد. ركضوا نحو الخطر ليركض غيرهم نحو الأمان.
            قدّموا كل شيء — ولم يطلبوا شيئاً.
          </p>

          <div className="martyrs-hero-count">
            <span className="martyrs-count-number">{MARTYRS.length}</span>
            <span className="martyrs-count-label">Heroes Remembered</span>
          </div>
        </div>

        <div className="martyrs-hero-fade" />
      </section>

      {/* ── Quote Section ── */}
      <section ref={quoteRef} className={`martyrs-quote-section ${quoteVisible ? 'revealed' : ''}`}>
        <div className="martyrs-quote-inner">
          <div className="martyrs-quote-cross" aria-hidden="true">
            <RedCrossIcon size={20} />
          </div>
          <blockquote className="martyrs-quote">
            <p>"The volunteers of the Lebanese Red Cross are the heartbeat of a nation that refuses to stop beating."</p>
          </blockquote>
          <div className="martyrs-quote-line" />
        </div>
      </section>

      {/* ── Martyrs Grid ── */}
      <section ref={gridRef} className={`martyrs-grid-section ${gridVisible ? 'revealed' : ''}`}>
        <div className="martyrs-section-header">
          <h2 className="martyrs-section-title">
            <CandleIcon className="martyrs-title-candle" />
            Those Who Gave Everything
          </h2>
          <p className="martyrs-section-sub">
            Each name carries a story of sacrifice. Each story carries the weight of a nation's gratitude.
          </p>
        </div>

        <div className="martyrs-grid">
          {MARTYRS.map((m, i) => (
            <MartyrCard key={m.id} martyr={m} index={i} />
          ))}
        </div>
      </section>

      {/* ── Eternal Flame Footer ── */}
      <section ref={footerRef} className={`martyrs-eternal ${footerVisible ? 'revealed' : ''}`}>
        <div className="martyrs-eternal-inner">
          <div className="martyrs-flame-wrap" aria-hidden="true">
            <div className="martyrs-flame" />
            <div className="martyrs-flame-glow" />
          </div>

          <p className="martyrs-eternal-text" dir="rtl">
            خالدون في ذاكرة الوطن
          </p>
          <p className="martyrs-eternal-eng">
            Forever in the memory of the nation
          </p>

          <div className="martyrs-eternal-bar">
            <span /><span /><span />
          </div>
        </div>
      </section>
    </div>
  );
}
