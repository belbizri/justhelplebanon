import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const DONATION_BASE_URL = 'https://give.redcross.ca/page/LHNA';
const DONATION_OPTIONS = [20, 50, 100];

const IMPACT_DATA = [
  { amount: 20, icon: '🩺', desc: 'Emergency medical kit' },
  { amount: 50, icon: '🏠', desc: 'Shelter supplies for a family' },
  { amount: 100, icon: '🍞', desc: 'Food for a family for 1 month' },
];

const TRANSLATIONS = {
  en: {
    eyebrow: 'Lebanon Humanitarian Appeal • Ottawa • MTL',
    heading: 'لبيك يا لبنان',
    subline: 'For Dignity • For Families • For Lebanon',
    lead: 'Your home country is calling.',
    lead2: 'Stand up for Lebanon and give what you can to help your people now.',
    donateBtn: (a) => `Donate $${a} to the Lebanese Red Cross`,
    donateOpt: (v) => `Donate $${v}`,
    note: 'You are redirected to the official secure donation page.',
    impactTitle: 'Your Impact',
    impactSub: 'See how your donation helps',
    testimonialTitle: 'From the Ground',
    whoTitle: 'Who We Are',
    whoParagraphs: [
      'So yes, I\'m the guy on the right. Not the one on the left &mdash; mostly because, unfortunately, he still doesn\'t know how to code in Node.js.',
      'At some point I got bored, and boredom can be a dangerous thing.',
      'Instead of doing absolutely nothing about the problems around us, I decided to build something &mdash; something that stands up for my home country, a country I haven\'t spoken to in over twenty years, for reasons I still don\'t fully understand.',
      'As a friend of mine, who happens to be the finance minister of a small country where everyone has an opinion, half the population is building startups, nobody waits for permission to act, and the driving skills are&hellip; let\'s say, very similar to my people\'s, once said, <strong>&ldquo;If you do nothing, you get nothing.&rdquo;</strong> So I decided to stop doing nothing and stand up for my home country.',
      'That\'s how this initiative started.',
    ],
    shareTitle: 'Spread the Word',
    shareText: 'Share this page and help us reach more people.',
    urgency: 'Every minute counts — families in Lebanon need your help now',
    socialProof: (c) => `Join ${c}+ Canadians who've donated`,
    goal: 'Goal',
  },
  ar: {
    eyebrow: 'نداء لبنان الإنساني • أوتاوا • مونتريال',
    heading: 'لبيك يا لبنان',
    subline: 'للكرامة • للعائلات • للبنان',
    lead: '.وطنك ينادي',
    lead2: '.قف مع لبنان وقدّم ما تستطيع لمساعدة شعبك الآن',
    donateBtn: (a) => `تبرّع $${a} للصليب الأحمر اللبناني`,
    donateOpt: (v) => `$${v} تبرّع`,
    note: '.سيتم توجيهك إلى صفحة التبرع الرسمية الآمنة',
    impactTitle: 'أثر تبرّعك',
    impactSub: 'شاهد كيف يساعد تبرّعك',
    testimonialTitle: 'من الميدان',
    whoTitle: 'من نحن',
    whoParagraphs: [
      'نعم، أنا الشخص على اليمين. ليس الذي على اليسار &mdash; غالباً لأنه، للأسف، لا يزال لا يعرف كيف يبرمج بـ Node.js.',
      'في مرحلة ما شعرت بالملل، والملل قد يكون شيئاً خطيراً.',
      'بدلاً من عدم فعل أي شيء حيال المشاكل من حولنا، قررت أن أبني شيئاً &mdash; شيئاً يقف لأجل وطني، بلد لم أتحدث إليه منذ أكثر من عشرين عاماً، لأسباب لا أفهمها حتى الآن.',
      'كما قال صديق لي، وهو وزير مالية بلد صغير حيث لكل شخص رأي، ونصف السكان يبنون شركات ناشئة، ولا أحد ينتظر إذناً للتصرف، ومهارات القيادة&hellip; لنقل إنها مشابهة جداً لمهارات شعبي، قال ذات مرة، <strong>&ldquo;إذا لم تفعل شيئاً، لن تحصل على شيء.&rdquo;</strong> لذلك قررت التوقف عن عدم فعل أي شيء والوقوف لأجل وطني.',
      'هكذا بدأت هذه المبادرة.',
    ],
    shareTitle: 'انشر الكلمة',
    shareText: '.شارك هذه الصفحة وساعدنا في الوصول لأكبر عدد',
    urgency: 'كل دقيقة مهمة — عائلات في لبنان بحاجة لمساعدتك الآن',
    socialProof: (c) => `انضم إلى ${c}+ كندي تبرعوا`,
    goal: 'الهدف',
  },
  fr: {
    eyebrow: 'Appel humanitaire pour le Liban • Ottawa • MTL',
    heading: 'لبيك يا لبنان',
    subline: 'Pour la dignité • Pour les familles • Pour le Liban',
    lead: 'Votre pays d\'origine vous appelle.',
    lead2: 'Soutenez le Liban et donnez ce que vous pouvez pour aider votre peuple.',
    donateBtn: (a) => `Donner ${a}$ à la Croix-Rouge libanaise`,
    donateOpt: (v) => `Donner ${v}$`,
    note: 'Vous serez redirigé vers la page de don officielle sécurisée.',
    impactTitle: 'Votre Impact',
    impactSub: 'Voyez comment votre don aide',
    testimonialTitle: 'Du Terrain',
    whoTitle: 'Qui sommes-nous',
    whoParagraphs: [
      'Alors oui, c\'est moi à droite. Pas celui à gauche &mdash; principalement parce que, malheureusement, il ne sait toujours pas coder en Node.js.',
      'À un moment donné, je m\'ennuyais, et l\'ennui peut être dangereux.',
      'Au lieu de ne rien faire face aux problèmes autour de nous, j\'ai décidé de construire quelque chose &mdash; quelque chose qui défend mon pays d\'origine, un pays à qui je n\'ai pas parlé depuis plus de vingt ans, pour des raisons que je ne comprends toujours pas.',
      'Comme l\'a dit un ami à moi, qui se trouve être le ministre des finances d\'un petit pays où tout le monde a un avis, la moitié de la population lance des startups, personne n\'attend la permission pour agir, et les compétences de conduite sont&hellip; disons, très similaires à celles de mon peuple, <strong>&laquo; Si tu ne fais rien, tu n\'obtiens rien. &raquo;</strong> Alors j\'ai décidé d\'arrêter de ne rien faire et de défendre mon pays.',
      'C\'est comme ça que cette initiative a commencé.',
    ],
    shareTitle: 'Partagez',
    shareText: 'Partagez cette page et aidez-nous à atteindre plus de gens.',
    urgency: 'Chaque minute compte — des familles au Liban ont besoin de votre aide',
    socialProof: (c) => `Rejoignez ${c}+ Canadiens qui ont donné`,
    goal: 'Objectif',
  },
};

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
        <iframe
          src="https://www.youtube.com/embed/8DHgGOHlYV0"
          title="Lebanon humanitarian aid"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
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
          <div key={item.amount} className="impact-card">
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

/* ── Gallery (#10 — scroll-triggered) ── */
function GallerySection() {
  const [ref, visible] = useReveal();
  const images = [
    { src: '/images/gallery-1.jpg', alt: 'Relief work in Lebanon' },
    { src: '/images/gallery-2.jpg', alt: 'Medical aid delivery' },
    { src: '/images/gallery-3.jpg', alt: 'Community support' },
    { src: '/images/gallery-4.jpg', alt: 'Volunteer work' },
  ];

  return (
    <section ref={ref} className={`gallery-section reveal-section ${visible ? 'revealed' : ''}`}>
      <div className="gallery-grid">
        {images.map((img, i) => (
          <div key={i} className="gallery-item">
            <img src={img.src} alt={img.alt} className="gallery-img" onError={(e) => { e.target.parentElement.style.display = 'none'; }} />
          </div>
        ))}
      </div>
    </section>
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

      {/* Language Toggle */}
      <LangToggle lang={lang} setLang={setLang} />

      {/* Widget with progress bar (#7) */}
      <DonationWidget lang={lang} />

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
