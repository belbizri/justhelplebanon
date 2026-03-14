import { useEffect, useMemo, useState } from 'react';

const DONATION_BASE_URL = 'https://give.redcross.ca/page/LHNA';
const DONATION_OPTIONS = [20, 50, 100];

function DonationWidget() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = () =>
      fetch('/api/donation-stats')
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});

    fetchStats();
    const id = setInterval(fetchStats, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!stats) return null;

  return (
    <div className="donation-widget">
      <div className="widget-pulse" />
      <div className="widget-label">Community Impact</div>
      <div className="widget-amount">${stats.raised.toLocaleString()}</div>
      <div className="widget-sub">raised so far</div>
      <div className="widget-divider" />
      <div className="widget-count">{stats.count.toLocaleString()}</div>
      <div className="widget-sub">donations made</div>
      <div className="widget-live">● Live</div>
    </div>
  );
}

export default function App() {
  const [amount, setAmount] = useState(20);

  const donateHref = useMemo(() => `${DONATION_BASE_URL}?amount=${amount}`, [amount]);

  return (
    <section className="hero" aria-label="Donate to support the Lebanese Red Cross">
      <DonationWidget />
      <div className="cross-glow" />
      <div className="grain" />

      <div className="content">
        <div className="eyebrow">Lebanon Humanitarian Appeal • Ottawa• MTL</div>
        <h1 className="hero-ar" lang="ar">لبيك يا لبنان</h1>
        <p className="subline">For Dignity • For Families • For Lebanon</p>
        <p className="lead">
          Your home country is calling.
          <br />
          Stand up for Lebanon and give what you can to help your people now.
        </p>

        <div className="action-wrap">
          <div className="amounts">
            {DONATION_OPTIONS.map((value) => (
              <button
                key={value}
                type="button"
                className={`amount-btn ${amount === value ? 'active' : ''}`}
                onClick={() => setAmount(value)}
              >
                Donate ${value}
              </button>
            ))}
          </div>

          <a className="donate-btn" href={donateHref} target="_blank" rel="noopener noreferrer">
            Donate ${amount} to the Lebanese Red Cross
          </a>
        </div>

        <div className="bottom-note">You are redirected to the official secure donation page.</div>
      </div>

      <div className="bottom-fade" />
    </section>
  );
}
