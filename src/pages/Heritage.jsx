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

      // Values animation
      gsap.from('.value-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.values-section',
          start: 'top 75%',
        }
      });

    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <div className="heritage-page" ref={containerRef}>
      {/* Hero Section */}
      <section className="heritage-hero">
        <div className="heritage-hero-bg" style={{ backgroundImage: 'url(/images/real-exterior-1.jpg)' }}></div>
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
            <div className="founder-image-placeholder"></div>
            <div className="founder-info">
              <h3>General Richard Hamilton</h3>
              <p>Military officer, visionary founder</p>
            </div>
          </div>
          <div className="founder-card">
            <div className="founder-image-placeholder"></div>
            <div className="founder-info">
              <h3>Charles Thomas Campbell Gray</h3>
              <p>Proprietor of Gray's Hotel, benefactor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="section-header">
          <h2>The Spirit of the Club</h2>
          <div className="header-divider"></div>
        </div>
        
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">🏛️</div>
            <h3>Heritage</h3>
            <p>Preserving 140 years of colonial and Indian history</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🤝</div>
            <h3>Community</h3>
            <p>"There are no strangers. Just friends you have not met"</p>
          </div>
          <div className="value-card">
            <div className="value-icon">⭐</div>
            <h3>Excellence</h3>
            <p>Maintaining the highest standards of hospitality</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Heritage;
