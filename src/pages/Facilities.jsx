import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import './Facilities.css';

gsap.registerPlugin(ScrollTrigger);

const facilities = [
  { img: 'club-hall1.jpg', title: 'Banquet & Party Hall', desc: 'A grand teak-panelled hall for receptions, functions and club dinners.' },
  { img: 'club-hall3.jpg', title: 'Grand Banquet Hall', desc: "The club's largest heritage hall for weddings and cultural evenings." },
  { img: 'club-tenniscourt.jpg', title: 'Lawn Tennis Courts', desc: 'The founding sport — grass and hard courts amid the eucalyptus.' },
  { img: 'club-indoorstadium.jpg', title: 'Indoor Badminton Hall', desc: 'A heritage timber-roofed court for year-round play.' },
  { img: 'club-event1.jpg', title: 'Heritage Guest Suites', desc: 'Colonial rooms and cottages with fireplaces and hill views.' },
  { img: 'club-library.jpg', title: 'Reading Room & Library', desc: 'Antique bookshelves, periodicals and quiet armchairs.' },
  { img: 'club-hall2.jpg', title: 'Billiards & Card Room', desc: 'Full-size tables and dedicated rooms for bridge and cards.' },
  { img: 'club-bar.jpg', title: 'The Raj Bar', desc: "The historic members' bar, established 1924." },
  { img: 'club-sitting.jpg', title: 'Sitting Lounges', desc: 'Warm colonial lounges to gather with friends.' },
  { img: 'club-rooftop.jpg', title: 'Rooftop Terrace', desc: 'Open-air views across the red-tiled roofs and hills.' },
];

const galleryImages = [
  'club-fullview.jpg', 'club-entrance.jpg', 'club-portico.jpg', 'club-frontlawn.jpg',
  'club-outsideview.jpg', 'club-bar.jpg', 'club-library.jpg', 'club-hall1.jpg',
  'club-hall3.jpg', 'club-tenniscourt2.jpg', 'club-indoorstadium.jpg', 'club-rooftop.jpg',
  'club-sitting.jpg', 'club-event1.jpg', 'club-event3.jpg',
];

const Facilities = () => {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.fac-hero-content > *', { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.3 });
      gsap.from('.fac-card', {
        y: 50, opacity: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.fac-grid', start: 'top 80%' },
      });
      gsap.from('.fac-marquee', {
        opacity: 0, y: 40, duration: 1,
        scrollTrigger: { trigger: '.fac-gallery', start: 'top 85%' },
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="fac-page" ref={ref}>
      <section className="fac-hero">
        <div className="fac-hero-bg" style={{ backgroundImage: 'url(/images/club-hall3.jpg)' }} />
        <div className="fac-hero-overlay" />
        <motion.div className="fac-hero-content"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <span className="fac-label">EXPLORE THE CLUB</span>
          <h1>Our Facilities</h1>
          <p>Five acres of heritage — halls, courts, lounges and suites, all under one storied roof.</p>
        </motion.div>
      </section>

      <section className="fac-section">
        <div className="fac-grid">
          {facilities.map((f) => (
            <article className="fac-card" key={f.title}>
              <div className="fac-card-img" style={{ backgroundImage: `url(/images/${f.img})` }} />
              <div className="fac-card-body">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="fac-gallery">
        <div className="fac-gallery-header">
          <span className="fac-label">A Glimpse Around</span>
          <h2>Life at the Club</h2>
        </div>
        <div className="fac-marquee">
          <div className="fac-marquee-track">
            {[...galleryImages, ...galleryImages].map((src, i) => (
              <div className="fac-marquee-item" key={i} aria-hidden={i >= galleryImages.length}>
                <img src={`/images/${src}`} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Facilities;
