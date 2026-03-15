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
      <span className="report-date">{report.date}</span>
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
  const [sectionRef, sectionVisible] = useReveal();

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
    <section
      ref={sectionRef}
      className={`crisis-dashboard reveal-section ${sectionVisible ? 'revealed' : ''}`}
    >
      {/* Header */}
      <div className="crisis-header">
        <span className="crisis-live-badge">
          <span className="crisis-live-dot" />
          Live Data
        </span>
        <h2 className="section-title">Lebanon Crisis Overview</h2>
        <p className="section-sub">
          Real-time humanitarian data from HDX, ReliefWeb &amp; UNHCR
        </p>
      </div>

      {/* Key Stats */}
      <div className="crisis-stats-grid">
        {hdx && (
          <StatCard
            icon="📊"
            label="HDX Datasets"
            value={hdx.count}
            sub="Lebanon IDP datasets available"
            delay={0}
          />
        )}
        {unhcr && (
          <StatCard
            icon="🏠"
            label="Refugees in Lebanon"
            value={unhcr.totalRefugees}
            sub={`Data year: ${unhcr.year}`}
            delay={0.1}
          />
        )}
        <StatCard
          icon="📰"
          label="Recent Reports"
          value={reports.length}
          sub="From ReliefWeb"
          delay={0.2}
        />
        {unhcr && (
          <StatCard
            icon="🌍"
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
            <span className="crisis-block-icon">🏠</span>
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
            <span className="crisis-block-icon">📰</span>
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
            <span className="crisis-block-icon">📊</span>
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
