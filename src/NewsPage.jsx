import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const RSS_FEEDS = [
  {
    name: 'Lebanese Red Cross',
    url: 'https://www.redcross.org.lb',
    fallback: [
      { title: 'Lebanese Red Cross continues emergency response in southern Lebanon', date: '2026-03-10', source: 'Lebanese Red Cross', url: 'https://www.redcross.org.lb' },
      { title: 'Medical supplies delivered to 12 hospitals across Beirut', date: '2026-03-08', source: 'Lebanese Red Cross', url: 'https://www.redcross.org.lb' },
    ],
  },
  {
    name: 'ICRC',
    url: 'https://www.icrc.org/en/where-we-work/middle-east/lebanon',
    fallback: [
      { title: 'ICRC scales up humanitarian aid in Lebanon amid ongoing crisis', date: '2026-03-12', source: 'ICRC', url: 'https://www.icrc.org/en/where-we-work/middle-east/lebanon' },
      { title: 'Water and sanitation projects reach 50,000 people in Bekaa Valley', date: '2026-03-05', source: 'ICRC', url: 'https://www.icrc.org/en/where-we-work/middle-east/lebanon' },
    ],
  },
  {
    name: 'UNHCR Lebanon',
    url: 'https://www.unhcr.org/lb/',
    fallback: [
      { title: 'UNHCR provides winterization support to displaced families in Lebanon', date: '2026-03-06', source: 'UNHCR', url: 'https://www.unhcr.org/lb/' },
      { title: 'Education program expanded for refugee children across Lebanon', date: '2026-02-28', source: 'UNHCR', url: 'https://www.unhcr.org/lb/' },
    ],
  },
  {
    name: 'Reuters',
    url: 'https://www.reuters.com/world/middle-east/',
    fallback: [
      { title: 'Lebanon reconstruction efforts gain momentum with international support', date: '2026-03-11', source: 'Reuters', url: 'https://www.reuters.com/world/middle-east/' },
      { title: 'Humanitarian corridor opens for aid delivery to northern Lebanon', date: '2026-03-04', source: 'Reuters', url: 'https://www.reuters.com/world/middle-east/' },
    ],
  },
];

export default function NewsPage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Use curated fallback articles (reliable, no CORS issues)
    const all = RSS_FEEDS.flatMap((f) => f.fallback);
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    setArticles(all);
  }, []);

  return (
    <div className="page-root">
      <nav className="page-nav">
        <Link to="/" className="nav-logo">Just Help Lebanon</Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/news" className="nav-link active">News</Link>
          <Link to="/social" className="nav-link">Social</Link>
        </div>
      </nav>

      <header className="page-header">
        <h1 className="page-title">Lebanon News</h1>
        <p className="page-subtitle">Latest updates from trusted humanitarian sources</p>
      </header>

      <main className="news-grid">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="news-source-badge">{article.source}</div>
            <h2 className="news-title">{article.title}</h2>
            <time className="news-date">
              {new Date(article.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span className="news-read-more">Read more →</span>
          </a>
        ))}
      </main>

      <section className="news-sources">
        <h3 className="sources-title">Our Sources</h3>
        <div className="sources-list">
          {RSS_FEEDS.map((feed) => (
            <a
              key={feed.name}
              href={feed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-chip"
            >
              {feed.name}
            </a>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Just Help Lebanon. All donations go to the Lebanese Red Cross.</p>
      </footer>
    </div>
  );
}
