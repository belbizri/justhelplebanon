import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

/* ── Animated counter ── */
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    const end = Number(value);
    let start = 0;
    const step = Math.max(1, Math.floor(end / 60));
    const interval = Math.max(16, duration / (end / step));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, interval);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

/* ── Scroll reveal ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── SVG Icons ── */
const ICONS = {
  hospital: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" /><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M9 21v-4h6v4" /><path d="M10 9h4" /><path d="M12 7v4" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  injured: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  martyrs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <line x1="17" y1="8" x2="23" y2="8" />
    </svg>
  ),
  closed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  map: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  ),
};

/* ── Normalise MoPH records ── */
function normaliseMoph(attrs, source) {
  if (source === '2024') {
    return {
      name: attrs.name || attrs.name_ar || '—',
      nameAr: attrs.name_ar || '',
      governorate: attrs.governorate_name || '',
      district: attrs.district_name || '',
      date: attrs['تاريخ_الاعتداء'] || '',
      dateTs: attrs.dateofincident || 0,
      damage: attrs.damagereport || attrs['طبيعة_الاضرار'] || '',
      injured: attrs.injuries ?? attrs['عدد_الجرحى'] ?? 0,
      martyrs: attrs.martyrs ?? attrs['عدد_الشهداء'] ?? 0,
      vehicles: attrs.vehicles ?? attrs['الاليات_المتضررة'] ?? 0,
      status: attrs.current_status || attrs['وضع_المستشفى_حالياً'] || '',
      statusAr: attrs['وضع_المستشفى_حالياً'] || '',
    };
  }
  return {
    name: attrs['إسم_المستشفى'] || '—',
    nameAr: attrs['إسم_المستشفى'] || '',
    governorate: attrs['المحافظة'] || '',
    district: attrs['القضاء'] || '',
    date: attrs['تاريخ_الاعتداء'] || '',
    dateTs: 0,
    damage: attrs['طبيعة_الاضرار'] || '',
    injured: attrs['عدد_الجرحى'] ?? 0,
    martyrs: attrs['عدد_الشهداء'] ?? 0,
    vehicles: attrs['الاليات_المتضررة'] ?? 0,
    status: '',
    statusAr: attrs['وضع_المستشفى_حالياً'] || '',
  };
}

/* ── Status helpers ── */
const STATUS_MAP = {
  'Operate normally': 'Operational',
  'Partially operating': 'Partial',
  'Out of service': 'Out of Service',
  'تعمل بشكل طبيعي': 'Operational',
  'تعمل بشكل جزئي': 'Partial',
  'خارج الخدمة': 'Out of Service',
  'مقفلة قسرياً': 'Forcibly Closed',
  'أعادت فتح أبوابها': 'Reopened',
  'مقفلة': 'Closed',
};

function getStatusLabel(rec) {
  return STATUS_MAP[rec.status] || STATUS_MAP[rec.statusAr] || rec.status || rec.statusAr || 'Unknown';
}

function getStatusClass(label) {
  if (label === 'Operational' || label === 'Reopened') return 'status-ok';
  if (label === 'Partial') return 'status-warn';
  return 'status-critical';
}

/* ── Data fetching ── */
async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function loadAllData() {
  // Load HDX Insecurity Insight (primary, 2016-2026) + MoPH hospital data
  let hdxData, mophLegacy, moph2024;

  // HDX — static JSON only (pre-fetched from XLSX at build time)
  hdxData = await fetchJSON('/data/hdx-health-attacks.json');

  // MoPH — try server proxy, fall back to static JSON
  try {
    [mophLegacy, moph2024] = await Promise.all([
      fetchJSON('/api/moph/attacks'),
      fetchJSON('/api/moph/attacks2024'),
    ]);
  } catch {
    [mophLegacy, moph2024] = await Promise.all([
      fetchJSON('/data/moph-attacks.json'),
      fetchJSON('/data/moph-attacks-2024.json'),
    ]);
  }

  const mophRecords = [
    ...(mophLegacy.features || []).map(f => normaliseMoph(f.attributes, 'legacy')),
    ...(moph2024.features || []).map(f => normaliseMoph(f.attributes, '2024')),
  ];

  return { hdxData, mophRecords };
}

