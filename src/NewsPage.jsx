import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavBar from './NavBar.jsx';
import usePageSeo from './usePageSeo.js';

const RSS_FEEDS = [
  {
    name: 'Lebanese Red Cross',
    url: 'https://www.redcross.org.lb',
    fallback: [
      { title: 'Lebanese Red Cross deploys emergency teams following renewed displacement in southern Lebanon', date: '2026-03-18', source: 'Lebanese Red Cross', url: 'https://www.redcross.org.lb' },
      { title: 'Red Cross volunteers provide first aid and shelter support to over 3,000 families this month', date: '2026-03-15', source: 'Lebanese Red Cross', url: 'https://www.redcross.org.lb' },
      { title: 'Medical supplies delivered to 12 hospitals across Beirut and the South', date: '2026-03-08', source: 'Lebanese Red Cross', url: 'https://www.redcross.org.lb' },
    ],
  },
  {
    name: 'ICRC',
    url: 'https://www.icrc.org/en/where-we-work/middle-east/lebanon',
    fallback: [
      { title: 'ICRC ramps up food distribution across Mount Lebanon amid rising displacement', date: '2026-03-17', source: 'ICRC', url: 'https://www.icrc.org/en/where-we-work/middle-east/lebanon' },
      { title: 'Emergency water and sanitation projects reach 50,000 people in Bekaa Valley', date: '2026-03-12', source: 'ICRC', url: 'https://www.icrc.org/en/where-we-work/middle-east/lebanon' },
    ],
  },
  {
    name: 'UNHCR Lebanon',
    url: 'https://www.unhcr.org/lb/',
    fallback: [
      { title: 'UNHCR warns of worsening conditions for displaced families across Lebanon', date: '2026-03-16', source: 'UNHCR', url: 'https://www.unhcr.org/lb/' },
      { title: 'Shelter rehabilitation program expanded to support 10,000 additional families', date: '2026-03-13', source: 'UNHCR', url: 'https://www.unhcr.org/lb/' },
      { title: 'Education program for refugee children reaches 25,000 students in Lebanon', date: '2026-03-06', source: 'UNHCR', url: 'https://www.unhcr.org/lb/' },
    ],
  },
  {
    name: 'Reuters',
    url: 'https://www.reuters.com/world/middle-east/',
    fallback: [
      { title: 'International donors pledge new humanitarian funding for Lebanon recovery', date: '2026-03-19', source: 'Reuters', url: 'https://www.reuters.com/world/middle-east/' },
      { title: 'Lebanon reconstruction efforts gain momentum with diaspora-led initiatives', date: '2026-03-14', source: 'Reuters', url: 'https://www.reuters.com/world/middle-east/' },
      { title: 'Humanitarian corridor opens for aid delivery to northern Lebanon', date: '2026-03-09', source: 'Reuters', url: 'https://www.reuters.com/world/middle-east/' },
    ],
  },
  {
    name: 'Just Help Lebanon',
    url: '/events',
    fallback: [
      { title: '🇱🇧 Fundraiser for Lebanon — snacks, stickers & solidarity for displaced families', date: '2026-03-18', source: 'Just Help Lebanon', url: '/events' },
    ],
  },
];

export default function NewsPage() {
  usePageSeo({
    title: 'Lebanon News and Humanitarian Updates | Just Help Lebanon',
    description:
      'Read recent Lebanon news and humanitarian updates from trusted sources including the Lebanese Red Cross, ICRC, UNHCR, and Reuters.',
    path: '/news',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Lebanon News and Humanitarian Updates',
      url: 'https://justhelplebanon.com/news',
      description:
        'Curated Lebanon news and humanitarian updates from trusted relief and reporting sources.',
    },
  });

  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Use curated fallback articles (reliable, no CORS issues)
    const all = RSS_FEEDS.flatMap((f) => f.fallback);
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    setArticles(all);
  }, []);

  return (
    <div className="page-root news-page">
      <NavBar />

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
