import { useEffect, useRef, useState } from 'react';
import crisisDataService from './services/CrisisDataService.js';

/* ── Scroll-triggered fade-in (reused pattern) ── */
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

/* ── Animated counter ── */
function AnimatedNumber({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!value) return;
    let start = 0;
    const end = Number(value);
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

/* ── SVG Icons ── */
const ICONS = {
  database: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  people: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  file: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  displacement: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
    </svg>
  ),
};

/* ── Stat Card ── */
function StatCard({ icon, label, value, sub, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`crisis-stat-card ${visible ? 'pop-in' : ''}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="crisis-stat-icon">{icon}</div>
      <div className="crisis-stat-value">
        {visible ? <AnimatedNumber value={value} /> : '—'}
      </div>
      <div className="crisis-stat-label">{label}</div>
      {sub && <div className="crisis-stat-sub">{sub}</div>}
    </div>
  );
}

/* ── Dataset Card ── */
function DatasetCard({ dataset, index }) {
  return (
    <a
      href={dataset.url}
      target="_blank"
      rel="noopener noreferrer"
      className="crisis-dataset-card"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="dataset-org-badge">{dataset.org}</div>
      <h4 className="dataset-title">{dataset.title}</h4>
      {dataset.notes && <p className="dataset-notes">{dataset.notes}…</p>}
      <div className="dataset-meta">
        <span className="dataset-date">Updated {dataset.updated}</span>
        <span className="dataset-resources">{dataset.resources} files</span>
      </div>
    </a>
  );
}

/* ── Report Card ── */
function ReportCard({ report, index }) {
  return (
    <a
      href={report.url}
      target="_blank"
      rel="noopener noreferrer"
      className="crisis-report-card"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="report-source-badge">{report.source}</div>
      <h4 className="report-title">{report.title}</h4>
      <div className="report-footer">
        <span className="report-date">{report.date}</span>
        <span className="report-arrow">{ICONS.arrow}</span>
      </div>
    </a>
  );
}

/* ── Origin Bar ── */
function OriginBar({ origin, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="origin-row">
      <span className="origin-name">{origin}</span>
      <div className="origin-bar-wrap">
        <div className="origin-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="origin-count">{count.toLocaleString()}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Dashboard
   ───────────────────────────────────────── */
export default function CrisisDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    crisisDataService.getOverview().then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <section className="crisis-dashboard crisis-loading">
        <div className="crisis-spinner" />
        <p className="crisis-loading-text">Loading live crisis data…</p>
      </section>
    );
  }

  if (error && !data) {
    return (
      <section className="crisis-dashboard crisis-error">
        <p>Unable to load crisis data. Please try again later.</p>
      </section>
    );
  }

  const hdx = data?.hdx;
  const reports = data?.reliefweb || [];
  const unhcr = data?.unhcr;
  const maxOrigin = unhcr?.byOrigin?.[0]?.count || 1;

  return (
    <section className="crisis-dashboard">
      {/* Header */}
      <div className="crisis-header">
        <span className="crisis-live-badge">
          <span className="crisis-live-dot" />
          Live Data
        </span>
        <h2 className="section-title">Lebanon Crisis Overviews</h2>
        <p className="section-sub">
          Real-time humanitarian data from HDX, ReliefWeb &amp; UNHCR
        </p>
      </div>

      {/* Key Stats */}
      <div className="crisis-stats-grid">
        {hdx && (
          <StatCard
            icon={ICONS.database}
            label="HDX Datasets"
            value={hdx.count}
            sub="Lebanon IDP datasets available"
            delay={0}
          />
        )}
        {unhcr && (
          <StatCard
            icon={ICONS.people}
            label="Refugees in Lebanon"
            value={unhcr.totalRefugees}
            sub={`Data year: ${unhcr.year}`}
            delay={0.1}
          />
        )}
        <StatCard
          icon={ICONS.file}
          label="Recent Reports"
          value={reports.length}
          sub="From ReliefWeb"
          delay={0.2}
        />
        {unhcr && (
          <StatCard
            icon={ICONS.globe}
            label="Countries of Origin"
            value={unhcr.byOrigin?.length || 0}
            sub="Tracked by UNHCR"
            delay={0.3}
          />
        )}
      </div>

      {/* UNHCR Origin Breakdown */}
      {unhcr?.byOrigin?.length > 0 && (
        <div className="crisis-block">
          <h3 className="crisis-block-title">
            <span className="crisis-block-icon">{ICONS.displacement}</span>
            Refugees by Country of Origin
          </h3>
          <div className="origin-chart">
            {unhcr.byOrigin.map((o) => (
              <OriginBar key={o.origin} origin={o.origin} count={o.count} max={maxOrigin} />
            ))}
          </div>
        </div>
      )}

      {/* ReliefWeb Reports */}
      {reports.length > 0 && (
        <div className="crisis-block">
          <h3 className="crisis-block-title">
            <span className="crisis-block-icon">{ICONS.file}</span>
            Latest Humanitarian Reports
          </h3>
          <div className="crisis-reports-grid">
            {reports.map((r, i) => (
              <ReportCard key={i} report={r} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* HDX Datasets */}
      {hdx?.datasets?.length > 0 && (
        <div className="crisis-block">
          <h3 className="crisis-block-title">
            <span className="crisis-block-icon">{ICONS.database}</span>
            Open Humanitarian Datasets
          </h3>
          <div className="crisis-datasets-grid">
            {hdx.datasets.map((d, i) => (
              <DatasetCard key={i} dataset={d} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Data Sources Footer */}
      <div className="crisis-sources">
        <span className="crisis-sources-label">Data Sources:</span>
        <a href="https://data.humdata.org" target="_blank" rel="noopener noreferrer" className="crisis-source-chip">HDX</a>
        <a href="https://reliefweb.int" target="_blank" rel="noopener noreferrer" className="crisis-source-chip">ReliefWeb</a>
        <a href="https://data.unhcr.org" target="_blank" rel="noopener noreferrer" className="crisis-source-chip">UNHCR</a>
        <a href="https://dtm.iom.int/lebanon" target="_blank" rel="noopener noreferrer" className="crisis-source-chip">IOM DTM</a>
        <a href="https://www.internal-displacement.org" target="_blank" rel="noopener noreferrer" className="crisis-source-chip">IDMC</a>
      </div>
    </section>
  );
}