/* ── Compute HDX stats ── */
function computeHdxStats(records, yearFilter) {
  const filtered = yearFilter === 'all'
    ? records
    : records.filter(r => r.date?.startsWith(yearFilter));

  let killed = 0, injured = 0, kidnapped = 0, arrested = 0;
  let facilitiesDestroyed = 0, facilitiesDamaged = 0;
  let transportDestroyed = 0, transportDamaged = 0;
  const govCounts = {};
  const weaponCounts = {};
  const yearCounts = {};

  filtered.forEach(r => {
    killed += r.healthWorkersKilled || 0;
    injured += r.healthWorkersInjured || 0;
    kidnapped += r.healthWorkersKidnapped || 0;
    arrested += r.healthWorkersArrested || 0;
    facilitiesDestroyed += r.facilitiesDestroyed || 0;
    facilitiesDamaged += r.facilitiesDamaged || 0;
    transportDestroyed += r.transportDestroyed || 0;
    transportDamaged += r.transportDamaged || 0;
    const gov = r.admin1 || 'Unknown';
    govCounts[gov] = (govCounts[gov] || 0) + 1;
    if (r.weapon) weaponCounts[r.weapon] = (weaponCounts[r.weapon] || 0) + 1;
    const yr = r.date?.slice(0, 4);
    if (yr) yearCounts[yr] = (yearCounts[yr] || 0) + 1;
  });

  const byGovernorate = Object.entries(govCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const byWeapon = Object.entries(weaponCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const byYear = Object.entries(yearCounts)
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => a.year.localeCompare(b.year));

  return {
    total: filtered.length,
    killed,
    injured,
    kidnapped,
    arrested,
    facilitiesDestroyed,
    facilitiesDamaged,
    transportDestroyed,
    transportDamaged,
    byGovernorate,
    byWeapon,
    byYear,
  };
}

/* ── Compute MoPH stats ── */
function computeMophStats(records) {
  let totalInjured = 0, totalMartyrs = 0;
  const statusCounts = {};

  records.forEach(r => {
    totalInjured += r.injured;
    totalMartyrs += r.martyrs;
    const st = getStatusLabel(r);
    statusCounts[st] = (statusCounts[st] || 0) + 1;
  });

  return {
    totalAttacks: records.length,
    totalInjured,
    totalMartyrs,
    forcedClosures: (statusCounts['Forcibly Closed'] || 0) + (statusCounts['Closed'] || 0) + (statusCounts['Out of Service'] || 0),
  };
}

/* ── Stat Card ── */
function StatCard({ icon, label, value, accent, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`live-stat-card ${visible ? 'pop-in' : ''} ${accent || ''}`} style={{ animationDelay: `${delay}s` }}>
      <div className="live-stat-icon">{icon}</div>
      <div className="live-stat-value">
        {visible ? <AnimatedNumber value={value} /> : '—'}
      </div>
      <div className="live-stat-label">{label}</div>
    </div>
  );
}

