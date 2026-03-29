import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// ── Disclaimer Modal ──
function DisclaimerModal({ onAcknowledge }) {
  return (
    <div className="disclaimer-backdrop">
      <div className="disclaimer-modal">
        <div className="disclaimer-icon"></div>
        <h2 className="disclaimer-title">Disclaimer and User Acknowledgment</h2>
        <div className="disclaimer-body">
          <p>By clicking <b>“OK”</b>, accessing, browsing, or otherwise using this website, you acknowledge and agree to the following:</p>
          <ul>
            <li>This website is a personal and independent initiative, conceived, developed, and maintained entirely outside the scope of any employment, contractual obligation, or professional engagement. It operates independently and is not affiliated with, endorsed by, sponsored by, or otherwise associated with any employer, company, organization, institution, or governmental or public authority, whether domestic or international.</li>
            <li>All content, views, opinions, and activities presented on this website are solely those of the creator and are expressed in an individual capacity. They do not reflect, represent, or imply the views, positions, policies, or interests of any current or former employer, organization, governmental body, or any other entity.</li>
            <li>No resources, systems, equipment, funding, proprietary information, confidential materials, trade secrets, or intellectual property belonging to any employer, organization, or governmental authority, whether internal or external, have been used, accessed, or relied upon in the creation, development, or operation of this website.</li>
            <li>All work associated with this website has been performed independently, on personal time, and using exclusively personal resources and infrastructure.</li>
            <li>The creator retains full and exclusive ownership of this website and its content, subject to applicable laws, and assumes sole responsibility for all materials published herein.</li>
            <li>This website is provided for informational and general purposes only and does not constitute professional, legal, financial, or other advice. No reliance should be placed on the content without independent verification.</li>
            <li>Your continued use of this website constitutes your acknowledgment and acceptance of the terms set forth above.</li>
          </ul>
        </div>
        <button className="disclaimer-ok-btn" onClick={onAcknowledge}>OK</button>
      </div>
    </div>
  );
}
export default function App() {
  const [amount, setAmount] = useState(20);
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  // Disclaimer state
  const [showDisclaimer, setShowDisclaimer] = useState(() => {
    try {
      return !localStorage.getItem('disclaimer_acknowledged');
    } catch {
      return true;
    }
  });

  const handleAcknowledge = () => {
    try {
      localStorage.setItem('disclaimer_acknowledged', '1');
    } catch {}
    setShowDisclaimer(false);
  };

  const donateHref = useMemo(() => `${DONATION_BASE_URL}?amount=${amount}`, [amount]);

  return (
    <div className={`app-root ${isRtl ? 'rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {showDisclaimer && <DisclaimerModal onAcknowledge={handleAcknowledge} />}

      {/* #1 Urgency Banner */}
      <UrgencyBanner text={t.urgency} />

      {/* Navigation */}
      <NavBar extra={<LangToggle lang={lang} setLang={setLang} />} />

      {/* Widget with progress bar (#7) */}
      {/* <DonationWidget lang={lang} /> */}

      {/* Hero */}
      <section className="hero" aria-label="Donate to support the Lebanese Red Cross">
        <div className="cross-glow" />
        <div className="grain" />

        <div className="content">
          <div className="eyebrow">{t.eyebrow}</div>
          <h1 className="hero-ar" lang="ar">{t.heading}</h1>
          <p className="subline">{t.subline}</p>

          {/* #2 Social Proof */}
          <SocialProof text={t.socialProof('3,490')} />

          <p className="lead">
            {t.lead}
            <br />
            {t.lead2}
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
                  {t.donateOpt(value)}
                </button>
              ))}
            </div>

            <a className="donate-btn" href={donateHref} target="_blank" rel="noopener noreferrer">
              {t.donateBtn(amount)}
            </a>
          </div>

          <div className="bottom-note">{t.note}</div>
        </div>

        <div className="bottom-fade" />
      </section>

      {/* #3 Impact Breakdown */}
      <ImpactSection title={t.impactTitle} sub={t.impactSub} />

      {/* Crisis Dashboard — live data */}
      <CrisisDashboard />
      {/* #6 Testimonial */}
      <TestimonialSection title={t.testimonialTitle} />

      {/* #8 Who We Are */}
      <WhoWeAreSection title={t.whoTitle} paragraphs={t.whoParagraphs} />
      {/* Video */}
      <VideoSection />
      {/* Gallery (scroll-triggered #10) */}
      <GallerySection />

      {/* #4 Share Buttons */}
      <ShareSection title={t.shareTitle} sub={t.shareText} />

      {/* Footer */}
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Just Help Lebanon. All donations go to the Lebanese Red Cross.</p>
      </footer>
    </div>
  );
}
  


/* ── Scroll-triggered fade-in ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
}

/* ── Widget ── */
function DonationWidget({ lang }) {
  const t = TRANSLATIONS[lang];
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

  const pct = Math.min((stats.raised / stats.goal) * 100, 100);

  return (
    <div className="donation-widget">
      <div className="widget-pulse" />
      <div className="widget-label">Community Impact</div>
      <div className="widget-stat">
        <div className="widget-amount">${stats.raised.toLocaleString()}</div>
        <div className="widget-sub">raised so far</div>
      </div>
      <div className="widget-progress-wrap">
        <div className="widget-progress-bar">
          <div className="widget-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="widget-goal-label">{t.goal}: ${stats.goal.toLocaleString()}</div>
      </div>
      <div className="widget-divider" />
      <div className="widget-stat">
        <div className="widget-count">{stats.count.toLocaleString()}</div>
        <div className="widget-sub">donations made</div>
      </div>
      <div className="widget-live">● Live</div>
    </div>
  );
}

/* ── Urgency Banner (#1) ── */
function UrgencyBanner({ text }) {
  return (
    <div className="urgency-banner">
      <span className="urgency-dot" />
      <span>{text}</span>
    </div>
  );
}

/* ── Social Proof (#2) ── */
function SocialProof({ text }) {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} className={`social-proof ${visible ? 'revealed' : ''}`}>
      <span className="social-proof-icon">❤️</span>
      <span>{text}</span>
    </div>
  );
}

/* ── Video Section ── */
function VideoSection() {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className={`video-section reveal-section ${visible ? 'revealed' : ''}`}>
      <div className="video-container">
        {visible && (
          <iframe
            src="https://www.youtube.com/embed/8DHgGOHlYV0?autoplay=1&mute=1"
            title="Lebanon humanitarian aid"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </section>
  );
}

/* ── Impact Breakdown (#3) ── */
function ImpactSection({ title, sub }) {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className={`impact-section reveal-section ${visible ? 'revealed' : ''}`}>
      <h2 className="section-title">{title}</h2>
      <p className="section-sub">{sub}</p>
      <div className="impact-cards">
        {IMPACT_DATA.map((item) => (
          <div
            key={item.amount}
            className={`impact-card ${item.image ? 'has-bg' : ''}`}
            style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
          >
            <div className="impact-icon">{item.icon}</div>
            <div className="impact-amount">${item.amount}</div>
            <div className="impact-desc">{item.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Share Buttons (#4) ── */
function ShareSection({ title, sub }) {
  const [ref, visible] = useReveal();
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const msg = 'Support the Lebanese Red Cross — every dollar helps families in Lebanon.';

  const share = useCallback((platform) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedMsg = encodeURIComponent(msg);
    const urls = {
      whatsapp: `https://wa.me/?text=${encodedMsg}%20${encodedUrl}`,
      x: `https://x.com/intent/tweet?text=${encodedMsg}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
  }, [url]);

  return (
    <section ref={ref} className={`share-section reveal-section ${visible ? 'revealed' : ''}`}>
      <h2 className="section-title">{title}</h2>
      <p className="section-sub">{sub}</p>
      <div className="share-buttons">
        <button type="button" className="share-btn whatsapp" onClick={() => share('whatsapp')}>WhatsApp</button>
        <button type="button" className="share-btn x-btn" onClick={() => share('x')}>𝕏</button>
        <button type="button" className="share-btn facebook" onClick={() => share('facebook')}>Facebook</button>
        <button type="button" className="share-btn linkedin" onClick={() => share('linkedin')}>LinkedIn</button>
      </div>
    </section>
  );
}

/* ── Testimonial (#6) ── */
function TestimonialSection({ title }) {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className={`testimonial-section reveal-section ${visible ? 'revealed' : ''}`}>
      <h2 className="section-title">{title}</h2>
      <blockquote className="testimonial-quote">
        <p>"The support from abroad gives us hope. Every donation, no matter how small, saves lives and restores dignity to families who have lost everything."</p>
        <footer className="testimonial-author">— Lebanese Red Cross Volunteer, Beirut</footer>
      </blockquote>
    </section>
  );
}



/* ── Who We Are (#8) ── */
function WhoWeAreSection({ title, paragraphs }) {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className={`who-section reveal-section ${visible ? 'revealed' : ''}`}>
      <h2 className="section-title">{title}</h2>
      <div className="who-content">
        <div className="who-image-wrap">
          <img
            src="https://i.imgur.com/gL95eWA.jpeg"
            alt="The founders"
            className="who-img"
          />
          <span className="who-img-caption">Yes, that's me on the right not left</span>
        </div>
        <div className="who-text-wrap">
          {paragraphs.map((p, i) => (
            <p key={i} className="who-text" dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Gallery (#10 — dynamic from /images/galleries/) ── */
const galleryModules = import.meta.glob('/public/images/galleries/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
const GALLERY_IMAGES = Object.entries(galleryModules).map(([path, src]) => {
  const name = path.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
  return { src, alt: name };
});

function GallerySection() {
  const [ref, visible] = useReveal();
  const [lightbox, setLightbox] = useState(null);

  const navigate = useCallback((dir) => {
    setLightbox((cur) => {
      if (cur === null) return null;
      const next = cur + dir;
      if (next < 0) return GALLERY_IMAGES.length - 1;
      if (next >= GALLERY_IMAGES.length) return 0;
      return next;
    });
  }, []);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') navigate(1);
      if (e.key === 'ArrowLeft') navigate(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, navigate]);

  if (GALLERY_IMAGES.length === 0) return null;

  return (
    <>
      <section ref={ref} className={`gallery-section reveal-section ${visible ? 'revealed' : ''}`}>
        <h2 className="section-title">Gallery</h2>
        <p className="section-sub">Moments from the ground.</p>
        <div className="gallery-masonry">
          {GALLERY_IMAGES.map((img, i) => (
            <div
              key={i}
              className={`gallery-brick ${visible ? 'pop-in' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => setLightbox(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setLightbox(i)}
            >
              <img src={img.src} alt={img.alt} className="gallery-brick-img" loading="lazy" />
              <div className="gallery-overlay">
                <span className="gallery-zoom-icon">⤢</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {lightbox !== null && (
        <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
          <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">✕</button>
          <button type="button" className="lightbox-arrow lightbox-prev" onClick={(e) => { e.stopPropagation(); navigate(-1); }} aria-label="Previous">‹</button>
          <img
            src={GALLERY_IMAGES[lightbox].src}
            alt={GALLERY_IMAGES[lightbox].alt}
            className="lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
          <button type="button" className="lightbox-arrow lightbox-next" onClick={(e) => { e.stopPropagation(); navigate(1); }} aria-label="Next">›</button>
          <div className="lightbox-counter">{lightbox + 1} / {GALLERY_IMAGES.length}</div>
        </div>
      )}
    </>
  );
}

/* ── Language Toggle (#9) ── */
function LangToggle({ lang, setLang }) {
  return (
    <div className="lang-toggle">
      {['en', 'ar', 'fr'].map((l) => (
        <button
          key={l}
          type="button"
          className={`lang-btn ${lang === l ? 'active' : ''}`}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ── Main App ── */
export default function App() {
  const [amount, setAmount] = useState(20);
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const donateHref = useMemo(() => `${DONATION_BASE_URL}?amount=${amount}`, [amount]);

  return (
    <div className={`app-root ${isRtl ? 'rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* #1 Urgency Banner */}
      <UrgencyBanner text={t.urgency} />

      {/* Navigation */}
      <NavBar extra={<LangToggle lang={lang} setLang={setLang} />} />

      {/* Widget with progress bar (#7) */}
      {/* <DonationWidget lang={lang} /> */}

      {/* Hero */}
      <section className="hero" aria-label="Donate to support the Lebanese Red Cross">
        <div className="cross-glow" />
        <div className="grain" />

        <div className="content">
          <div className="eyebrow">{t.eyebrow}</div>
          <h1 className="hero-ar" lang="ar">{t.heading}</h1>
          <p className="subline">{t.subline}</p>

          {/* #2 Social Proof */}
          <SocialProof text={t.socialProof('3,490')} />

          <p className="lead">
            {t.lead}
            <br />
            {t.lead2}
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
                  {t.donateOpt(value)}
                </button>
              ))}
            </div>

            <a className="donate-btn" href={donateHref} target="_blank" rel="noopener noreferrer">
              {t.donateBtn(amount)}
            </a>
          </div>

          <div className="bottom-note">{t.note}</div>
        </div>

        <div className="bottom-fade" />
      </section>

      {/* #3 Impact Breakdown */}
      <ImpactSection title={t.impactTitle} sub={t.impactSub} />

      {/* Crisis Dashboard — live data */}
      <CrisisDashboard />

      {/* #6 Testimonial */}
      <TestimonialSection title={t.testimonialTitle} />

     

      {/* #8 Who We Are */}
      <WhoWeAreSection title={t.whoTitle} paragraphs={t.whoParagraphs} />
 {/* Video */}
      <VideoSection />
      {/* Gallery (scroll-triggered #10) */}
      <GallerySection />

      {/* #4 Share Buttons */}
      <ShareSection title={t.shareTitle} sub={t.shareText} />

      {/* Footer */}
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Just Help Lebanon. All donations go to the Lebanese Red Cross.</p>
      </footer>
    </div>
  );
}
