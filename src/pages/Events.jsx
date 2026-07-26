import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import './Events.css';

gsap.registerPlugin(ScrollTrigger);

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/* Fallbacks so the page works even when the API/DB is not running */
const DEFAULT_VIDEOS = [
  { youtube_id: 'PYfYpvK_t9k', title: 'Coonoor Club — Feature' },
  { youtube_id: '9Do8uvrFKro', title: 'Life at the Club' },
  { youtube_id: 'e_5GVXOjhMs', title: 'Nilgiri Heritage' },
  { youtube_id: 'X0_M0DeroZA', title: 'Club Moments' },
  { youtube_id: 'Mk5kLPdU5Ys', title: 'The Blue Mountains' },
  { youtube_id: 'rjj7pKsvsHI', title: 'Around Coonoor' },
  { youtube_id: 'w-EsL-d6HaU', title: 'Nilgiris Diaries' },
];
const DEFAULT_EVENTS = [
  { title: 'Nilgiri High Tea on the Lawn', description: 'A grand afternoon of Nilgiri teas, savouries and cakes on the sunlit front lawn.', event_date: '2026-08-16', image_url: '/images/club-frontlawn.jpg' },
  { title: 'Annual Tennis Tournament', description: "The club's founding sport takes centre stage with members' singles and doubles.", event_date: '2026-09-06', image_url: '/images/club-tenniscourt.jpg' },
  { title: 'Sunday Night Live Music', description: 'An evening of live music and dining in the Grand Banquet Hall.', event_date: '2026-08-30', image_url: '/images/club-hall3.jpg' },
  { title: 'Christmas Dinner & Carols', description: "The club's cherished festive dinner, carols and celebrations.", event_date: '2026-12-24', image_url: '/images/club-hall1.jpg' },
];

const fmtDate = (d) => {
  if (!d) return 'Upcoming';
  const dt = new Date(d);
  return isNaN(dt) ? d : dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

/* One video — single click plays it embedded, double click opens YouTube */
function VideoCard({ v }) {
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);
  const url = v.youtube_url || `https://www.youtube.com/watch?v=${v.youtube_id}`;

  const handleClick = () => {
    if (playing) return;
    if (timer.current) return; // wait for possible double-click
    timer.current = setTimeout(() => { setPlaying(true); timer.current = null; }, 220);
  };
  const handleDouble = () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="video-card" onClick={handleClick} onDoubleClick={handleDouble}
      title="Click to play · double-click to open on YouTube">
      {playing ? (
        <iframe
          className="video-frame"
          src={`https://www.youtube.com/embed/${v.youtube_id}?autoplay=1&rel=0`}
          title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen
        />
      ) : (
        <div className="video-thumb">
          <img src={`https://img.youtube.com/vi/${v.youtube_id}/hqdefault.jpg`} alt={v.title} loading="lazy" />
          <div className="video-play" aria-hidden>▶</div>
        </div>
      )}
      <div className="video-title">{v.title}</div>
    </div>
  );
}

const Events = () => {
  const containerRef = useRef(null);
  const [upcoming, setUpcoming] = useState(DEFAULT_EVENTS);
  const [videos, setVideos] = useState(DEFAULT_VIDEOS);

  useEffect(() => {
    // Pull admin-managed events + videos; keep fallbacks if the API is down.
    (async () => {
      try {
        const [e, v] = await Promise.all([
          fetch(`${API}/public/events`).then(r => r.ok ? r.json() : null),
          fetch(`${API}/public/videos`).then(r => r.ok ? r.json() : null),
        ]);
        if (Array.isArray(e) && e.length) setUpcoming(e);
        if (Array.isArray(v) && v.length) setVideos(v);
      } catch { /* offline — use fallbacks */ }
    })();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.events-hero-content', { y: 50, opacity: 0, duration: 1, ease: 'power3.out' });
      gsap.utils.toArray('.event-card, .upcoming-card, .video-card').forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 88%' },
          y: 30, opacity: 0, duration: 0.6, delay: (i % 3) * 0.08, ease: 'power2.out',
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [upcoming, videos]);

  const events = [
    { date: 'Every Saturday', title: 'Saturday Social & Dinner Dance', timeLoc: '7:30 PM, Assembly Hall', desc: 'Live music, dinner, and dancing' },
    { date: 'Every Sunday', title: 'Sunday Family Brunch', timeLoc: '11 AM, Dining Hall', desc: 'Lavish brunch spread for families' },
    { date: 'Every Wednesday', title: 'Bridge & Cards Evening', timeLoc: '6 PM, Card Room', desc: 'Weekly bridge tournament' },
    { date: 'Every Thursday', title: 'Billiards Night', timeLoc: '7 PM, Billiards Room', desc: 'Friendly snooker & billiards' },
    { date: 'Every Friday', title: 'Quiz Night', timeLoc: '7:30 PM, Lounge', desc: 'Members’ general knowledge quiz' },
    { date: 'First Sat of Month', title: 'Nilgiri Heritage Walk', timeLoc: '7 AM, Club Entrance', desc: 'Guided heritage walk' },
  ];

  return (
    <div className="events-page" ref={containerRef}>
      <section className="events-hero">
        <div className="events-hero-content">
          <motion.span className="events-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>CLUB LIFE</motion.span>
          <h1 className="events-title">Events &amp; Social</h1>
          <p className="events-subtitle">The heartbeat of community life at the club</p>
        </div>
      </section>

      {/* Upcoming events — managed by the admin */}
      <section className="events-section">
        <h2 className="events-section-title">Upcoming Events</h2>
        <div className="upcoming-grid">
          {upcoming.map((ev, i) => (
            <article className="upcoming-card" key={ev.id || i}>
              {ev.image_url && <div className="upcoming-img" style={{ backgroundImage: `url(${ev.image_url})` }} />}
              <div className="upcoming-body">
                <span className="upcoming-date">{fmtDate(ev.event_date)}</span>
                <h3>{ev.title}</h3>
                {ev.description && <p>{ev.description}</p>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* YouTube videos */}
      <section className="events-section bg-cream" style={{ backgroundColor: 'var(--color-cream)' }}>
        <h2 className="events-section-title">Videos</h2>
        <p className="events-section-sub">Click a video to play it here — double-click to open it on YouTube.</p>
        <div className="video-grid">
          {videos.map((v, i) => <VideoCard key={v.id || v.youtube_id || i} v={v} />)}
        </div>
      </section>

      {/* Recurring calendar */}
      <section className="events-section">
        <h2 className="events-section-title">The Weekly Calendar</h2>
        <div className="events-grid">
          {events.map((ev, idx) => (
            <div className="event-card" key={idx}>
              <div className="event-date">{ev.date}</div>
              <h3 className="event-card-title">{ev.title}</h3>
              <div className="event-time-loc">{ev.timeLoc}</div>
              <p className="event-desc">{ev.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Moments gallery */}
      <section className="events-section bg-cream" style={{ backgroundColor: 'var(--color-cream)' }}>
        <h2 className="events-section-title">Moments at the Club</h2>
        <div className="gallery-grid">
          <div className="gallery-item"><img src="/images/club-hall3.jpg" alt="Banquet hall" /></div>
          <div className="gallery-item"><img src="/images/club-frontlawn.jpg" alt="Front lawn" /></div>
          <div className="gallery-item"><img src="/images/club-bar.jpg" alt="The Raj Bar" /></div>
          <div className="gallery-item"><img src="/images/club-tenniscourt2.jpg" alt="Tennis" /></div>
        </div>
      </section>
    </div>
  );
};

export default Events;