/* ── Governorate Bar ── */
function GovBar({ name, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="gov-row">
      <span className="gov-name">{name}</span>
      <div className="gov-bar-wrap">
        <div className="gov-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="gov-count">{count}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Page Component
   ───────────────────────────────────────── */
export default function LiveUpdatesPage() {
  const [hdxData, setHdxData] = useState([]);
  const [mophRecords, setMophRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [tab, setTab] = useState('hdx'); // hdx | moph

  useEffect(() => {
    loadAllData()
      .then(({ hdxData: h, mophRecords: m }) => {
        setHdxData(h);
        setMophRecords(m);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const hdxStats = computeHdxStats(hdxData, yearFilter);
  const mophStats = computeMophStats(mophRecords);
  const maxGov = hdxStats.byGovernorate[0]?.count || 1;
  const maxWeapon = hdxStats.byWeapon[0]?.count || 1;
  const maxYear = Math.max(...hdxStats.byYear.map(y => y.count), 1);

  // Available years for filter
  const years = hdxStats.byYear.map(y => y.year);

  // HDX records filtered by year, sorted newest-first
  const hdxFiltered = (yearFilter === 'all' ? hdxData : hdxData.filter(r => r.date?.startsWith(yearFilter)))
    .slice()
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  // MoPH sorted newest-first
  const mophSorted = [...mophRecords].sort((a, b) => {
    if (a.dateTs && b.dateTs) return b.dateTs - a.dateTs;
    const parseDate = (d) => {
      if (!d) return 0;
      const parts = d.split('/');
      if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`).getTime() || 0;
      return new Date(d).getTime() || 0;
    };
    return parseDate(b.date) - parseDate(a.date);
  });

  return (
    <div className="page-root live-page">
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/live" className="nav-link active">Live Updates</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>

      <header className="page-header live-header-banner">
        <img
          src="/images/health_republic_ministry.png"
          alt="Lebanese Republic — Ministry of Public Health"
          className="live-banner-img"
        />
        <h1 className="page-title">
          <span className="live-pulse" />
          Attacks on Healthcare
        </h1>
        <p className="page-subtitle">
          Verified incident data from Insecurity Insight (HDX) &amp; the Lebanese Ministry of Public Health
        </p>
      </header>

      {loading && (
        <div className="live-loading">
          <div className="crisis-spinner" />
          <p>Loading data…</p>
        </div>
      )}

      {error && !hdxData.length && !mophRecords.length && (
        <div className="live-error">
          <p>Unable to load data. Please try again later.</p>
        </div>
      )}

      {!loading && (hdxData.length > 0 || mophRecords.length > 0) && (
        <main className="live-content">
          {/* Tab Switch */}
          <div className="live-tabs">
            <button className={`live-tab ${tab === 'hdx' ? 'active' : ''}`} onClick={() => setTab('hdx')}>
              Insecurity Insight — 2016–2026 ({hdxData.length})
            </button>
            <button className={`live-tab ${tab === 'moph' ? 'active' : ''}`} onClick={() => setTab('moph')}>
              MoPH Hospital Data ({mophRecords.length})
            </button>
          </div>

          {/* ═══ HDX TAB ═══ */}
          {tab === 'hdx' && (
            <>
              {/* Year filter */}
              <div className="live-filters">
                <div className="filter-group">
                  <span className="filter-label">Year</span>
                  <button className={`filter-btn ${yearFilter === 'all' ? 'active' : ''}`} onClick={() => setYearFilter('all')}>All ({hdxData.length})</button>
                  {years.map(yr => (
                    <button key={yr} className={`filter-btn ${yearFilter === yr ? 'active' : ''}`} onClick={() => setYearFilter(yr)}>{yr}</button>
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="live-stats-grid">
                <StatCard icon={ICONS.alert} label="Total Incidents" value={hdxStats.total} delay={0} />
                <StatCard icon={ICONS.martyrs} label="Health Workers Killed" value={hdxStats.killed} accent="accent-critical" delay={0.1} />
                <StatCard icon={ICONS.injured} label="Health Workers Injured" value={hdxStats.injured} accent="accent-warn" delay={0.2} />
                <StatCard icon={ICONS.hospital} label="Facilities Damaged" value={hdxStats.facilitiesDamaged + hdxStats.facilitiesDestroyed} delay={0.3} />
              </div>

              {/* Year Timeline */}
              {hdxStats.byYear.length > 1 && (
                <section className="live-block">
                  <h3 className="live-block-title">
                    <span className="live-block-icon">{ICONS.calendar}</span>
                    Incidents by Year
                  </h3>
                  <div className="year-chart">
                    {hdxStats.byYear.map(y => (
                      <div key={y.year} className="year-bar-col">
                        <span className="year-bar-count">{y.count}</span>
                        <div className="year-bar-track">
                          <div className="year-bar-fill" style={{ height: `${(y.count / maxYear) * 100}%` }} />
                        </div>
                        <span className="year-bar-label">{y.year}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Governorate Breakdown */}
              <section className="live-block">
                <h3 className="live-block-title">
                  <span className="live-block-icon">{ICONS.map}</span>
                  Incidents by Governorate
                </h3>
                <div className="gov-chart">
                  {hdxStats.byGovernorate.map(g => (
                    <GovBar key={g.name} name={g.name} count={g.count} max={maxGov} />
                  ))}
                </div>
              </section>

              {/* Weapon Types */}
              {hdxStats.byWeapon.length > 0 && (
                <section className="live-block">
                  <h3 className="live-block-title">
                    <span className="live-block-icon">{ICONS.alert}</span>
                    Weapon Types Used
                  </h3>
                  <div className="gov-chart">
                    {hdxStats.byWeapon.map(w => (
                      <GovBar key={w.name} name={w.name} count={w.count} max={maxWeapon} />
                    ))}
                  </div>
                </section>
              )}

              {/* Incident Table */}
              <section className="live-block">
                <h3 className="live-block-title">
                  <span className="live-block-icon">{ICONS.calendar}</span>
                  Incident Log — {hdxFiltered.length} Records
                </h3>
                <div className="live-table-wrap">
                  <table className="live-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Governorate</th>
                        <th>Weapon</th>
                        <th>Location</th>
                        <th>Killed</th>
                        <th>Injured</th>
                        <th>Perpetrator</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hdxFiltered.map((r, i) => (
                        <tr key={i}>
                          <td className="cell-date">{r.date || '—'}</td>
                          <td>{r.admin1 || '—'}</td>
                          <td>{r.weapon || '—'}</td>
                          <td>{r.location || '—'}</td>
                          <td className="cell-num cell-martyrs">{r.healthWorkersKilled || 0}</td>
                          <td className="cell-num">{r.healthWorkersInjured || 0}</td>
                          <td className="cell-perp">{r.perpetrator || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* ═══ MoPH TAB ═══ */}
          {tab === 'moph' && (
            <>
              {/* Summary Stats */}
              <div className="live-stats-grid">
                <StatCard icon={ICONS.hospital} label="Hospitals Attacked" value={mophStats.totalAttacks} delay={0} />
                <StatCard icon={ICONS.injured} label="Total Injured" value={mophStats.totalInjured} accent="accent-warn" delay={0.1} />
                <StatCard icon={ICONS.martyrs} label="Martyrs" value={mophStats.totalMartyrs} accent="accent-critical" delay={0.2} />
                <StatCard icon={ICONS.closed} label="Forced Closures" value={mophStats.forcedClosures} accent="accent-critical" delay={0.3} />
              </div>

              {/* Incident Table */}
              <section className="live-block">
                <h3 className="live-block-title">
                  <span className="live-block-icon">{ICONS.calendar}</span>
                  Hospital Incident Log — {mophSorted.length} Records
                </h3>
                <div className="live-table-wrap">
                  <table className="live-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Hospital</th>
                        <th>Governorate</th>
                        <th>District</th>
                        <th>Injured</th>
                        <th>Martyrs</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mophSorted.map((r, i) => {
                        const sl = getStatusLabel(r);
                        return (
                          <tr key={i} className={getStatusClass(sl)}>
                            <td className="cell-date">{r.date || '—'}</td>
                            <td className="cell-name">
                              <span className="name-en">{r.name}</span>
                              {r.nameAr && r.name !== r.nameAr && <span className="name-ar">{r.nameAr}</span>}
                            </td>
                            <td>{r.governorate || '—'}</td>
                            <td>{r.district || '—'}</td>
                            <td className="cell-num">{r.injured}</td>
                            <td className="cell-num cell-martyrs">{r.martyrs}</td>
                            <td><span className={`status-badge ${getStatusClass(sl)}`}>{sl}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {/* Data Sources */}
          <div className="live-source-footer">
            <span className="live-source-label">Data Sources:</span>
            <a href="https://data.humdata.org/dataset/aid-security-risk-in-lebanon" target="_blank" rel="noopener noreferrer" className="crisis-source-chip">
              Insecurity Insight (HDX)
            </a>
            <a href="https://maps.moph.gov.lb" target="_blank" rel="noopener noreferrer" className="crisis-source-chip">
              MoPH — Ministry of Public Health
            </a>
            <span className="live-updated">
              {hdxData.length + mophRecords.length} total records — data refreshed at build time.
            </span>
          </div>
        </main>
      )}
    </div>
  );
}
