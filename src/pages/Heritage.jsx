import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import './Heritage.css';

gsap.registerPlugin(ScrollTrigger);

const Heritage = () => {
  const containerRef = useRef(null);
  
  const timelineData = [
    { year: '1885', title: 'The Founding', desc: 'General Richard Hamilton establishes the Coonoor Club. Charles Thomas Campbell Gray provides land for initial tennis courts and a small wooden pavilion near Gray\'s Hotel.' },
    { year: '1894', title: 'Bleak Heath', desc: 'The club acquires the adjacent heritage bungalow \'Bleak Heath\', expanding the grounds and formalizing its identity.' },
    { year: '1897', title: 'A New Home', desc: 'Trustees Lt. Colonel Richard Samuel Roberts and James Stanes secure a long-term lease for the current 5-acre property on Gray\'s Hill. The club officially opens at its permanent site on September 1, 1897.' },
    { year: '1906', title: 'The Billiards Room', desc: 'Completion of the grand Billiards Room, which remains one of the club\'s most cherished spaces to this day.' },
    { year: '1920s', title: 'Golden Era', desc: 'Construction of the Assembly Rooms, indoor squash court, roller-skating rink \'The Rink\', card rooms, and additional tennis courts.' },
    { year: '1947', title: 'A New Chapter', desc: 'Post-independence, the club transitions from a British colonial institution to an inclusive Indian heritage club, welcoming members from all walks of life.' },
    { year: 'Present', title: '140+ Years of Legacy', desc: 'Today the club spans 5 acres with over 900 members and reciprocal affiliations with 70+ clubs across India.' },
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Timeline animations
      const items = gsap.utils.toArray('.timeline-item');
      
      items.forEach((item, i) => {
        const isLeft = i % 2 === 0;
        gsap.from(item, {
          x: isLeft ? -100 : 100,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          }
        });
      });

      // Founders animation
      gsap.from('.founder-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.founders-section',
          start: 'top 75%',
        }
      });

      // Journey, Objects & Committee reveals
      gsap.from('.journey-item', {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.journey-grid', start: 'top 80%' },
      });
      gsap.from('.object-card', {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out',
        scrollTrigger: { trigger: '.objects-section', start: 'top 78%' },
      });
      gsap.from('.committee-card', {
        y: 40, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: '.committee-section', start: 'top 80%' },
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div className="heritage-page" ref={containerRef}>
      {/* Hero Section */}
      <section className="heritage-hero">
        <div className="heritage-hero-bg" style={{ backgroundImage: 'url(/images/hero-exterior.jpg)' }}></div>
        <div className="heritage-hero-overlay"></div>
        <motion.div 
          className="heritage-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="heritage-label">OUR STORY</span>
          <h1 className="heritage-title">A Heritage of 140 Years</h1>
          <p className="heritage-subtitle">From a modest tennis pavilion to the Nilgiris' most distinguished club</p>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          {timelineData.map((item, index) => (
            <div key={index} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <span className="timeline-year">{item.year}</span>
                <h3 className="timeline-title">{item.title}</h3>
                <p className="timeline-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founders Section */}
      <section className="founders-section">
        <div className="section-header">
          <h2>The Founding Fathers</h2>
          <div className="header-divider"></div>
        </div>
        
        <div className="founders-grid">
          <div className="founder-card">
            <div className="founder-cameo">
              <svg className="founder-silhouette" viewBox="0 0 250 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Period portrait cameo of General Richard Hamilton — no photograph is known to survive">
                <defs>
                  <radialGradient id="camA-pg" cx="50%" cy="32%" r="82%">
                    <stop offset="0%" stopColor="#f5efe1" /><stop offset="60%" stopColor="#e3d5bc" /><stop offset="100%" stopColor="#cbb590" />
                  </radialGradient>
                  <linearGradient id="camA-vig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="70%" stopColor="#000000" stopOpacity="0" /><stop offset="100%" stopColor="#3a2a1c" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <rect width="250" height="320" fill="url(#camA-pg)" />
                <path transform="translate(28,20) scale(0.78)" fill="#584234" d="M130,42 C156,45 169,68 167,95 C166,114 157,123 153,135 C151,145 155,152 163,158 C183,168 198,185 198,215 L198,286 L44,286 L44,216 C44,186 66,170 91,161 C103,157 107,149 105,138 C97,140 89,137 83,131 C79,127 81,123 78,120 C82,117 82,115 79,112 C73,111 66,111 61,107 C56,103 53,101 53,98 C53,93 63,95 65,89 C64,82 67,75 67,69 C69,60 74,53 86,47 C99,41 114,40 130,42 Z" />
                <rect width="250" height="320" fill="url(#camA-vig)" />
              </svg>
              <span className="founder-cameo-note">No portrait extant · c.&nbsp;1885</span>
            </div>
            <div className="founder-info">
              <h3>General Richard Hamilton</h3>
              <p>Military officer, visionary founder</p>
            </div>
          </div>
          <div className="founder-card">
            <div className="founder-cameo">
              <svg className="founder-silhouette" viewBox="0 0 250 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Period portrait cameo of Charles Thomas Campbell Gray — no photograph is known to survive">
                <defs>
                  <radialGradient id="camB-pg" cx="50%" cy="32%" r="82%">
                    <stop offset="0%" stopColor="#f5efe1" /><stop offset="60%" stopColor="#e3d5bc" /><stop offset="100%" stopColor="#cbb590" />
                  </radialGradient>
                  <linearGradient id="camB-vig" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="70%" stopColor="#000000" stopOpacity="0" /><stop offset="100%" stopColor="#3a2a1c" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <rect width="250" height="320" fill="url(#camB-pg)" />
                <path transform="translate(28,20) scale(0.78)" fill="#584234" d="M130,42 C156,45 169,68 167,95 C166,114 157,123 153,135 C151,145 155,152 163,158 C183,168 198,185 198,215 L198,286 L44,286 L44,216 C44,186 66,170 91,161 C103,157 107,149 105,138 C97,140 89,137 83,131 C79,127 81,123 78,120 C82,117 82,115 79,112 C73,111 66,111 61,107 C56,103 53,101 53,98 C53,93 63,95 65,89 C64,82 67,75 67,69 C69,60 74,53 86,47 C99,41 114,40 130,42 Z" />
                <rect width="250" height="320" fill="url(#camB-vig)" />
              </svg>
              <span className="founder-cameo-note">No portrait extant · c.&nbsp;1885</span>
            </div>
            <div className="founder-info">
              <h3>Charles Thomas Campbell Gray</h3>
              <p>Proprietor of Gray's Hotel, benefactor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey */}
      <section className="journey-section">
        <div className="section-header">
          <h2>Our Journey</h2>
          <div className="header-divider"></div>
        </div>
        <div className="journey-grid">
          {[
            { year: '1885', img: 'club-1885.jpg', text: "Founded as Coonoor's premier social venue." },
            { year: '1902', img: 'club-1902.png', text: 'Colonial clubhouse completed with teak-panelled halls.' },
            { year: '1924', img: 'club-1924.jpg', text: 'Tennis courts inaugurated; the Raj Bar established.' },
            { year: '1947', img: 'club-1947.jpg', text: 'Transitioned to Indian leadership after independence.' },
            { year: '1991', img: 'club-1991.jpg', text: 'Registered under the Tamil Nadu Societies Act (No. 22).' },
            { year: '2026', img: 'club-2026.jpg', text: 'Over 900 members and 80 affiliated clubs across India.' },
          ].map((j) => (
            <div className="journey-item" key={j.year}>
              <div className="journey-img"><img src={`/images/${j.img}`} alt={`Coonoor Club ${j.year}`} loading="lazy" /></div>
              <div className="journey-year">{j.year}</div>
              <p>{j.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Objects of the Club */}
      <section className="objects-section">
        <div className="section-header">
          <h2>Objects of the Club</h2>
          <p className="section-sub">As laid down in the Coonoor Club Bye-Laws, registered under the Tamil Nadu Societies Registration Act.</p>
          <div className="header-divider"></div>
        </div>
        <div className="objects-grid">
          {[
            { icon: '🏛️', title: 'Social & Community', text: 'To provide a club in and around Coonoor for the accommodation of Members and their friends, and for the promotion of entertainments and pastimes.' },
            { icon: '🏆', title: 'Sports & Recreation', text: 'To encourage sports and games — lawn tennis, badminton, billiards and indoor sports — and to organise competitions and sporting meets.' },
            { icon: '🤝', title: 'Affiliated Club Access', text: 'Members enjoy reciprocal access to 80 affiliated clubs across India, on presentation of their Membership Card and letter of introduction.' },
            { icon: '📚', title: 'Culture & Heritage', text: "To preserve the rich cultural heritage of the Nilgiris through the library, cultural evenings and the Club's 139-year colonial legacy." },
          ].map((o) => (
            <div className="object-card" key={o.title}>
              <div className="object-icon">{o.icon}</div>
              <h3>{o.title}</h3>
              <p>{o.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Managing Committee */}
      <section className="committee-section">
        <div className="section-header">
          <h2>Managing Committee</h2>
          <p className="section-sub">The Club is governed by elected Permanent Members who serve voluntarily — elected at the Annual General Meeting and holding office until the next AGM.</p>
          <div className="header-divider"></div>
        </div>
        <div className="committee-grid">
          {[
            { role: 'President' },
            { role: 'Chief Administrative Officer' },
            { role: 'Honorary Secretary' },
            { role: 'Honorary Treasurer' },
          ].map((c) => (
            <div className="committee-card" key={c.role}>
              <div className="committee-crest">⚜</div>
              <h3>{c.role}</h3>
              <p>Elected at AGM</p>
            </div>
          ))}
        </div>
        <p className="committee-note">A Managing Committee of seven members oversees the affairs of the Club.</p>
      </section>
    </div>
  );
};

export default Heritage;
