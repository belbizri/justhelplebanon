import { useState } from 'react';
import { Link } from 'react-router-dom';

const SOCIAL_FEEDS = [
  {
    platform: 'Instagram',
    icon: '◎',
    color: '#E4405F',
    accounts: [
      { handle: '@lebaneseredcross', name: 'Lebanese Red Cross', url: 'https://www.instagram.com/lebaneseredcross/' },
      { handle: '@lebanon', name: 'Lebanon (Official)', url: 'https://www.instagram.com/lebanon/' },
      { handle: '@beirut.com_', name: 'Beirut.com', url: 'https://www.instagram.com/beirut.com_/' },
      { handle: '@livelebanon', name: 'Live Lebanon (UNDP)', url: 'https://www.instagram.com/livelebanon/' },
      { handle: '@the961', name: 'The 961', url: 'https://www.instagram.com/the961/' },
      { handle: '@libnanews', name: 'Libna News', url: 'https://www.instagram.com/libnanews/' },
      { handle: '@waboradlebanon', name: 'Wa Borad Lebanon', url: 'https://www.instagram.com/waboradlebanon/' },
      { handle: '@lbpresidency', name: 'Lebanese Presidency', url: 'https://www.instagram.com/lbpresidency/' },
      { handle: '@embassyoflebanon_ottawa', name: 'Embassy of Lebanon — Ottawa', url: 'https://www.instagram.com/embassyoflebanon_ottawa/' },
    ],
  },
  {
    platform: 'X (Twitter)',
    icon: '𝕏',
    color: '#fff',
    accounts: [
      { handle: '@RedCrossLebanon', name: 'Lebanese Red Cross', url: 'https://x.com/RedCrossLebanon' },
      { handle: '@ICRC', name: 'ICRC', url: 'https://x.com/ICRC' },
      { handle: '@ICRC_lb', name: 'ICRC Lebanon', url: 'https://x.com/ICRC_lb' },
      { handle: '@UNHCRLebanon', name: 'UNHCR Lebanon', url: 'https://x.com/UNHCRLebanon' },
    ],
  },
  {
    platform: 'Facebook',
    icon: 'f',
    color: '#1877F2',
    accounts: [
      { handle: 'Lebanese Red Cross', name: 'Lebanese Red Cross Official', url: 'https://www.facebook.com/LebaneseRedCross' },
      { handle: 'ICRC', name: 'ICRC', url: 'https://www.facebook.com/icrc' },
    ],
  },
  {
    platform: 'YouTube',
    icon: '▶',
    color: '#FF0000',
    accounts: [
      { handle: 'Lebanese Red Cross', name: 'Lebanese Red Cross', url: 'https://www.youtube.com/@LebaneseRedCross' },
      { handle: 'ICRC', name: 'ICRC', url: 'https://www.youtube.com/@icrc' },
    ],
  },
  {
    platform: 'LinkedIn',
    icon: 'in',
    color: '#0A66C2',
    accounts: [
      { handle: 'Lebanese Red Cross', name: 'Lebanese Red Cross', url: 'https://www.linkedin.com/company/lebanese-red-cross/' },
      { handle: 'ICRC', name: 'ICRC', url: 'https://www.linkedin.com/company/icrc/' },
    ],
  },
];

const HASHTAGS = [
  '#StandWithLebanon', '#JustHelpLebanon', '#LebaneseRedCross',
  '#Lebanon', '#HelpLebanon', '#DonateForLebanon', '#Beirut',
  '#HumanitarianAid', '#RedCross', '#لبنان',
];

export default function SocialPage() {
  const [activePlatform, setActivePlatform] = useState(null);

  return (
    <div className="page-root">
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/live" className="nav-link">Live Updates</Link>
          <Link to="/news" className="nav-link">News</Link>
          <Link to="/social" className="nav-link active">Social</Link>
        </div>
      </nav>

      <header className="social-hero">
        <div className="social-hero-glow" />
        <h1 className="social-hero-title">Social Hub</h1>
        <p className="social-hero-subtitle">Follow, share, and amplify the cause across every platform</p>
      </header>

      {/* Platform cards */}
      <main className="social-platforms">
        {SOCIAL_FEEDS.map((platform) => (
          <div
            key={platform.platform}
            className={`social-platform-card ${activePlatform === platform.platform ? 'expanded' : ''}`}
            onClick={() => setActivePlatform(activePlatform === platform.platform ? null : platform.platform)}
          >
            <div className="platform-header">
              <span className="platform-icon" style={{ color: platform.color, background: `${platform.color}18`, borderColor: `${platform.color}30` }}>{platform.icon}</span>
              <span className="platform-name">{platform.platform}</span>
              <span className="platform-count">{platform.accounts.length} accounts</span>
              <span className="platform-toggle">{activePlatform === platform.platform ? '−' : '+'}</span>
            </div>
            {activePlatform === platform.platform && (
              <div className="platform-accounts">
                {platform.accounts.map((acc) => (
                  <a
                    key={acc.url}
                    href={acc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="account-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="account-name">{acc.name}</span>
                    <span className="account-handle">{acc.handle}</span>
                    <span className="account-arrow">→</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </main>

      {/* Hashtags */}
      <section className="hashtag-section">
        <h3 className="sources-title">Use These Hashtags</h3>
        <p className="hashtag-sub">Copy and use when sharing on social media</p>
        <div className="hashtag-cloud">
          {HASHTAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className="hashtag-chip"
              onClick={() => navigator.clipboard?.writeText(tag)}
              title="Click to copy"
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* Quick share */}
      <section className="quick-share-section">
        <h3 className="sources-title">Quick Share</h3>
        <p className="hashtag-sub">Share this initiative with one click</p>
        <div className="quick-share-buttons">
          <a href="https://wa.me/?text=Support%20the%20Lebanese%20Red%20Cross%20%E2%80%94%20https%3A%2F%2Fjusthelplebanon.com" target="_blank" rel="noopener noreferrer" className="share-btn whatsapp">WhatsApp</a>
          <a href="https://x.com/intent/tweet?text=Stand%20up%20for%20Lebanon%20%F0%9F%87%B1%F0%9F%87%A7%20Donate%20to%20the%20Lebanese%20Red%20Cross&url=https%3A%2F%2Fjusthelplebanon.com" target="_blank" rel="noopener noreferrer" className="share-btn x-btn">𝕏</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fjusthelplebanon.com" target="_blank" rel="noopener noreferrer" className="share-btn facebook">Facebook</a>
          <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fjusthelplebanon.com" target="_blank" rel="noopener noreferrer" className="share-btn linkedin">LinkedIn</a>
        </div>
      </section>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Just Help Lebanon. All donations go to the Lebanese Red Cross.</p>
      </footer>
    </div>
  );
}
